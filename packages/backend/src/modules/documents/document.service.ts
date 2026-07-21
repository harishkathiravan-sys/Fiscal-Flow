import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { uploadToS3, getPresignedUrl, deleteFromS3, generateS3Key } from '../../config/s3';
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateFolderInput,
  DocumentQueryInput,
} from './document.validation';

// ─── Errors ─────────────────────────────────

export class DocumentError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = 'DocumentError';
  }
}

// ─── List Documents ─────────────────────────

export async function listDocuments(orgId: string, query: DocumentQueryInput) {
  const { page, limit, search, type, folderId, isArchived, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.DocumentWhereInput = {
    organizationId: orgId,
    ...(isArchived !== undefined && { isArchived }),
    ...(type && { type }),
    ...(folderId !== undefined && { folderId: folderId || null }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const orderBy: Prisma.DocumentOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        folder: { select: { id: true, name: true } },
        _count: { select: { versions: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);

  // Get presigned URLs for each document
  const docsWithUrls = await Promise.all(
    documents.map(async (doc) => {
      const url = await getPresignedUrl(doc.s3Key, 3600);
      return { ...doc, url };
    }),
  );

  return {
    documents: docsWithUrls,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

// ─── Get Document ───────────────────────────

export async function getDocument(docId: string, orgId: string) {
  const document = await prisma.document.findFirst({
    where: { id: docId, organizationId: orgId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      folder: { select: { id: true, name: true } },
      versions: {
        orderBy: { version: 'desc' },
        select: {
          id: true,
          version: true,
          fileName: true,
          fileSize: true,
          s3Key: true,
          comment: true,
          createdAt: true,
        },
      },
    },
  });

  if (!document) {
    throw new DocumentError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
  }

  const url = await getPresignedUrl(document.s3Key, 3600);

  // Get URLs for all versions
  const versionsWithUrls = await Promise.all(
    document.versions.map(async (v) => {
      const vUrl = await getPresignedUrl(v.s3Key, 3600);
      return { ...v, url: vUrl };
    }),
  );

  return { ...document, url, versions: versionsWithUrls };
}

// ─── Upload (create document record) ────────

export async function createDocument(orgId: string, userId: string, data: CreateDocumentInput) {
  const document = await prisma.document.create({
    data: {
      name: data.name,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      s3Key: data.s3Key,
      s3Bucket: process.env.AWS_S3_BUCKET_NAME || 'fiscalflow-uploads',
      type: data.type,
      description: data.description,
      tags: data.tags || [],
      folderId: data.folderId || null,
      organizationId: orgId,
      uploadedBy: userId,
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      folder: { select: { id: true, name: true } },
    },
  });

  return document;
}

// ─── Update Document ────────────────────────

export async function updateDocument(docId: string, orgId: string, data: UpdateDocumentInput) {
  const existing = await prisma.document.findFirst({
    where: { id: docId, organizationId: orgId },
  });

  if (!existing) {
    throw new DocumentError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
  }

  const document = await prisma.document.update({
    where: { id: docId },
    data,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      folder: { select: { id: true, name: true } },
    },
  });

  return document;
}

// ─── Upload New Version ─────────────────────

export async function uploadNewVersion(
  docId: string,
  orgId: string,
  userId: string,
  file: { buffer: Buffer; fileName: string; fileSize: number; mimeType: string },
  comment?: string,
) {
  const existing = await prisma.document.findFirst({
    where: { id: docId, organizationId: orgId },
    include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
  });

  if (!existing) {
    throw new DocumentError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
  }

  const nextVersion = existing.versions.length > 0 ? existing.versions[0].version + 1 : 1;

  // Upload new file to S3
  const s3Key = generateS3Key(orgId, file.fileName, nextVersion);
  await uploadToS3(s3Key, file.buffer, file.mimeType);

  const result = await prisma.$transaction(async (tx) => {
    // Save old version
    await tx.documentVersion.create({
      data: {
        version: nextVersion - 1 || 1,
        fileName: existing.fileName,
        fileSize: existing.fileSize,
        s3Key: existing.s3Key,
        documentId: docId,
      },
    });

    // Update document with new file
    const updated = await tx.document.update({
      where: { id: docId },
      data: {
        fileName: file.fileName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        s3Key,
      },
    });

    return updated;
  });

  return result;
}

// ─── Delete Document ────────────────────────

export async function deleteDocument(docId: string, orgId: string) {
  const existing = await prisma.document.findFirst({
    where: { id: docId, organizationId: orgId },
  });

  if (!existing) {
    throw new DocumentError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
  }

  // Delete from S3
  await deleteFromS3(existing.s3Key);

  // Also delete all version files from S3
  const versions = await prisma.documentVersion.findMany({ where: { documentId: docId } });
  await Promise.all(versions.map((v) => deleteFromS3(v.s3Key)));

  // Delete from database
  await prisma.document.delete({ where: { id: docId } });

  return { message: 'Document deleted successfully' };
}

// ─── Presigned Upload URL ───────────────────

export async function requestUploadUrl(orgId: string, fileName: string, mimeType: string) {
  const key = generateS3Key(orgId, fileName);
  const url = await getPresignedUrl(key, 300);
  return { uploadUrl: url, key };
}

// ─── Folders ────────────────────────────────

export async function listFolders(orgId: string) {
  const folders = await prisma.documentFolder.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { documents: true, children: true } },
    },
    orderBy: { name: 'asc' },
  });

  return folders;
}

export async function createFolder(orgId: string, data: CreateFolderInput) {
  // Check for duplicate
  const existing = await prisma.documentFolder.findFirst({
    where: {
      organizationId: orgId,
      name: data.name,
      parentId: data.parentId || null,
    },
  });

  if (existing) {
    throw new DocumentError('A folder with this name already exists', 409, 'FOLDER_EXISTS');
  }

  const folder = await prisma.documentFolder.create({
    data: {
      name: data.name,
      parentId: data.parentId || null,
      organizationId: orgId,
    },
  });

  return folder;
}

export async function deleteFolder(folderId: string, orgId: string) {
  const existing = await prisma.documentFolder.findFirst({
    where: { id: folderId, organizationId: orgId },
    include: { _count: { select: { documents: true, children: true } } },
  });

  if (!existing) {
    throw new DocumentError('Folder not found', 404, 'FOLDER_NOT_FOUND');
  }

  if (existing._count.children > 0) {
    throw new DocumentError('Cannot delete folder with subfolders', 400, 'FOLDER_HAS_CHILDREN');
  }

  // Move documents to root
  await prisma.document.updateMany({
    where: { folderId },
    data: { folderId: null },
  });

  await prisma.documentFolder.delete({ where: { id: folderId } });

  return { message: 'Folder deleted successfully' };
}
