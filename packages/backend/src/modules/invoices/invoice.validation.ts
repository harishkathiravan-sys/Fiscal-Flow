import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  hsnCode: z.string().max(20).optional(),
  quantity: z.coerce.number().positive().default(1),
  unitPrice: z.coerce.number().positive(),
  gstRate: z.coerce.number().min(0).max(100).default(0),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  issueDate: z.string().optional(),
  dueDate: z.string(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  terms: z.string().max(2000).optional(),
  billingAddress: z.string().max(500).optional(),
  shippingAddress: z.string().max(500).optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'CANCELLED']).optional(),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentDate: z.string().optional(),
  method: z.string().max(50).optional(),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const recurringInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string(),
  endDate: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
  notes: z.string().max(2000).optional(),
  terms: z.string().max(2000).optional(),
  billingAddress: z.string().max(500).optional(),
});

export const emailInvoiceSchema = z.object({
  to: z.string().email(),
  cc: z.string().email().optional(),
  subject: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
});

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'CANCELLED']).optional(),
  clientId: z.string().uuid().optional(),
  sortBy: z
    .enum(['invoiceNumber', 'issueDate', 'dueDate', 'total', 'status', 'createdAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type RecurringInvoiceInput = z.infer<typeof recurringInvoiceSchema>;
export type EmailInvoiceInput = z.infer<typeof emailInvoiceSchema>;
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;
