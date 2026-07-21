import { getAiProvider } from './providers';
import type {
  AiMessage,
  CategorizeResult,
  LedgerEntrySuggestion,
  DuplicateCheckResult,
  GstFlagResult,
  JournalEntrySuggestion,
  AccountingNotes,
  InvoiceExplanation,
  PaymentReminder,
} from './ai.types';

// ─── System Prompt ──────────────────────────

const SYSTEM_PROMPT = `You are FiscalFlow's AI Accounting Agent — an expert Indian accountant with deep knowledge of:
- GST (Goods and Services Tax) regulations, CGST/SGST/IGST rules
- Double-entry bookkeeping and Indian accounting standards
- Tally-compatible chart of accounts
- HSN/SAC code classification
- TDS/TCS regulations
- Financial statement preparation

Always respond with accurate, actionable financial guidance. When unsure, state your confidence level.
All monetary amounts are in INR (₹) unless specified otherwise.`;

function msgs(userPrompt: string, context?: string): AiMessage[] {
  const messages: AiMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];
  if (context) {
    messages.splice(1, 0, { role: 'user', content: `Context:\n${context}` });
  }
  return messages;
}

// ─── 1. Categorize Expense ──────────────────

export async function categorizeExpense(data: {
  description: string;
  amount?: number;
  vendor?: string;
  existingCategories?: string[];
}): Promise<CategorizeResult> {
  const provider = getAiProvider();

  const prompt = `Categorize this expense into the most appropriate accounting category.

Description: "${data.description}"
${data.amount ? `Amount: ₹${data.amount}` : ''}
${data.vendor ? `Vendor: ${data.vendor}` : ''}

Respond with JSON:
{
  "category": "one of: office_supplies, travel, meals, software, professional_services, rent, utilities, marketing, insurance, taxes, payroll, equipment, maintenance, legal, telecommunications, miscellaneous",
  "confidence": 0.0-1.0,
  "subcategory": "optional more specific category",
  "reason": "brief explanation"
}`;

  return provider.completeJson<CategorizeResult>(msgs(prompt));
}

// ─── 2. Suggest Ledger Entries ──────────────

export async function suggestLedgerEntries(data: {
  transactionDescription: string;
  amount: number;
  date?: string;
  vendor?: string;
  chartOfAccounts?: Array<{ code: string; name: string; type: string }>;
}): Promise<LedgerEntrySuggestion[]> {
  const provider = getAiProvider();

  const accountsList = data.chartOfAccounts
    ? `\nAvailable accounts:\n${data.chartOfAccounts.map((a) => `${a.code} - ${a.name} (${a.type})`).join('\n')}`
    : '';

  const prompt = `Suggest ledger entries for this transaction:

Description: "${data.transactionDescription}"
Amount: ₹${data.amount}
${data.date ? `Date: ${data.date}` : ''}
${data.vendor ? `Vendor: ${data.vendor}` : ''}
${accountsList}

Create proper double-entry bookkeeping entries (debits must equal credits).
Respond with JSON array:
[
  {
    "accountCode": "account code",
    "accountName": "account name",
    "debit": 0,
    "credit": 0,
    "description": "line description",
    "confidence": 0.0-1.0
  }
]`;

  return provider.completeJson<LedgerEntrySuggestion[]>(msgs(prompt));
}

// ─── 3. Detect Duplicate Invoices ───────────

export async function detectDuplicateInvoices(data: {
  currentInvoice: {
    vendor: string;
    invoiceNumber: string;
    amount: number;
    date?: string;
  };
  recentInvoices: Array<{
    documentId: string;
    vendor: string;
    invoiceNumber: string;
    amount: number;
    date: string;
  }>;
}): Promise<DuplicateCheckResult> {
  const provider = getAiProvider();

  const invoiceList = data.recentInvoices
    .map(
      (inv) =>
        `[${inv.documentId}] ${inv.vendor} | Inv# ${inv.invoiceNumber} | ₹${inv.amount} | ${inv.date}`,
    )
    .join('\n');

  const prompt = `Check if this invoice is a duplicate of any recent invoice.

NEW INVOICE:
Vendor: "${data.currentInvoice.vendor}"
Invoice#: "${data.currentInvoice.invoiceNumber}"
Amount: ₹${data.currentInvoice.amount}
${data.currentInvoice.date ? `Date: ${data.currentInvoice.date}` : ''}

RECENT INVOICES:
${invoiceList || 'No recent invoices available.'}

Analyze similarity based on: vendor name, invoice number, amount, and date.
Consider common variations in vendor names and invoice number formats.

Respond with JSON:
{
  "isDuplicate": boolean,
  "confidence": 0.0-1.0,
  "similarInvoices": [
    {
      "documentId": "id",
      "vendor": "vendor name",
      "invoiceNumber": "inv#",
      "amount": 0,
      "similarity": 0.0-1.0
    }
  ],
  "reason": "explanation"
}`;

  return provider.completeJson<DuplicateCheckResult>(msgs(prompt));
}

