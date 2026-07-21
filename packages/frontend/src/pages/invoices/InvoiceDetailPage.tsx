import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useInvoice,
  useDeleteInvoice,
  useDuplicateInvoice,
  useRecordPayment,
} from '../../hooks/useInvoices';
import { invoicesApi, STATUS_LABELS, type InvoiceStatus } from '../../services/invoices';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { PageSkeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/ui/Modal';
import { Alert } from '../../components/ui/Alert';

const statusVariant: Record<InvoiceStatus, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> =
  {
    PAID: 'success',
    PENDING: 'warning',
    PARTIAL: 'info',
    CANCELLED: 'danger',
  };

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useInvoice(id!);
  const deleteMutation = useDeleteInvoice();
  const duplicateMutation = useDuplicateInvoice();
  const paymentMutation = useRecordPayment();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMsg, setEmailMsg] = useState('');

  if (isLoading) return <PageSkeleton />;
  if (error)
    return (
      <div className="p-6">
        <Alert variant="error">{(error as Error).message}</Alert>
      </div>
    );
  if (!data) return null;

  const inv = data.invoice;

  const handlePayment = async () => {
    await paymentMutation.mutateAsync({
      id: id!,
      data: { amount: parseFloat(payAmount), method: payMethod || undefined },
    });
    setPayOpen(false);
    setPayAmount('');
    setPayMethod('');
  };

  const handleEmail = async () => {
    await invoicesApi.email(id!, {
      to: emailTo,
      subject: emailSubject || undefined,
      message: emailMsg || undefined,
    });
    setEmailOpen(false);
  };

  const handleDownloadPdf = async () => {
    await invoicesApi.downloadPdf(id!);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-5 dark:border-navy-800 dark:bg-navy-900 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-1.5 text-sm">
              <a href="/invoices" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                Invoices
              </a>
              <svg
                className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-display-md text-gray-900 dark:text-white">{inv.invoiceNumber}</h1>
              <Badge variant={statusVariant[inv.status]} dot>
                {STATUS_LABELS[inv.status as InvoiceStatus]}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              To: {inv.client?.name} &middot; Due:{' '}
              {new Date(inv.dueDate).toLocaleDateString('en-IN')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleDownloadPdf}>
              ↓ PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
              ✉ Email
            </Button>
            {inv.status !== 'PAID' && (
              <Button variant="secondary" size="sm" onClick={() => setPayOpen(true)}>
                💰 Payment
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => duplicateMutation.mutate(id!)}>
              ⧉ Duplicate
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Invoice Items */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/50 dark:border-navy-800 dark:bg-navy-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      GST
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800/50">
                  {inv.items.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        {item.description}
                        {item.hsnCode && (
                          <span className="ml-2 text-xs text-gray-400">HSN: {item.hsnCode}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">{Number(item.quantity)}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        ₹{Number(item.unitPrice).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-500">
                        {Number(item.gstRate)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Payments */}
            {inv.payments && inv.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payments ({inv.payments.length})</CardTitle>
                </CardHeader>
                <div className="divide-y divide-gray-100 dark:divide-navy-800">
                  {inv.payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                          {p.method && ` · ${p.method}`}
                        </p>
                      </div>
                      {p.reference && (
                        <span className="text-xs text-gray-400 font-mono">{p.reference}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  ['Subtotal', inv.subtotal] as [string, number],
                  inv.discountAmount > 0
                    ? ([`Discount (${inv.discountPercent}%)`, -inv.discountAmount] as [
                        string,
                        number,
                      ])
                    : null,
                  inv.cgst > 0 ? (['CGST', inv.cgst] as [string, number]) : null,
                  inv.sgst > 0 ? (['SGST', inv.sgst] as [string, number]) : null,
                  inv.igst > 0 ? (['IGST', inv.igst] as [string, number]) : null,
                ]
                  .filter((x): x is [string, number] => x !== null)
                  .map(([label, amount], i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{label as string}</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        ₹{Number(amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                <div className="border-t border-gray-200 dark:border-navy-800 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-mono text-lg font-bold text-primary-600 dark:text-primary-400">
                    ₹{Number(inv.total).toLocaleString('en-IN')}
                  </span>
                </div>
                {inv.amountPaid > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Paid</span>
                      <span className="font-mono text-primary-600">
                        ₹{Number(inv.amountPaid).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Balance Due</span>
                      <span className="font-mono font-bold text-red-600">
                        ₹{Number(inv.balanceDue).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {inv.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {inv.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
            onClick={() => setPayOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-navy-800 dark:bg-navy-900 animate-scale-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h2>
            <p className="text-sm text-gray-500 mt-1">
              Balance due: ₹{Number(inv.balanceDue).toLocaleString('en-IN')}
            </p>
            <div className="mt-4 space-y-4">
              <Input
                label="Amount (₹)"
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <Input
                label="Method"
                placeholder="Bank transfer, UPI, Cash..."
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPayOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                loading={paymentMutation.isPending}
                disabled={!payAmount}
              >
                Record Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
            onClick={() => setEmailOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-navy-800 dark:bg-navy-900 animate-scale-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Invoice</h2>
            <div className="mt-4 space-y-4">
              <Input
                label="To"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder={inv.client?.email || ''}
              />
              <Input
                label="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={`Invoice ${inv.invoiceNumber}`}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Message
                </label>
                <textarea
                  className="input min-h-[100px]"
                  value={emailMsg}
                  onChange={(e) => setEmailMsg(e.target.value)}
                  placeholder={`Please find attached invoice ${inv.invoiceNumber} for ₹${Number(inv.total).toLocaleString('en-IN')}.`}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEmailOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEmail} disabled={!emailTo}>
                Send Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deleteMutation.mutateAsync(id!);
          navigate('/invoices');
        }}
        title="Delete Invoice"
        description={`Delete ${inv.invoiceNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
