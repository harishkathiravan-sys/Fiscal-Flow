import { prisma } from '../../config/database';

export async function getProfitAndLoss(orgId: string, startDate: Date, endDate: Date) {
  const [revenue, expenses] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: { in: ['PAID', 'PARTIAL'] },
        issueDate: { gte: startDate, lte: endDate },
      },
      _sum: { total: true, cgst: true, sgst: true, igst: true },
    }),
    prisma.expense.aggregate({
      where: { organizationId: orgId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true, gstAmount: true },
    }),
  ]);

  const totalRevenue = revenue._sum.total?.toNumber() || 0;
  const totalExpenses = expenses._sum.amount?.toNumber() || 0;
  const grossProfit = totalRevenue - totalExpenses;
  const taxCollected =
    (revenue._sum.cgst?.toNumber() || 0) +
    (revenue._sum.sgst?.toNumber() || 0) +
    (revenue._sum.igst?.toNumber() || 0);

  return {
    period: { start: startDate.toISOString(), end: endDate.toISOString() },
    revenue: { total: totalRevenue, taxCollected },
    expenses: { total: totalExpenses, gstPaid: expenses._sum.gstAmount?.toNumber() || 0 },
    netProfit: grossProfit,
    profitMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0',
  };
}

export async function getBalanceSheet(orgId: string) {
  const [invoices, expenses, payments] = await Promise.all([
    prisma.invoice.aggregate({
      where: { organizationId: orgId },
      _sum: { total: true, amountPaid: true, balanceDue: true },
    }),
    prisma.expense.aggregate({ where: { organizationId: orgId }, _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { invoice: { organizationId: orgId } },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = invoices._sum.total?.toNumber() || 0;
  const accountsReceivable = invoices._sum.balanceDue?.toNumber() || 0;
  const cashReceived = payments._sum.amount?.toNumber() || 0;
  const totalExpenses = expenses._sum.amount?.toNumber() || 0;

  return {
    assets: {
      cash: Math.max(0, cashReceived - totalExpenses),
      accountsReceivable,
      totalAssets: cashReceived - totalExpenses + accountsReceivable,
    },
    liabilities: { accountsPayable: 0, gstPayable: 0, totalLiabilities: 0 },
    equity: {
      retainedEarnings: totalRevenue - totalExpenses,
      totalEquity: totalRevenue - totalExpenses,
    },
    totalLiabilitiesAndEquity: totalRevenue - totalExpenses,
  };
}

export async function getCashFlow(orgId: string, startDate: Date, endDate: Date) {
  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { invoice: { organizationId: orgId }, paymentDate: { gte: startDate, lte: endDate } },
      select: { amount: true, paymentDate: true },
      orderBy: { paymentDate: 'asc' },
    }),
    prisma.expense.findMany({
      where: { organizationId: orgId, date: { gte: startDate, lte: endDate } },
      select: { amount: true, date: true },
      orderBy: { date: 'asc' },
    }),
  ]);

  const monthly = new Map<string, { inflow: number; outflow: number }>();
  payments.forEach((p) => {
    const key = p.paymentDate.toISOString().slice(0, 7);
    const curr = monthly.get(key) || { inflow: 0, outflow: 0 };
    curr.inflow += p.amount.toNumber();
    monthly.set(key, curr);
  });
  expenses.forEach((e) => {
    const key = e.date.toISOString().slice(0, 7);
    const curr = monthly.get(key) || { inflow: 0, outflow: 0 };
    curr.outflow += e.amount.toNumber();
    monthly.set(key, curr);
  });

  const totalInflow = payments.reduce((s, p) => s + p.amount.toNumber(), 0);
  const totalOutflow = expenses.reduce((s, e) => s + e.amount.toNumber(), 0);

  return {
    period: { start: startDate.toISOString(), end: endDate.toISOString() },
    summary: { totalInflow, totalOutflow, netCashFlow: totalInflow - totalOutflow },
    monthly: Array.from(monthly.entries()).map(([month, data]) => ({
      month,
      ...data,
      net: data.inflow - data.outflow,
    })),
  };
}

export async function getExpenseAnalysis(orgId: string, startDate: Date, endDate: Date) {
  const [byCategory, byVendor, byMonth] = await Promise.all([
    prisma.expense.groupBy({
      by: ['category'],
      where: { organizationId: orgId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.expense.groupBy({
      by: ['vendor'],
      where: {
        organizationId: orgId,
        vendor: { not: null },
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: 10,
    }),
    prisma.expense.groupBy({
      by: ['date'],
      where: { organizationId: orgId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
      orderBy: { date: 'asc' },
    }),
  ]);

  const total = await prisma.expense.aggregate({
    where: { organizationId: orgId, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  });

  return {
    total: total._sum.amount?.toNumber() || 0,
    byCategory: byCategory.map((c) => ({
      category: c.category,
      total: c._sum.amount?.toNumber() || 0,
      count: c._count,
      percentage: 0,
    })),
    byVendor: byVendor.map((v) => ({
      vendor: v.vendor || 'Unknown',
      total: v._sum.amount?.toNumber() || 0,
      count: v._count,
    })),
    byMonth: byMonth.map((m) => ({
      month: m.date.toISOString().slice(0, 7),
      total: m._sum.amount?.toNumber() || 0,
    })),
  };
}

export async function getInvoiceReport(orgId: string, startDate: Date, endDate: Date) {
  const [invoices, byStatus, byClientRaw] = await Promise.all([
    prisma.invoice.aggregate({
      where: { organizationId: orgId, createdAt: { gte: startDate, lte: endDate } },
      _sum: { total: true, amountPaid: true, balanceDue: true },
      _count: true,
    }),
    prisma.invoice.groupBy({
      by: ['status'],
      where: { organizationId: orgId, createdAt: { gte: startDate, lte: endDate } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.invoice.groupBy({
      by: ['clientId'],
      where: { organizationId: orgId, createdAt: { gte: startDate, lte: endDate } },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    }),
  ]);

  return {
    total: {
      count: invoices._count,
      revenue: invoices._sum.total?.toNumber() || 0,
      collected: invoices._sum.amountPaid?.toNumber() || 0,
      outstanding: invoices._sum.balanceDue?.toNumber() || 0,
    },
    byStatus: byStatus.map((s) => ({
      status: s.status,
      total: s._sum.total?.toNumber() || 0,
      count: s._count,
    })),
    byClient: byClientRaw.map((c) => ({
      clientId: c.clientId,
      total: c._sum.total?.toNumber() || 0,
      count: c._count,
    })),
  };
}

export async function getRevenueReport(orgId: string, startDate: Date, endDate: Date) {
  const monthly = await prisma.invoice.groupBy({
    by: ['issueDate'],
    where: {
      organizationId: orgId,
      status: { in: ['PAID', 'PARTIAL'] },
      issueDate: { gte: startDate, lte: endDate },
    },
    _sum: { total: true },
    orderBy: { issueDate: 'asc' },
  });

  const total = await prisma.invoice.aggregate({
    where: {
      organizationId: orgId,
      status: { in: ['PAID', 'PARTIAL'] },
      issueDate: { gte: startDate, lte: endDate },
    },
    _sum: { total: true },
    _count: true,
  });

  return {
    total: total._sum.total?.toNumber() || 0,
    count: total._count,
    monthly: monthly.map((m) => ({
      month: m.issueDate.toISOString().slice(0, 7),
      total: m._sum.total?.toNumber() || 0,
    })),
  };
}
