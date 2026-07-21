import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useInvoices,
  useDeleteInvoice,
  useDuplicateInvoice,
  useInvoiceStats,
} from '../../hooks/useInvoices';
import { STATUS_LABELS, type InvoiceStatus } from '../../services/invoices';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';
import { PageHeader } from '../../components/layout/PageHeader';

const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> =
  {
    PAID: 'success',
    PENDING: 'warning',
    PARTIAL: 'info',
    CANCELLED: 'danger',
  };

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useInvoices({
    page,
    limit: 15,
    search: search || undefined,
    status: (statusFilter as InvoiceStatus) || undefined,
  });
  const { data: stats } = useInvoiceStats();
  const deleteMutation = useDeleteInvoice();
  const duplicateMutation = useDuplicateInvoice();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <PageHeader
        title="Invoices"
        description="Create, send, and track your invoices"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Invoices' }]}
        actions={
          <Button variant="primary" onClick={() => navigate('/invoices/new')}>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Invoice
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-4">
        {error && <Alert variant="error">{(error as Error).message}</Alert>}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: 'Total', value: stats.counts.total, color: 'text-gray-900 dark:text-white' },
              { label: 'Pending', value: stats.counts.pending, color: 'text-amber-600' },
              { label: 'Paid', value: stats.counts.paid, color: 'text-primary-600' },
              { label: 'Partial', value: stats.counts.partial, color: 'text-blue-600' },
              { label: 'Overdue', value: stats.counts.overdue, color: 'text-red-600' },
            ].map((s) => (
              <Card key={s.label} className="p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                leftIcon={
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                }
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!statusFilter ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-800 dark:text-gray-400'}`}
              >
                All
              </button>
              {(Object.keys(STATUS_LABELS) as InvoiceStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(statusFilter === s ? '' : s);
                    setPage(1);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-800 dark:text-gray-400'}`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : data && data.invoices.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {search ? 'No invoices found' : 'No invoices yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {search ? 'Try adjusting your search' : 'Create your first invoice to get started'}
            </p>
            {!search && (
              <Button variant="primary" className="mt-4" onClick={() => navigate('/invoices/new')}>
                Create Invoice
              </Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-navy-800 dark:bg-navy-800/50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Client
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800/50">
                  {data!.invoices.map((inv: any) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-navy-800/30 cursor-pointer"
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                    >
                      <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white font-mono text-xs">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                        {inv.client?.name || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(inv.issueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={statusVariant[inv.status as InvoiceStatus] || 'neutral'}
                          dot
                        >
                          {STATUS_LABELS[inv.status as InvoiceStatus] || inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm font-medium text-gray-900 dark:text-white">
                        ₹{Number(inv.total).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-sm text-gray-600 dark:text-gray-400">
                        ₹{Number(inv.balanceDue).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => duplicateMutation.mutate(inv.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-800"
                            title="Duplicate"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteId(inv.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data!.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-navy-800">
                <p className="text-sm text-gray-500">
                  Page {data!.pagination.page} of {data!.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data!.pagination.hasPrev}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data!.pagination.hasNext}
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

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) await deleteMutation.mutateAsync(deleteId);
          setDeleteId(null);
        }}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice?"
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
