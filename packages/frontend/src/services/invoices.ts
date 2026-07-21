import { api, getAccessToken } from './api';

// ─── Types ──────────────────────────────────

export type InvoiceStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';

export interface InvoiceItem {
  id?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  clientId: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discountPercent?: number;
  discountAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  terms?: string;
  billingAddress?: string;
  shippingAddress?: string;
  recurring: boolean;
  createdAt: string;
  client: { id: string; name: string; email?: string; gstin?: string; address?: string };
  items: InvoiceItem[];
  payments?: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    method?: string;
    reference?: string;
  }>;
}

export interface InvoiceStats {
  counts: {
    total: number;
    pending: number;
    paid: number;
    partial: number;
    cancelled: number;
    overdue: number;
  };
  revenue: { total: number; collected: number; outstanding: number };
}

export interface RecurringInvoice {
  id: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  isActive: boolean;
  _count: { invoices: number };
}

export interface CreateInvoicePayload {
  clientId: string;
  issueDate?: string;
  dueDate: string;
  discountPercent?: number;
  notes?: string;
  terms?: string;
  billingAddress?: string;
  items: Array<{
    description: string;
    hsnCode?: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
  }>;
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  clientId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  PARTIAL: 'Partial',
  CANCELLED: 'Cancelled',
};

// ─── API Functions ──────────────────────────

export const invoicesApi = {
  list: (params: InvoiceQueryParams = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
    });
    const qs = sp.toString();
    return api<any>(`/invoices${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => api<{ invoice: Invoice }>(`/invoices/${id}`),

  create: (data: CreateInvoicePayload) =>
    api<{ message: string; invoice: Invoice }>('/invoices', { method: 'POST', body: data }),

  update: (id: string, data: Partial<CreateInvoicePayload & { status: InvoiceStatus }>) =>
    api<{ message: string; invoice: Invoice }>(`/invoices/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => api<{ message: string }>(`/invoices/${id}`, { method: 'DELETE' }),

  duplicate: (id: string) =>
    api<{ message: string; invoice: Invoice }>(`/invoices/${id}/duplicate`, { method: 'POST' }),

  recordPayment: (
    id: string,
    data: { amount: number; paymentDate?: string; method?: string; reference?: string },
  ) =>
    api<{ message: string; invoiceStatus: string }>(`/invoices/${id}/payments`, {
      method: 'POST',
      body: data,
    }),

  stats: () => api<InvoiceStats>('/invoices/stats'),

  email: (id: string, data: { to: string; subject?: string; message?: string }) =>
    api<{ message: string }>(`/invoices/${id}/email`, { method: 'POST', body: data }),

  downloadPdf: async (id: string) => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const token = getAccessToken();
    const response = await fetch(`${API_BASE}/invoices/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to download PDF');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  recurring: () => api<{ recurring: RecurringInvoice[] }>('/invoices/recurring'),

  createRecurring: (data: {
    clientId: string;
    frequency: string;
    startDate: string;
    items: any[];
  }) =>
    api<{ message: string; recurring: RecurringInvoice }>('/invoices/recurring', {
      method: 'POST',
      body: data,
    }),

  toggleRecurring: (id: string) =>
    api<{ recurring: RecurringInvoice }>(`/invoices/recurring/${id}/toggle`, { method: 'PATCH' }),
};
