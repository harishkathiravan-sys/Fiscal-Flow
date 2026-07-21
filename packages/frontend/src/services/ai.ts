import { api } from './api';

// ─── Types ──────────────────────────────────

export interface AiResponse<T> {
  success: boolean;
  data: T;
}

export interface CategorizeResult {
  category: string;
  confidence: number;
  subcategory?: string;
  reason: string;
}

export interface LedgerEntry {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  confidence: number;
}

export interface DuplicateCheck {
  isDuplicate: boolean;
  confidence: number;
  similarInvoices: Array<{
    documentId: string;
    vendor: string;
    invoiceNumber: string;
    amount: number;
    similarity: number;
  }>;
  reason: string;
}

export interface GstFlag {
  hasGst: boolean;
  issues: Array<{
    type: string;
    severity: 'error' | 'warning';
    message: string;
    suggestion?: string;
  }>;
  totalGst: number;
  expectedGst: number;
}

export interface JournalEntry {
  entries: Array<{
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
  }>;
  description: string;
  reference: string;
  confidence: number;
}

export interface AccountingNotes {
  summary: string;
  keyFindings: string[];
  risks: string[];
  recommendations: string[];
}

export interface InvoiceExplanation {
  vendor: string;
  amount: number;
  breakdown: { subtotal: number; cgst: number; sgst: number; igst: number; total: number };
  explanation: string;
  lineItems: Array<{ description: string; amount: number; hsnCode?: string }>;
  flags: string[];
}

export interface PaymentReminder {
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  reminderLevel: 'gentle' | 'firm' | 'urgent';
  message: string;
  emailSubject: string;
  emailBody: string;
}

// ─── API Functions ──────────────────────────

export const aiApi = {
  categorize: (data: { description: string; amount?: number; vendor?: string }) =>
    api<AiResponse<CategorizeResult>>('/ai/categorize', { method: 'POST', body: data }),

  ledgerEntries: (data: {
    transactionDescription: string;
    amount: number;
    date?: string;
    vendor?: string;
  }) => api<AiResponse<LedgerEntry[]>>('/ai/ledger-entries', { method: 'POST', body: data }),

  checkDuplicates: (data: {
    currentInvoice: { vendor: string; invoiceNumber: string; amount: number; date?: string };
    recentInvoices: Array<{
      documentId: string;
      vendor: string;
      invoiceNumber: string;
      amount: number;
      date: string;
    }>;
  }) => api<AiResponse<DuplicateCheck>>('/ai/check-duplicates', { method: 'POST', body: data }),

  flagGst: (data: {
    invoice: {
      vendor?: string;
      gstin?: string;
      subtotal?: number;
      cgst?: number;
      sgst?: number;
      igst?: number;
      total?: number;
      hsnCode?: string;
    };
  }) => api<AiResponse<GstFlag>>('/ai/flag-gst', { method: 'POST', body: data }),

  journalEntry: (data: {
    transactionType: string;
    description: string;
    amount: number;
    taxAmount?: number;
    vendor?: string;
  }) => api<AiResponse<JournalEntry>>('/ai/journal-entry', { method: 'POST', body: data }),

  accountingNotes: (data: {
    period?: string;
    financialSummary?: { revenue: number; expenses: number; profit: number };
  }) => api<AiResponse<AccountingNotes>>('/ai/accounting-notes', { method: 'POST', body: data }),

  explainInvoice: (data: {
    vendor?: string;
    invoiceNumber?: string;
    total?: number;
    gst?: { cgst: number; sgst: number; igst: number };
  }) => api<AiResponse<InvoiceExplanation>>('/ai/explain-invoice', { method: 'POST', body: data }),

  paymentReminders: (data: {
    overdueInvoices: Array<{
      clientName: string;
      invoiceNumber: string;
      amount: number;
      dueDate: string;
      daysOverdue: number;
    }>;
    tone?: string;
  }) => api<AiResponse<PaymentReminder[]>>('/ai/payment-reminders', { method: 'POST', body: data }),

  chat: (data: { message: string; context?: string }) =>
    api<AiResponse<{ response: string }>>('/ai/chat', { method: 'POST', body: data }),
};
