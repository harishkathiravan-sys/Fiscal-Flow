import { z } from 'zod';

// ─── Create Client ──────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  country: z.string().max(100).default('India'),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional()
    .nullable(),
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')
    .optional()
    .nullable(),
  tan: z.string().max(20).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  website: z.string().url('Invalid URL').optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  contacts: z
    .array(
      z.object({
        name: z.string().min(1, 'Contact name is required').max(200),
        email: z.string().email('Invalid email').optional().nullable(),
        phone: z.string().max(20).optional().nullable(),
        role: z.string().max(100).optional().nullable(),
        isPrimary: z.boolean().default(false),
      }),
    )
    .max(10)
    .optional(),
});

// ─── Update Client ──────────────────────────

export const updateClientSchema = createClientSchema.partial();

// ─── Query Params ───────────────────────────

export const clientQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  tag: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'companyName']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Types ──────────────────────────────────

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientQueryInput = z.infer<typeof clientQuerySchema>;
