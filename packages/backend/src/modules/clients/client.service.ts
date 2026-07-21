import { Prisma, type Role } from '@prisma/client';
import { prisma } from '../../config/database';
import type { CreateClientInput, UpdateClientInput, ClientQueryInput } from './client.validation';

// ─── Errors ─────────────────────────────────

export class ClientError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = 'ClientError';
  }
}

// ─── List Clients ───────────────────────────

export async function listClients(orgId: string, query: ClientQueryInput) {
  const { page, limit, search, isActive, tag, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.ClientWhereInput = {
    organizationId: orgId,
    ...(isActive !== undefined && { isActive }),
    ...(tag && { tags: { some: { name: tag } } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
        { pan: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const orderBy: Prisma.ClientOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        tags: { select: { id: true, name: true, color: true } },
        contacts: {
          select: { id: true, name: true, email: true, phone: true, role: true, isPrimary: true },
        },
        _count: { select: { contacts: true, tags: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    clients,
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

// ─── Get Client ─────────────────────────────

export async function getClient(clientId: string, orgId: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, organizationId: orgId },
    include: {
      tags: { select: { id: true, name: true, color: true } },
      contacts: {
        orderBy: { isPrimary: 'desc' },
        select: { id: true, name: true, email: true, phone: true, role: true, isPrimary: true },
      },
      organization: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!client) {
    throw new ClientError('Client not found', 404, 'CLIENT_NOT_FOUND');
  }

  return client;
}

// ─── Create Client ──────────────────────────

export async function createClient(orgId: string, userId: string, data: CreateClientInput) {
  const { tags, contacts, ...clientData } = data;

  // Check duplicate GSTIN
  if (clientData.gstin) {
    const existing = await prisma.client.findFirst({
      where: { gstin: clientData.gstin, organizationId: orgId },
    });
    if (existing) {
      throw new ClientError('A client with this GSTIN already exists', 409, 'GSTIN_EXISTS');
    }
  }

  // Check duplicate PAN
  if (clientData.pan) {
    const existing = await prisma.client.findFirst({
      where: { pan: clientData.pan, organizationId: orgId },
    });
    if (existing) {
      throw new ClientError('A client with this PAN already exists', 409, 'PAN_EXISTS');
    }
  }

  const client = await prisma.client.create({
    data: {
      ...clientData,
      organizationId: orgId,
      createdBy: userId,
      ...(tags &&
        tags.length > 0 && {
          tags: { createMany: { data: tags.map((name) => ({ name })) } },
        }),
      ...(contacts &&
        contacts.length > 0 && {
          contacts: { createMany: { data: contacts } },
        }),
    },
    include: {
      tags: { select: { id: true, name: true, color: true } },
      contacts: {
        select: { id: true, name: true, email: true, phone: true, role: true, isPrimary: true },
      },
    },
  });

  return client;
}

// ─── Update Client ──────────────────────────

export async function updateClient(clientId: string, orgId: string, data: UpdateClientInput) {
  const existing = await prisma.client.findFirst({
    where: { id: clientId, organizationId: orgId },
  });

  if (!existing) {
    throw new ClientError('Client not found', 404, 'CLIENT_NOT_FOUND');
  }

  const { tags, contacts, ...updateData } = data;

  // Check GSTIN uniqueness if changed
  if (updateData.gstin && updateData.gstin !== existing.gstin) {
    const dup = await prisma.client.findFirst({
      where: { gstin: updateData.gstin, organizationId: orgId, id: { not: clientId } },
    });
    if (dup) {
      throw new ClientError('A client with this GSTIN already exists', 409, 'GSTIN_EXISTS');
    }
  }

  // Check PAN uniqueness if changed
  if (updateData.pan && updateData.pan !== existing.pan) {
    const dup = await prisma.client.findFirst({
      where: { pan: updateData.pan, organizationId: orgId, id: { not: clientId } },
    });
    if (dup) {
      throw new ClientError('A client with this PAN already exists', 409, 'PAN_EXISTS');
    }
  }

  const client = await prisma.$transaction(async (tx) => {
    // Update base fields
    const updated = await tx.client.update({
      where: { id: clientId },
      data: updateData,
    });

    // Replace tags if provided
    if (tags !== undefined) {
      await tx.clientTag.deleteMany({ where: { clientId } });
      if (tags.length > 0) {
        await tx.clientTag.createMany({
          data: tags.map((name) => ({ name, clientId })),
        });
      }
    }

    // Replace contacts if provided
    if (contacts !== undefined) {
      await tx.clientContact.deleteMany({ where: { clientId } });
      if (contacts.length > 0) {
        await tx.clientContact.createMany({
          data: contacts.map((c) => ({ ...c, clientId })),
        });
      }
    }

    // Fetch complete client
    return tx.client.findUnique({
      where: { id: clientId },
      include: {
        tags: { select: { id: true, name: true, color: true } },
        contacts: {
          orderBy: { isPrimary: 'desc' },
          select: { id: true, name: true, email: true, phone: true, role: true, isPrimary: true },
        },
      },
    });
  });

  return client;
}

// ─── Delete Client ──────────────────────────

export async function deleteClient(clientId: string, orgId: string) {
  const existing = await prisma.client.findFirst({
    where: { id: clientId, organizationId: orgId },
  });

  if (!existing) {
    throw new ClientError('Client not found', 404, 'CLIENT_NOT_FOUND');
  }

  await prisma.client.delete({ where: { id: clientId } });
  return { message: 'Client deleted successfully' };
}

// ─── Get All Tags (for filter dropdown) ─────

export async function getClientTags(orgId: string) {
  const tags = await prisma.clientTag.groupBy({
    by: ['name', 'color'],
    where: { client: { organizationId: orgId } },
    _count: true,
    orderBy: { _count: { name: 'desc' } },
  });

  return tags.map((t) => ({
    name: t.name,
    color: t.color,
    count: t._count,
  }));
}
