// ─── Core AI Types ──────────────────────────

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiProvider {
  name: 'openai' | 'gemini';
  complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<string>;
  completeJson<T = any>(messages: AiMessage[], options?: AiCompletionOptions): Promise<T>;
}

// ─── Expense Categories ─────────────────────

export type ExpenseCategory =
  | 'office_supplies'
  | 'travel'
  | 'meals'
  | 'software'
  | 'professional_services'
  | 'rent'
  | 'utilities'
  | 'marketing'
  | 'insurance'
  | 'taxes'
  | 'payroll'
  | 'equipment'
  | 'maintenance'
  | 'legal'
  | 'telecommunications'
  | 'miscellaneous';

// ─── Agent Results ──────────────────────────

export interface CategorizeResult {
  category: ExpenseCategory;
  confidence: number;
  subcategory?: string;
  reason: string;
}

export interface LedgerEntrySuggestion {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  confidence: number;
}

export interface DuplicateCheckResult {
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

export interface GstFlagResult {
  hasGst: boolean;
  issues: Array<{
    type: 'missing_gstin' | 'invalid_gstin' | 'gst_mismatch' | 'missing_hsn' | 'wrong_rate';
    severity: 'error' | 'warning';
    message: string;
    suggestion?: string;
  }>;
  totalGst: number;
  expectedGst: number;
}

export interface JournalEntrySuggestion {
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
  breakdown: {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
  explanation: string;
  lineItems: Array<{
    description: string;
    amount: number;
    hsnCode?: string;
  }>;
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

// ─── Agent Request/Response ─────────────────

export interface AgentRequest {
  action: string;
  data: Record<string, any>;
}

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  provider: string;
  tokensUsed?: number;
}
