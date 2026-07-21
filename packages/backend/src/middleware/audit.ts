import { prisma } from '../config/database';
import type { Request } from 'express';

// ─── Audit Log ──────────────────────────────

export async function logAudit(params: {
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  req?: Request;
  userId: string;
  organizationId: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes || undefined,
        ipAddress: params.req?.ip || null,
        userAgent: params.req?.headers['user-agent'] || null,
        userId: params.userId,
        organizationId: params.organizationId,
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

// ─── Activity Log ───────────────────────────

export async function logActivity(params: {
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  userId: string;
  organizationId: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        type: params.type,
        title: params.title,
        description: params.description,
        metadata: params.metadata || undefined,
        userId: params.userId,
        organizationId: params.organizationId,
      },
    });
  } catch (err) {
    console.error('Activity log failed:', err);
  }
}

// ─── Get Audit Logs ─────────────────────────

export async function getAuditLogs(
  orgId: string,
  options: {
    page?: number;
    limit?: number;
    entityType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {},
) {
  const { page = 1, limit = 50, entityType, userId, startDate, endDate } = options;
  const skip = (page - 1) * limit;

  const where: any = { organizationId: orgId };
  if (entityType) where.entityType = entityType;
  if (userId) where.userId = userId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── Get Activity Logs ──────────────────────

export async function getActivityLogs(orgId: string, limit = 20) {
  return prisma.activityLog.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
