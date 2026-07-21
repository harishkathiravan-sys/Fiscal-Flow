import { prisma } from '../../config/database';
import type { ExpenseCategory } from '@prisma/client';

export class ExpenseError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = 'ExpenseError';
  }
}

export async function listExpenses(orgId: string, query: any) {
  const { page = 1, limit = 20, search, category, startDate, endDate, vendor } = query;
  const skip = (page - 1) * limit;

  const where: any = { organizationId: orgId };
  if (category) where.category = category;
  if (vendor) where.vendor = { contains: vendor, mode: 'insensitive' };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { vendor: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({ where, orderBy: { date: 'desc' }, skip, take: limit }),
    prisma.expense.count({ where }),
  ]);

  return {
    expenses,
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

export async function createExpense(orgId: string, userId: string, data: any) {
  return prisma.expense.create({
    data: { ...data, organizationId: orgId, createdBy: userId },
  });
}

export async function updateExpense(id: string, orgId: string, data: any) {
  const existing = await prisma.expense.findFirst({ where: { id, organizationId: orgId } });
  if (!existing) throw new ExpenseError('Expense not found', 404, 'NOT_FOUND');
  return prisma.expense.update({ where: { id }, data });
}

export async function deleteExpense(id: string, orgId: string) {
  const existing = await prisma.expense.findFirst({ where: { id, organizationId: orgId } });
  if (!existing) throw new ExpenseError('Expense not found', 404, 'NOT_FOUND');
  await prisma.expense.delete({ where: { id } });
  return { message: 'Expense deleted' };
}

export async function getExpenseStats(orgId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [monthTotal, yearTotal, byCategory, byMonth] = await Promise.all([
    prisma.expense.aggregate({
      where: { organizationId: orgId, date: { gte: monthStart } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { organizationId: orgId, date: { gte: yearStart } },
      _sum: { amount: true },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      where: { organizationId: orgId, date: { gte: yearStart } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.expense.groupBy({
      by: ['date'],
      where: { organizationId: orgId, date: { gte: yearStart } },
      _sum: { amount: true },
      orderBy: { date: 'asc' },
    }),
  ]);

  return {
    monthTotal: monthTotal._sum.amount?.toNumber() || 0,
    yearTotal: yearTotal._sum.amount?.toNumber() || 0,
    byCategory: byCategory.map((c) => ({
      category: c.category,
      total: c._sum.amount?.toNumber() || 0,
      count: c._count,
    })),
    byMonth: byMonth.map((m) => ({
      month: m.date.toISOString().slice(0, 7),
      total: m._sum.amount?.toNumber() || 0,
    })),
  };
}

export async function getVendorHistory(orgId: string) {
  return prisma.expense.groupBy({
    by: ['vendor'],
    where: { organizationId: orgId, vendor: { not: null } },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
    take: 20,
  });
}

export async function getMonthlyReport(orgId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const [expenses, byCategory, total] = await Promise.all([
    prisma.expense.findMany({
      where: { organizationId: orgId, date: { gte: start, lte: end } },
      orderBy: { date: 'desc' },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      where: { organizationId: orgId, date: { gte: start, lte: end } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { organizationId: orgId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  return { expenses, byCategory, total: total._sum.amount?.toNumber() || 0, year, month };
}
