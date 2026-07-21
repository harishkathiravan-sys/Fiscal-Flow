import { prisma } from '../../config/database';

export class BankError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = 'BankError';
  }
}

// ─── Parse CSV Bank Statement ───────────────

export function parseCsvStatement(
  csvText: string,
): Array<{ date: string; description: string; amount: number; balance?: number }> {
  const lines = csvText.split('\n').filter((l) => l.trim());
  if (lines.length < 2)
    throw new BankError('CSV file is empty or has no data rows', 400, 'EMPTY_FILE');

  // Find header row (skip metadata rows)
  let headerIdx = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].toLowerCase().includes('date') || lines[i].toLowerCase().includes('narration')) {
      headerIdx = i;
      break;
    }
  }

  const headers = lines[headerIdx]
    .split(',')
    .map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const descIdx = headers.findIndex(
    (h) => h.includes('narration') || h.includes('description') || h.includes('particulars'),
  );
  const debitIdx = headers.findIndex((h) => h.includes('debit') || h.includes('withdrawal'));
  const creditIdx = headers.findIndex((h) => h.includes('credit') || h.includes('deposit'));
  const balanceIdx = headers.findIndex((h) => h.includes('balance'));

  const transactions: Array<{
    date: string;
    description: string;
    amount: number;
    balance?: number;
  }> = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''));
    if (cells.length < 3) continue;

    const dateStr = cells[dateIdx] || '';
    const description = cells[descIdx] || cells[1] || '';
    const debit = debitIdx >= 0 ? parseFloat(cells[debitIdx]?.replace(/,/g, '') || '0') || 0 : 0;
    const credit = creditIdx >= 0 ? parseFloat(cells[creditIdx]?.replace(/,/g, '') || '0') || 0 : 0;
    const amount = credit - debit;
    const balance =
      balanceIdx >= 0
        ? parseFloat(cells[balanceIdx]?.replace(/,/g, '') || '0') || undefined
        : undefined;

    if (description && amount !== 0) {
      transactions.push({ date: dateStr, description, amount, balance });
    }
  }

  return transactions;
}

// ─── Parse PDF Bank Statement (text extract) ──

export function parsePdfStatement(
  text: string,
): Array<{ date: string; description: string; amount: number; balance?: number }> {
  const lines = text.split('\n');
  const transactions: Array<{
    date: string;
    description: string;
    amount: number;
    balance?: number;
  }> = [];

  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const amountPattern = /(?:₹|Rs\.?|INR)\s*([\d,]+\.?\d*)/;

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;

    const amountMatches = [...line.matchAll(/[-+]?[\d,]+\.?\d*/g)];
    if (amountMatches.length === 0) continue;

    const dateStr = dateMatch[1];
    const amounts = amountMatches.map((m) => parseFloat(m[0].replace(/,/g, '')));
    const amount = amounts.find((a) => a !== 0) || 0;
    const description = line
      .replace(datePattern, '')
      .replace(amountPattern, '')
      .trim()
      .slice(0, 200);
    const balance = amounts.length > 1 ? amounts[amounts.length - 1] : undefined;

    if (description.length > 3) {
      transactions.push({ date: dateStr, description, amount, balance });
    }
  }

  return transactions;
}

// ─── Categorize Transaction ─────────────────

function categorizeTransaction(
  description: string,
  amount: number,
): { category: string; vendor: string; isSubscription: boolean } {
  const desc = description.toLowerCase();
  const subscriptionPatterns = [
    /netflix|spotify|youtube\s*premium|amazon\s*prime|hotstar|zee5|adobe|canva|github|slack|zoom|notion|dropbox|google\s*one|microsoft\s*365/i,
  ];
  const isSubscription = subscriptionPatterns.some((p) => p.test(desc));

  let category = 'EXPENSE';
  if (amount > 0) category = 'INCOME';
  if (/salary|payroll|wage/i.test(desc)) category = 'PAYROLL';
  if (/emi|loan|interest/i.test(desc)) category = 'LOAN';
  if (/tax|gst|tds|gst\s*paid/i.test(desc)) category = 'TAX';
  if (/fee|charge|bank\s*charge/i.test(desc)) category = 'FEE';
  if (/transfer|neft|imps|upi\s*to/i.test(desc)) category = 'TRANSFER';
  if (isSubscription) category = 'SUBSCRIPTION';

  const vendor = description.split(/[-–]/)[0].trim().slice(0, 100);
  return { category, vendor, isSubscription };
}

// ─── Import Bank Transactions ───────────────

export async function importTransactions(
  orgId: string,
  userId: string,
  fileName: string,
  fileType: string,
  transactions: Array<{ date: string; description: string; amount: number; balance?: number }>,
) {
  const import_ = await prisma.bankImport.create({
    data: {
      fileName,
      fileType,
      rowCount: transactions.length,
      organizationId: orgId,
      importedBy: userId,
    },
  });

  const created = await prisma.$transaction(
    transactions.map((t) => {
      const { category, vendor, isSubscription } = categorizeTransaction(t.description, t.amount);
      return prisma.bankTransaction.create({
        data: {
          transactionDate: new Date(t.date),
          description: t.description,
          amount: t.amount,
          balance: t.balance,
          category: category as any,
          vendor,
          isSubscription,
          organizationId: orgId,
        },
      });
    }),
  );

  return { import: import_, count: created.length };
}

// ─── List & Analyze ─────────────────────────

export async function listTransactions(orgId: string, query: any) {
  const { page = 1, limit = 50, category, startDate, endDate, search } = query;
  const skip = (page - 1) * limit;
  const where: any = { organizationId: orgId };
  if (category) where.category = category;
  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) where.transactionDate.gte = new Date(startDate);
    if (endDate) where.transactionDate.lte = new Date(endDate);
  }
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { vendor: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.bankTransaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.bankTransaction.count({ where }),
  ]);

  return { transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getSubscriptions(orgId: string) {
  return prisma.bankTransaction.findMany({
    where: { organizationId: orgId, isSubscription: true },
    orderBy: { transactionDate: 'desc' },
    take: 50,
  });
}

export async function getInsights(orgId: string) {
  const [totalIncome, totalExpense, subscriptions, monthlyData] = await Promise.all([
    prisma.bankTransaction.aggregate({
      where: { organizationId: orgId, amount: { gt: 0 } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.bankTransaction.aggregate({
      where: { organizationId: orgId, amount: { lt: 0 } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.bankTransaction.aggregate({
      where: { organizationId: orgId, isSubscription: true },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.bankTransaction.groupBy({
      by: ['category'],
      where: { organizationId: orgId, amount: { lt: 0 } },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    totalIncome: totalIncome._sum.amount?.toNumber() || 0,
    totalExpense: Math.abs(totalExpense._sum.amount?.toNumber() || 0),
    subscriptionTotal: Math.abs(subscriptions._sum.amount?.toNumber() || 0),
    subscriptionCount: subscriptions._count,
    categoryBreakdown: monthlyData.map((m) => ({
      category: m.category,
      total: Math.abs(m._sum.amount?.toNumber() || 0),
      count: m._count,
    })),
  };
}
