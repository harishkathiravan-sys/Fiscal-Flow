import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankApi } from '../../services/bank';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { PageHeader } from '../../components/layout/PageHeader';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function BankAnalyzerPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'transactions' | 'subscriptions' | 'insights'>('transactions');
  const fileRef = useRef<HTMLInputElement>(null);
  const importMut = useMutation({
    mutationFn: bankApi.import,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank'] });
    },
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['bank-transactions'],
    queryFn: () => bankApi.list({ limit: 50 }),
  });
  const { data: subData } = useQuery({
    queryKey: ['bank-subscriptions'],
    queryFn: () => bankApi.subscriptions(),
  });
  const { data: insightsData } = useQuery({
    queryKey: ['bank-insights'],
    queryFn: () => bankApi.insights(),
  });

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importMut.mutate(file);
  };

  const categoryColors: Record<string, string> = {
    INCOME: 'success',
    EXPENSE: 'danger',
    TRANSFER: 'info',
    SUBSCRIPTION: 'warning',
    FEE: 'neutral',
    PAYROLL: 'primary',
    TAX: 'warning',
    LOAN: 'danger',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <PageHeader
        title="Bank Statement Analyzer"
        description="Import, categorize, and analyze bank transactions"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Bank' }]}
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.pdf"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="primary"
              onClick={() => fileRef.current?.click()}
              loading={importMut.isPending}
            >
              ↑ Import Statement
            </Button>
          </>
        }
      />

      <div className="p-4 lg:p-6 space-y-4">
        {/* Summary Cards */}
        {insightsData && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">
                ₹{(insightsData.totalIncome || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">Total Income</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                ₹{(insightsData.totalExpense || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">Total Expense</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {insightsData.subscriptionCount || 0}
              </p>
              <p className="text-xs text-gray-500">Subscriptions</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                ₹{(insightsData.subscriptionTotal || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">Monthly Sub Cost</p>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-navy-800">
          {(['transactions', 'subscriptions', 'insights'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${tab === t ? 'border-primary-500 text-primary-700 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'transactions' &&
          (txLoading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : (
            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-navy-800 dark:bg-navy-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800/50">
                  {txData?.transactions?.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-800/30">
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(tx.transactionDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {tx.description}
                        </p>
                        {tx.vendor && <p className="text-xs text-gray-400">{tx.vendor}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={(categoryColors[tx.category] || 'neutral') as any}
                          size="sm"
                        >
                          {tx.category?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-medium ${tx.amount > 0 ? 'text-primary-600' : 'text-red-600'}`}
                      >
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-500">
                        {tx.balance ? `₹${Number(tx.balance).toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}

        {tab === 'subscriptions' && (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-navy-800 dark:bg-navy-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800/50">
                {subData?.subscriptions?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                      No subscriptions detected yet
                    </td>
                  </tr>
                ) : (
                  subData?.subscriptions?.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-800/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {s.description}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(s.transactionDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-red-600">
                        ₹{Math.abs(s.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'insights' && insightsData?.categoryBreakdown && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {insightsData.categoryBreakdown.map((cat: any) => (
              <Card key={cat.category} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {cat.category.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500">{cat.count} transactions</p>
                </div>
                <p className="font-mono font-semibold text-gray-900 dark:text-white">
                  ₹{cat.total.toLocaleString('en-IN')}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
