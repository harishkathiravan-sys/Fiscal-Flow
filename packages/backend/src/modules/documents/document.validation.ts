import { z } from 'zod';

// ─── Document Type Enum ─────────────────────

export const documentTypeEnum = z.enum([
  'INVOICE',
  'RECEIPT',
  'BILL',
  'PURCHASE_ORDER',
  'BANK_STATEMENT',
  'GST_DOCUMENT',
  'OTHER',
]);

// ─── Create Document ────────────────────────

export const createDocumentSchema = z.object({
  name: z.string().min(1).max(200),
  type: documentTypeEnum.default('OTHER'),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  folderId: z.string().uuid().optional().nullable(),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
  s3Key: z.string().min(1),
});

// ─── Upload Request (get presigned URL) ─────

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024), // 50MB max
  mimeType: z.string().min(1),
});

// ─── Update Document ────────────────────────

export const updateDocumentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: documentTypeEnum.optional(),
  description: z.string().max(2000).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  folderId: z.string().uuid().optional().nullable(),
  isArchived: z.boolean().optional(),
});

// ─── Create Folder ──────────────────────────

export const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: z.string().uuid().optional().nullable(),
});

// ─── Query Params ───────────────────────────

export const documentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: documentTypeEnum.optional(),
  folderId: z.string().uuid().optional().nullable(),
  isArchived: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'fileSize', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Types ──────────────────────────────────

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
