import { prisma } from '../../config/database';

export async function generateInsights(orgId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [invoices, expenses, payments, overdueInvoices] = await Promise.all([
    prisma.invoice.findMany({
      where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
      include: { client: { select: { name: true } } },
    }),
    prisma.expense.findMany({ where: { organizationId: orgId, date: { gte: thirtyDaysAgo } } }),
    prisma.payment.findMany({
      where: { invoice: { organizationId: orgId }, paymentDate: { gte: thirtyDaysAgo } },
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: now },
      },
      include: { client: { select: { name: true } } },
    }),
  ]);

  const insights: Array<{
    type: string;
    title: string;
    description: string;
    severity: string;
    data: any;
  }> = [];

  // Late Payment Detection
  for (const inv of overdueInvoices) {
    const daysOverdue = Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    insights.push({
      type: 'LATE_PAYMENT',
      title: `Overdue: ${inv.invoiceNumber}`,
      description: `${inv.client?.name}'s invoice of ₹${inv.balanceDue} is ${daysOverdue} days overdue`,
      severity: daysOverdue > 60 ? 'CRITICAL' : daysOverdue > 30 ? 'WARNING' : 'INFO',
      data: { invoiceId: inv.id, daysOverdue, amount: inv.balanceDue },
    });
  }

  // Expense Anomaly Detection
  if (expenses.length > 5) {
    const amounts = expenses.map((e) => e.amount.toNumber());
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((s, a) => s + Math.pow(a - avg, 2), 0) / amounts.length,
    );
    const anomalies = expenses.filter((e) => Math.abs(e.amount.toNumber() - avg) > 2 * stdDev);

    for (const anomaly of anomalies) {
      insights.push({
        type: 'EXPENSE_ANOMALY',
        title: `Unusual expense: ${anomaly.vendor || anomaly.category}`,
        description: `₹${anomaly.amount} is significantly higher than average (₹${Math.round(avg)})`,
        severity: 'WARNING',
        data: {
          amount: anomaly.amount.toNumber(),
          average: Math.round(avg),
          vendor: anomaly.vendor,
        },
      });
    }
  }

  // Cash Flow Prediction
  const totalInflow = payments.reduce((s, p) => s + p.amount.toNumber(), 0);
  const totalOutflow = expenses.reduce((s, e) => s + e.amount.toNumber(), 0);
  const netFlow = totalInflow - totalOutflow;

  insights.push({
    type: 'CASH_FLOW_PREDICTION',
    title: 'Cash Flow Forecast',
    description:
      netFlow > 0
        ? `Net positive cash flow of ₹${Math.round(netFlow)} in the last 30 days`
        : `Net negative cash flow of ₹${Math.abs(Math.round(netFlow))} — review expenses`,
    severity: netFlow < 0 ? 'WARNING' : 'INFO',
    data: { inflow: totalInflow, outflow: totalOutflow, net: netFlow },
  });

  // Financial Health Score
  const totalRevenue = invoices.reduce((s, i) => s + i.total.toNumber(), 0);
  const totalCollected = payments.reduce((s, p) => s + p.amount.toNumber(), 0);
  const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;
  const overdueAmount = overdueInvoices.reduce((s, i) => s + i.balanceDue.toNumber(), 0);
  const healthScore = Math.min(
    100,
    Math.max(
      0,
      collectionRate * 0.4 +
        (1 - Math.min(overdueAmount / Math.max(totalRevenue, 1), 1)) * 40 +
        (totalInflow > totalOutflow ? 20 : 0),
    ),
  );

  insights.push({
    type: 'FINANCIAL_HEALTH',
    title: `Financial Health Score: ${Math.round(healthScore)}/100`,
    description:
      healthScore >= 70
        ? 'Your financial health looks strong'
        : healthScore >= 40
          ? 'Some areas need attention'
          : 'Critical: Review finances urgently',
    severity: healthScore >= 70 ? 'INFO' : healthScore >= 40 ? 'WARNING' : 'CRITICAL',
    data: {
      score: Math.round(healthScore),
      collectionRate: Math.round(collectionRate),
      overdueAmount,
    },
  });

  // Save insights
  await prisma.aiInsight.deleteMany({
    where: { organizationId: orgId, isDismissed: false, createdAt: { lt: thirtyDaysAgo } },
  });
  for (const insight of insights) {
    await prisma.aiInsight
      .upsert({
        where: { id: `${orgId}-${insight.type}-${insight.title}` },
        update: {
          description: insight.description,
          severity: insight.severity as any,
          data: insight.data,
        },
        create: {
          id: `${orgId}-${insight.type}-${insight.title.slice(0, 50)}`,
          type: insight.type as any,
          title: insight.title,
          description: insight.description,
          severity: insight.severity as any,
          data: insight.data,
          organizationId: orgId,
        },
      })
      .catch(() => {});
  }

  return insights;
}

export async function getInsights(orgId: string) {
  return prisma.aiInsight.findMany({
    where: { organizationId: orgId, isDismissed: false },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    take: 20,
  });
}

export async function dismissInsight(id: string) {
  return prisma.aiInsight.update({ where: { id }, data: { isDismissed: true } });
}