// ─── 4. Flag Missing GST ────────────────────

export async function flagMissingGst(data: {
  invoice: {
    vendor?: string;
    gstin?: string;
    subtotal?: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    total?: number;
    hsnCode?: string;
    items?: Array<{ description: string; amount: number; hsnCode?: string }>;
  };
}): Promise<GstFlagResult> {
  const provider = getAiProvider();

  const invoice = data.invoice;

  const prompt = `Validate GST compliance for this invoice:

Vendor: "${invoice.vendor || 'Unknown'}"
GSTIN: "${invoice.gstin || 'NOT PROVIDED'}"
Subtotal: ₹${invoice.subtotal || 0}
CGST: ₹${invoice.cgst || 0}
SGST: ₹${invoice.sgst || 0}
IGST: ₹${invoice.igst || 0}
Total: ₹${invoice.total || 0}
${invoice.hsnCode ? `HSN Code: ${invoice.hsnCode}` : ''}
${invoice.items ? `Items:\n${invoice.items.map((i) => `- ${i.description}: ₹${i.amount}${i.hsnCode ? ` (HSN: ${i.hsnCode})` : ''}`).join('\n')}` : ''}

Check for:
1. Missing or invalid GSTIN format (15-char: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric)
2. GST amount mismatches (CGST + SGST should equal tax on subtotal)
3. IGST vs CGST+SGST (IGST used for inter-state, CGST+SGST for intra-state)
4. Missing HSN codes
5. Wrong GST rates (0%, 5%, 12%, 18%, 28%)

Respond with JSON:
{
  "hasGst": boolean,
  "issues": [
    {
      "type": "missing_gstin|invalid_gstin|gst_mismatch|missing_hsn|wrong_rate",
      "severity": "error|warning",
      "message": "description",
      "suggestion": "optional fix"
    }
  ],
  "totalGst": calculated_total_gst,
  "expectedGst": expected_gst_based_on_rate
}`;

  return provider.completeJson<GstFlagResult>(msgs(prompt));
}

// ─── 5. Suggest Journal Entries ─────────────

export async function suggestJournalEntries(data: {
  transactionType: 'purchase' | 'sale' | 'expense' | 'payment' | 'receipt' | 'other';
  description: string;
  amount: number;
  taxAmount?: number;
  vendor?: string;
  client?: string;
  date?: string;
}): Promise<JournalEntrySuggestion> {
  const provider = getAiProvider();

  const prompt = `Suggest a journal entry for this ${data.transactionType} transaction:

Description: "${data.description}"
Amount: ₹${data.amount}${data.taxAmount ? ` (Tax: ₹${data.taxAmount})` : ''}
${data.vendor ? `Vendor: ${data.vendor}` : ''}
${data.client ? `Client: ${data.client}` : ''}
${data.date ? `Date: ${data.date}` : ''}

Create a proper double-entry journal entry with GST handling where applicable.
Use standard Indian accounting format.

Respond with JSON:
{
  "entries": [
    {
      "accountCode": "code",
      "accountName": "name",
      "debit": 0,
      "credit": 0
    }
  ],
  "description": "entry description",
  "reference": "auto-generated reference",
  "confidence": 0.0-1.0
}`;

  return provider.completeJson<JournalEntrySuggestion>(msgs(prompt));
}

// ─── 6. Generate Accounting Notes ───────────

