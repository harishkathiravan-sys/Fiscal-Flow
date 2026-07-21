import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../services/reports';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { PageHeader } from '../../components/layout/PageHeader';
import { PageSkeleton } from '../../components/ui/Skeleton';

type ReportTab = 'pnl' | 'balance-sheet' | 'cash-flow' | 'expense' | 'revenue' | 'invoice';

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('pnl');
  const year = new Date().getFullYear();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const tabs: { id: ReportTab; label: string }[] = [
    { id: 'pnl', label: 'Profit & Loss' },
    { id: 'balance-sheet', label: 'Balance Sheet' },
    { id: 'cash-flow', label: 'Cash Flow' },
    { id: 'expense', label: 'Expense Analysis' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'invoice', label: 'Invoice Report' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <PageHeader
        title="Financial Reports"
        description="View and export financial statements"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
      />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-navy-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? 'border-primary-500 text-primary-700 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'pnl' && <PnlReport start={startDate} end={endDate} />}
        {tab === 'balance-sheet' && <BalanceSheetReport />}
        {tab === 'cash-flow' && <CashFlowReport start={startDate} end={endDate} />}
        {tab === 'expense' && <ExpenseReport start={startDate} end={endDate} />}
        {tab === 'revenue' && <RevenueReport start={startDate} end={endDate} />}
        {tab === 'invoice' && <InvoiceReport start={startDate} end={endDate} />}
      </div>
    </div>
  );
}

