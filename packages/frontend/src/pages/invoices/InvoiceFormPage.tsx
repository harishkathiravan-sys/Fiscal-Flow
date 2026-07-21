import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateInvoice } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

interface LineItem {
  description: string;
  hsnCode: string;
  quantity: string;
  unitPrice: string;
  gstRate: string;
}

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const createMutation = useCreateInvoice();
  const { data: clientData } = useClients({ limit: 100 });
  const [error, setError] = useState('');

  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment due within 30 days of invoice date.');
  const [items, setItems] = useState<LineItem[]>([
    { description: '', hsnCode: '', quantity: '1', unitPrice: '', gstRate: '18' },
  ]);

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { description: '', hsnCode: '', quantity: '1', unitPrice: '', gstRate: '18' },
    ]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => {
    const amt = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    return sum + amt;
  }, 0);

  const discount = discountPercent ? (subtotal * parseFloat(discountPercent)) / 100 : 0;
  const taxable = subtotal - discount;
  const totalGst = items.reduce((sum, item) => {
    const amt = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    return sum + (amt * (parseFloat(item.gstRate) || 0)) / 100;
  }, 0);
  const adjustedGst = discountPercent
    ? totalGst * (1 - parseFloat(discountPercent) / 100)
    : totalGst;
  const total = taxable + adjustedGst;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await createMutation.mutateAsync({
        clientId,
        dueDate,
        discountPercent: discountPercent ? parseFloat(discountPercent) : undefined,
        notes: notes || undefined,
        terms: terms || undefined,
        items: items.map((item) => ({
          description: item.description,
          hsnCode: item.hsnCode || undefined,
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          gstRate: parseFloat(item.gstRate) || 0,
        })),
      });
      navigate(`/invoices/${result.invoice.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    }
  };

  const clientOptions = (clientData?.clients || []).map((c: any) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <div className="border-b border-gray-200 bg-white px-6 py-5 dark:border-navy-800 dark:bg-navy-900 lg:px-8">
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
          <span className="font-medium text-gray-900 dark:text-white">New Invoice</span>
        </nav>
        <h1 className="text-display-md text-gray-900 dark:text-white">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6 max-w-5xl">
        {error && <Alert variant="error">{error}</Alert>}

        {/* Client & Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Select
                label="Client *"
                options={clientOptions}
                placeholder="Select a client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              />
              <Input
                label="Issue Date"
                type="date"
                value={new Date().toISOString().split('T')[0]}
                disabled
              />
              <Input
                label="Due Date *"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                + Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-3 dark:border-navy-800">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-5">
                      {i === 0 && (
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Description
                        </label>
                      )}
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      {i === 0 && (
                        <label className="block text-xs font-medium text-gray-500 mb-1">HSN</label>
                      )}
                      <Input
                        placeholder="HSN"
                        value={item.hsnCode}
                        onChange={(e) => updateItem(i, 'hsnCode', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      {i === 0 && (
                        <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                      )}
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      {i === 0 && (
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Rate (₹)
                        </label>
                      )}
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      {i === 0 && (
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          GST %
                        </label>
                      )}
                      <Input
                        type="number"
                        value={item.gstRate}
                        onChange={(e) => updateItem(i, 'gstRate', e.target.value)}
                        min="0"
                        max="28"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent>
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                {[
                  ['Subtotal', subtotal] as [string, number],
                  discount > 0
                    ? ([`Discount (${discountPercent}%)`, -discount] as [string, number])
                    : null,
                  adjustedGst > 0 ? (['GST', adjustedGst] as [string, number]) : null,
                ]
                  .filter((x): x is [string, number] => x !== null)
                  .map(([label, amount], i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label as string}</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                <div className="border-t border-gray-200 dark:border-navy-800 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-mono text-xl font-bold text-primary-600 dark:text-primary-400">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Terms */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Textarea
                label="Notes"
                placeholder="Additional notes for the client..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Textarea
                label="Terms & Conditions"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <Input
                label="Discount (%)"
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
                className="max-w-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="secondary" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
