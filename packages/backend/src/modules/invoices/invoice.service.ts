import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  RecordPaymentInput,
  RecurringInvoiceInput,
  InvoiceQueryInput,
} from './invoice.validation';

// ─── Errors ─────────────────────────────────

export class InvoiceError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = 'InvoiceError';
  }
}

// ─── Generate Invoice Number ────────────────

async function generateInvoiceNumber(orgId: string): Promise<string> {
  const count = await prisma.invoice.count({ where: { organizationId: orgId } });
  const num = (count + 1).toString().padStart(4, '0');
  return `INV-${num}`;
}

// ─── Calculate Invoice Totals ───────────────

function calculateTotals(
  items: { quantity: number; unitPrice: number; gstRate: number; amount: number }[],
  discountPercent?: number,
) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = discountPercent ? (subtotal * discountPercent) / 100 : 0;
  const taxableAmount = subtotal - discountAmount;

  // Simplified: assume intra-state (CGST + SGST)
  const totalGst = items.reduce((sum, item) => {
    const itemGst = (item.amount * item.gstRate) / 100;
    return sum + itemGst;
  }, 0);

  // Proportionally adjust for discount
  const adjustedGst = discountPercent ? totalGst * (1 - discountPercent / 100) : totalGst;

  return {
    subtotal,
    discountAmount,
    cgst: Number((adjustedGst / 2).toFixed(2)),
    sgst: Number((adjustedGst / 2).toFixed(2)),
    igst: 0,
    totalTax: Number(adjustedGst.toFixed(2)),
    total: Number((taxableAmount + adjustedGst).toFixed(2)),
  };
}

// ─── List Invoices ──────────────────────────

export async function listInvoices(orgId: string, query: InvoiceQueryInput) {
  const { page, limit, search, status, clientId, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.InvoiceWhereInput = {
    organizationId: orgId,
    ...(status && { status }),
    ...(clientId && { clientId }),
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        client: { select: { id: true, name: true, email: true } },
        items: true,
        payments: { select: { amount: true, paymentDate: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
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

// ─── Get Invoice ────────────────────────────

export async function getInvoice(invoiceId: string, orgId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          gstin: true,
          pan: true,
          address: true,
          phone: true,
        },
      },
      items: true,
      payments: { orderBy: { paymentDate: 'desc' } },
      user: { select: { id: true, name: true } },
    },
  });

  if (!invoice) {
    throw new InvoiceError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
  }

  return invoice;
}

// ─── Create Invoice ─────────────────────────

export async function createInvoice(orgId: string, userId: string, data: CreateInvoiceInput) {
  const invoiceNumber = await generateInvoiceNumber(orgId);

  const items = data.items.map((item) => ({
    ...item,
    amount: Number((item.quantity * item.unitPrice).toFixed(2)),
  }));

  const totals = calculateTotals(items, data.discountPercent);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: data.clientId,
      issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
      dueDate: new Date(data.dueDate),
      subtotal: totals.subtotal,
      discountPercent: data.discountPercent || 0,
      discountAmount: totals.discountAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      totalTax: totals.totalTax,
      total: totals.total,
      balanceDue: totals.total,
      notes: data.notes,
      terms: data.terms,
      billingAddress: data.billingAddress,
      shippingAddress: data.shippingAddress,
      organizationId: orgId,
      createdBy: userId,
      items: { createMany: { data: items } },
    },
    include: {
      client: { select: { id: true, name: true } },
      items: true,
    },
  });

  return invoice;
}

// ─── Update Invoice ─────────────────────────

export async function updateInvoice(invoiceId: string, orgId: string, data: UpdateInvoiceInput) {
  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
  });
  if (!existing) throw new InvoiceError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
  if (existing.status === 'PAID')
    throw new InvoiceError('Cannot edit a paid invoice', 400, 'INVOICE_PAID');

  const { items, ...updateData } = data;

  let totals = {};
  if (items) {
    const processedItems = items.map((item) => ({
      ...item,
      amount: Number((item.quantity * item.unitPrice).toFixed(2)),
    }));
    totals = calculateTotals(
      processedItems,
      data.discountPercent ?? existing.discountPercent?.toNumber(),
    );

    // Replace items
    await prisma.invoiceItem.deleteMany({ where: { invoiceId } });
    await prisma.invoiceItem.createMany({
      data: processedItems.map((item) => ({ ...item, invoiceId })),
    });
  }

  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      ...updateData,
      ...(items && items.length > 0 ? totals : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      items: true,
    },
  });

  return invoice;
}

// ─── Delete Invoice ─────────────────────────

