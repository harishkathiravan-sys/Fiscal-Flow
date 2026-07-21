import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../../services/expenses';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { PageHeader } from '../../components/layout/PageHeader';
import { Alert } from '../../components/ui/Alert';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'MEALS', label: 'Meals' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'RENT', label: 'Rent' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'PROFESSIONAL_SERVICES', label: 'Professional Services' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

export default function ExpenseListPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    vendor: '',
    category: 'MISCELLANEOUS',
    paymentMethod: '',
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', { page, search, category }],
    queryFn: () =>
      expensesApi.list({
        page,
        limit: 15,
        search: search || undefined,
        category: category || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['expense-stats'],
    queryFn: () => expensesApi.stats(),
  });
  const createMut = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-stats'] });
      setShowAdd(false);
      setForm({
        description: '',
        amount: '',
        vendor: '',
        category: 'MISCELLANEOUS',
        paymentMethod: '',
        notes: '',
      });
    },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expense-stats'] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <PageHeader
        title="Expenses"
        description="Track and manage business expenses"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Expenses' }]}
        actions={
          <Button variant="primary" onClick={() => setShowAdd(!showAdd)}>
            + Add Expense
          </Button>
        }
      />
      <div className="p-4 lg:p-6 space-y-4">
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{(stats.monthTotal || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">This Month</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">
                ₹{(stats.yearTotal || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500">This Year</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.byCategory?.length || 0}</p>
              <p className="text-xs text-gray-500">Categories Used</p>
            </Card>
          </div>
        )}

        {showAdd && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">New Expense</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Amount (₹)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <Input
                placeholder="Vendor"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => createMut.mutate({ ...form, amount: parseFloat(form.amount) || 0 })}
                loading={createMut.isPending}
                disabled={!form.description || !form.amount}
              >
                Save
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={CATEGORIES}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </Card>

        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : data && data.expenses?.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-gray-500">No expenses found</p>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-navy-800 dark:bg-navy-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800/50">
                {data?.expenses?.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-800/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{exp.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(exp.date).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral" size="sm">
                        {exp.category?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{exp.vendor || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-gray-900 dark:text-white">
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteMut.mutate(exp.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.pagination?.totalPages > 1 && (
              <div className="flex justify-between border-t border-gray-200 px-4 py-3 dark:border-navy-800">
                <span className="text-sm text-gray-500">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.pagination.hasPrev}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