function PnlReport({ start, end }: { start: string; end: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['pnl', start, end],
    queryFn: () => reportsApi.pnl(start, end),
  });
  if (isLoading) return <PageSkeleton />;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-primary-600">
            ₹{data.revenue?.total?.toLocaleString('en-IN') || '0'}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{data.expenses?.total?.toLocaleString('en-IN') || '0'}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-500">Net Profit</p>
          <p
            className={`text-2xl font-bold ${(data.netProfit || 0) >= 0 ? 'text-primary-600' : 'text-red-600'}`}
          >
            ₹{data.netProfit?.toLocaleString('en-IN') || '0'}
          </p>
          <p className="text-xs text-gray-400">Margin: {data.profitMargin}%</p>
        </Card>
      </div>
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-navy-800">
            <span className="font-medium text-gray-900 dark:text-white">Revenue</span>
            <span className="font-mono text-primary-600">
              ₹{data.revenue?.total?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-navy-800">
            <span className="font-medium text-gray-900 dark:text-white">Total Expenses</span>
            <span className="font-mono text-red-600">
              ₹{data.expenses?.total?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          <div className="flex justify-between border-t-2 border-gray-300 pt-3">
            <span className="font-bold text-gray-900 dark:text-white">Net Profit</span>
            <span
              className={`font-mono text-xl font-bold ${(data.netProfit || 0) >= 0 ? 'text-primary-600' : 'text-red-600'}`}
            >
              ₹{data.netProfit?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function BalanceSheetReport() {
  const { data, isLoading } = useQuery({
    queryKey: ['balance-sheet'],
    queryFn: () => reportsApi.balanceSheet(),
  });
  if (isLoading) return <PageSkeleton />;
  if (!data) return null;
  const sections = [
    {
      title: 'Assets',
      items: [
        { label: 'Cash', value: data.assets?.cash },
        { label: 'Accounts Receivable', value: data.assets?.accountsReceivable },
      ],
      total: data.assets?.totalAssets,
    },
    {
      title: 'Liabilities',
      items: [
        { label: 'Accounts Payable', value: data.liabilities?.accountsPayable },
        { label: 'GST Payable', value: data.liabilities?.gstPayable },
      ],
      total: data.liabilities?.totalLiabilities,
    },
    {
      title: 'Equity',
      items: [{ label: 'Retained Earnings', value: data.equity?.retainedEarnings }],
      total: data.equity?.totalEquity,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {sections.map((s) => (
        <Card key={s.title}>
          <CardHeader>
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6 space-y-2">
            {s.items.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-mono">₹{(item.value || 0).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold dark:border-navy-800">
              <span>Total</span>
              <span className="font-mono">₹{(s.total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CashFlowReport({ start, end }: { start: string; end: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow', start, end],
    queryFn: () => reportsApi.cashFlow(start, end),
  });
  if (isLoading) return <PageSkeleton />;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-gray-500">Inflow</p>
          <p className="text-2xl font-bold text-primary-600">
            ₹{(data.summary?.totalInflow || 0).toLocaleString('en-IN')}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-500">Outflow</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{(data.summary?.totalOutflow || 0).toLocaleString('en-IN')}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-500">Net Cash Flow</p>
          <p
            className={`text-2xl font-bold ${(data.summary?.netCashFlow || 0) >= 0 ? 'text-primary-600' : 'text-red-600'}`}
          >
            ₹{(data.summary?.netCashFlow || 0).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>
      {data.monthly?.length > 0 && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Monthly Cash Flow</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {data.monthly.map((m: any) => (
              <div
                key={m.month}
                className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-navy-800"
              >
                <span className="text-sm font-medium">{m.month}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-primary-600">+₹{m.inflow.toLocaleString('en-IN')}</span>
                  <span className="text-red-600">-₹{m.outflow.toLocaleString('en-IN')}</span>
                  <span
                    className={`font-medium ${m.net >= 0 ? 'text-primary-600' : 'text-red-600'}`}
                  >
                    ₹{m.net.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ExpenseReport({ start, end }: { start: string; end: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['expense-analysis', start, end],
    queryFn: () => reportsApi.expenseAnalysis(start, end),
  });
  if (isLoading) return <PageSkeleton />;
  if (!data) return null;
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Expense Analysis</CardTitle>
        <p className="text-sm text-gray-500">Total: ₹{(data.total || 0).toLocaleString('en-IN')}</p>
      </CardHeader>
      <div className="space-y-2">
        {data.byCategory?.map((cat: any) => {
          const pct = data.total > 0 ? (cat.total / data.total) * 100 : 0;
          return (
            <div key={cat.category} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{cat.category.replace(/_/g, ' ')}</span>
                <span className="font-mono">
                  ₹{cat.total.toLocaleString('en-IN')} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-navy-800">
                <div className="h-2 rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function RevenueReport({ start, end }: { start: string; end: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['revenue', start, end],
    queryFn: () => reportsApi.revenue(start, end),
  });
  if (isLoading) return <PageSkeleton />;
  if (!data) return null;
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Revenue Report</CardTitle>
        <p className="text-sm text-gray-500">
          Total: ₹{(data.total || 0).toLocaleString('en-IN')} from {data.count} invoices
        </p>
      </CardHeader>
      <div className="space-y-2">
        {data.monthly?.map((m: any) => (
          <div
            key={m.month}
            className="flex justify-between text-sm border-b border-gray-100 pb-2 dark:border-navy-800"
          >
            <span>{m.month}</span>
            <span className="font-mono font-medium text-primary-600">
              ₹{m.total.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function InvoiceReport({ start, end }: { start: string; end: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['invoice-report', start, end],
    queryFn: () => reportsApi.invoiceReport(start, end),
  });
  if (isLoading) return <PageSkeleton />;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.total?.count || 0}
          </p>
          <p className="text-xs text-gray-500">Total Invoices</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">
            ₹{(data.total?.collected || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">Collected</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            ₹{(data.total?.outstanding || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">Outstanding</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            ₹{(data.total?.revenue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500">Total Revenue</p>
        </Card>
      </div>
      {data.byStatus?.length > 0 && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>By Status</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {data.byStatus.map((s: any) => (
              <div
                key={s.status}
                className="flex justify-between border-b border-gray-100 pb-2 text-sm dark:border-navy-800"
              >
                <span>
                  {s.status} ({s.count})
                </span>
                <span className="font-mono">₹{s.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