export async function generateAccountingNotes(data: {
  period?: string;
  transactions?: Array<{ description: string; amount: number; category?: string }>;
  financialSummary?: {
    revenue: number;
    expenses: number;
    profit: number;
  };
}): Promise<AccountingNotes> {
  const provider = getAiProvider();

  const txList = data.transactions
    ? data.transactions
        .slice(0, 20)
        .map((t) => `- ${t.description}: ₹${t.amount}${t.category ? ` [${t.category}]` : ''}`)
        .join('\n')
    : '';

  const prompt = `Generate accounting notes for this period.

${data.period ? `Period: ${data.period}` : ''}
${txList ? `\nTransactions:\n${txList}` : ''}
${data.financialSummary ? `\nFinancial Summary:\nRevenue: ₹${data.financialSummary.revenue}\nExpenses: ₹${data.financialSummary.expenses}\nProfit: ₹${data.financialSummary.profit}` : ''}

Provide professional accounting notes suitable for financial review.

Respond with JSON:
{
  "summary": "2-3 sentence financial summary",
  "keyFindings": ["finding 1", "finding 2"],
  "risks": ["risk 1", "risk 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

  return provider.completeJson<AccountingNotes>(msgs(prompt));
}

// ─── 7. Explain Invoice ─────────────────────

export async function explainInvoice(data: {
  rawText?: string;
  vendor?: string;
  invoiceNumber?: string;
  total?: number;
  items?: Array<{ description: string; amount: number; hsnCode?: string }>;
  gst?: { cgst: number; sgst: number; igst: number };
}): Promise<InvoiceExplanation> {
  const provider = getAiProvider();

  const prompt = `Explain this invoice in plain language.

${data.rawText ? `Raw Text:\n${data.rawText.slice(0, 2000)}\n` : ''}
Vendor: "${data.vendor || 'Unknown'}"
Invoice#: "${data.invoiceNumber || 'Unknown'}"
Total: ₹${data.total || 0}
${data.gst ? `GST: CGST ₹${data.gst.cgst} + SGST ₹${data.gst.sgst} + IGST ₹${data.gst.igst}` : ''}
${data.items ? `Items:\n${data.items.map((i) => `- ${i.description}: ₹${i.amount}`).join('\n')}` : ''}

Provide a clear explanation of what this invoice is for, who it's from, and any notable details.
Flag anything unusual.

Respond with JSON:
{
  "vendor": "vendor name",
  "amount": 0,
  "breakdown": { "subtotal": 0, "cgst": 0, "sgst": 0, "igst": 0, "total": 0 },
  "explanation": "plain language explanation",
  "lineItems": [{ "description": "item", "amount": 0, "hsnCode": "optional" }],
  "flags": ["anything unusual"]
}`;

  return provider.completeJson<InvoiceExplanation>(msgs(prompt));
}

// ─── 8. Generate Payment Reminders ──────────

export async function generatePaymentReminders(data: {
  overdueInvoices: Array<{
    clientName: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
  }>;
  tone?: 'professional' | 'friendly' | 'firm';
}): Promise<PaymentReminder[]> {
  const provider = getAiProvider();

  const invoiceList = data.overdueInvoices
    .map(
      (inv) =>
        `- ${inv.clientName} | ${inv.invoiceNumber} | ₹${inv.amount} | Due: ${inv.dueDate} | ${inv.daysOverdue} days overdue`,
    )
    .join('\n');

  const prompt = `Generate payment reminder messages for these overdue invoices:

${invoiceList}

Tone: ${data.tone || 'professional'}
Company: FiscalFlow

Create appropriate reminders based on how overdue each invoice is:
- 1-15 days: Gentle reminder
- 16-45 days: Firm reminder
- 45+ days: Urgent/escalation

For each invoice, generate an email subject and body.

Respond with JSON array:
[
  {
    "clientName": "name",
    "invoiceNumber": "inv#",
    "amount": 0,
    "dueDate": "date",
    "daysOverdue": 0,
    "reminderLevel": "gentle|firm|urgent",
    "message": "short summary",
    "emailSubject": "email subject line",
    "emailBody": "full email body with proper formatting"
  }
]`;

  return provider.completeJson<PaymentReminder[]>(msgs(prompt));
}

// ─── 9. Chat (General Accounting Q&A) ──────

export async function chat(data: { message: string; context?: string }): Promise<string> {
  const provider = getAiProvider();

  const messages: AiMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }];

  if (data.context) {
    messages.push({ role: 'user', content: `Context:\n${data.context}` });
    messages.push({ role: 'assistant', content: 'I have the context. How can I help?' });
  }

  messages.push({ role: 'user', content: data.message });

  return provider.complete(messages);
}