export async function deleteInvoice(invoiceId: string, orgId: string) {
  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
  });
  if (!existing) throw new InvoiceError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
  if (existing.status === 'PAID')
    throw new InvoiceError('Cannot delete a paid invoice', 400, 'INVOICE_PAID');

  await prisma.invoice.delete({ where: { id: invoiceId } });
  return { message: 'Invoice deleted successfully' };
}

// ─── Duplicate Invoice ──────────────────────

export async function duplicateInvoice(invoiceId: string, orgId: string, userId: string) {
  const original = await getInvoice(invoiceId, orgId);
  const newInvoiceNumber = await generateInvoiceNumber(orgId);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: newInvoiceNumber,
      clientId: original.clientId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subtotal: original.subtotal,
      discountPercent: original.discountPercent,
      discountAmount: original.discountAmount,
      cgst: original.cgst,
      sgst: original.sgst,
      igst: original.igst,
      totalTax: original.totalTax,
      total: original.total,
      balanceDue: original.total,
      notes: original.notes,
      terms: original.terms,
      billingAddress: original.billingAddress,
      shippingAddress: original.shippingAddress,
      organizationId: orgId,
      createdBy: userId,
      items: {
        createMany: {
          data: original.items.map((item) => ({
            description: item.description,
            hsnCode: item.hsnCode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            gstRate: item.gstRate,
            amount: item.amount,
          })),
        },
      },
    },
    include: {
      client: { select: { id: true, name: true } },
      items: true,
    },
  });

  return invoice;
}

// ─── Record Payment ─────────────────────────

export async function recordPayment(invoiceId: string, orgId: string, data: RecordPaymentInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: orgId },
  });
  if (!invoice) throw new InvoiceError('Invoice not found', 404, 'INVOICE_NOT_FOUND');

  const newAmountPaid = invoice.amountPaid.toNumber() + data.amount;
  const total = invoice.total.toNumber();
  const newStatus = newAmountPaid >= total ? 'PAID' : 'PARTIAL';

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        method: data.method,
        reference: data.reference,
        notes: data.notes,
        invoiceId,
      },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        balanceDue: Math.max(0, total - newAmountPaid),
        status: newStatus,
      },
    }),
  ]);

  return { payment, invoiceStatus: newStatus };
}

// ─── Create Recurring ───────────────────────

export async function createRecurringInvoice(
  orgId: string,
  userId: string,
  data: RecurringInvoiceInput,
) {
  const intervalMap: Record<string, number> = {
    WEEKLY: 7,
    BIWEEKLY: 14,
    MONTHLY: 30,
    QUARTERLY: 90,
    YEARLY: 365,
  };

  const recurring = await prisma.recurringInvoice.create({
    data: {
      frequency: data.frequency,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      nextRunDate: new Date(data.startDate),
      templateData: {
        clientId: data.clientId,
        items: data.items,
        notes: data.notes,
        terms: data.terms,
        billingAddress: data.billingAddress,
      },
      organizationId: orgId,
      createdBy: userId,
    },
  });

  return recurring;
}

// ─── List Recurring ─────────────────────────

export async function listRecurringInvoices(orgId: string) {
  return prisma.recurringInvoice.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { invoices: true } },
      invoices: {
        select: { id: true, invoiceNumber: true, total: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Toggle Recurring ───────────────────────

export async function toggleRecurringInvoice(id: string, orgId: string) {
  const existing = await prisma.recurringInvoice.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!existing) throw new InvoiceError('Recurring invoice not found', 404, 'RECURRING_NOT_FOUND');

  return prisma.recurringInvoice.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
}

// ─── Get Invoice Stats ──────────────────────

export async function getInvoiceStats(orgId: string) {
  const [total, pending, paid, partial, cancelled, overdue] = await Promise.all([
    prisma.invoice.count({ where: { organizationId: orgId } }),
    prisma.invoice.count({ where: { organizationId: orgId, status: 'PENDING' } }),
    prisma.invoice.count({ where: { organizationId: orgId, status: 'PAID' } }),
    prisma.invoice.count({ where: { organizationId: orgId, status: 'PARTIAL' } }),
    prisma.invoice.count({ where: { organizationId: orgId, status: 'CANCELLED' } }),
    prisma.invoice.count({
      where: {
        organizationId: orgId,
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  const totalRevenue = await prisma.invoice.aggregate({
    where: { organizationId: orgId, status: { in: ['PAID', 'PARTIAL'] } },
    _sum: { total: true, amountPaid: true, balanceDue: true },
  });

  return {
    counts: { total, pending, paid, partial, cancelled, overdue },
    revenue: {
      total: totalRevenue._sum.total?.toNumber() || 0,
      collected: totalRevenue._sum.amountPaid?.toNumber() || 0,
      outstanding: totalRevenue._sum.balanceDue?.toNumber() || 0,
    },
  };
}
