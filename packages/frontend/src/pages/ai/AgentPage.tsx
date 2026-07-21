import { useState } from 'react';
import { aiApi, type AiResponse } from '../../services/ai';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { PageHeader } from '../../components/layout/PageHeader';

// ─── Agent Capabilities Config ──────────────

const AGENT_TOOLS = [
  { id: 'chat', label: 'Chat', icon: '💬', description: 'Ask any accounting question' },
  { id: 'categorize', label: 'Categorize', icon: '🏷️', description: 'Auto-categorize expenses' },
  { id: 'ledger', label: 'Ledger', icon: '📒', description: 'Suggest ledger entries' },
  { id: 'duplicates', label: 'Duplicates', icon: '🔍', description: 'Detect duplicate invoices' },
  { id: 'gst', label: 'GST Check', icon: '🏛️', description: 'Flag missing GST' },
  { id: 'journal', label: 'Journal', icon: '📝', description: 'Suggest journal entries' },
  { id: 'notes', label: 'Notes', icon: '📋', description: 'Generate accounting notes' },
  { id: 'explain', label: 'Explain', icon: '💡', description: 'Explain invoice details' },
  { id: 'reminders', label: 'Reminders', icon: '📧', description: 'Payment reminder emails' },
] as const;

type ToolId = (typeof AGENT_TOOLS)[number]['id'];

// ─── Main Component ─────────────────────────

export default function AgentPage() {
  const [activeTool, setActiveTool] = useState<ToolId>('chat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleError = (err: any) => {
    setError(err.message || 'AI request failed. Check your API key configuration.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <PageHeader
        title="AI Accounting Agent"
        description="AI-powered tools for expense categorization, GST validation, journal entries, and more"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Agent' }]}
      />

      <div className="flex gap-6 p-4 lg:p-6">
        {/* Tool Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <Card className="p-3">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              AI Tools
            </h3>
            <div className="space-y-0.5">
              {AGENT_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id);
                    setResult(null);
                    setError('');
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    activeTool === tool.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-800'
                  }`}
                >
                  <span className="text-lg">{tool.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{tool.label}</p>
                    <p className="text-[11px] opacity-60">{tool.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Mobile tool selector */}
          <div className="flex gap-1 overflow-x-auto pb-2 lg:hidden">
            {AGENT_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setResult(null);
                  setError('');
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTool === tool.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-gray-400'
                }`}
              >
                <span>{tool.icon}</span> {tool.label}
              </button>
            ))}
          </div>

          {error && (
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Tool Panels */}
          {activeTool === 'chat' && (
            <ChatPanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
          {activeTool === 'categorize' && (
            <CategorizePanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
          {activeTool === 'ledger' && (
            <LedgerPanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
          {activeTool === 'duplicates' && (
            <DuplicatesPanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
          {activeTool === 'gst' && (
            <GstPanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
          {activeTool === 'journal' && (
            <JournalPanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
          {activeTool === 'notes' && (
            <NotesPanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
          {activeTool === 'explain' && (
            <ExplainPanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
          {activeTool === 'reminders' && (
            <RemindersPanel
              loading={loading}
              setLoading={setLoading}
              result={result}
              setResult={setResult}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared Panel Props ─────────────────────

type PanelProps = {
  loading: boolean;
  setLoading: (v: boolean) => void;
  result: any;
  setResult: (v: any) => void;
  onError: (err: any) => void;
};

// ─── 1. Chat ────────────────────────────────

function ChatPanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);

  const send = async () => {
    if (!message.trim() || loading) return;
    const msg = message.trim();
    setMessage('');
    setHistory((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await aiApi.chat({ message: msg });
      setHistory((prev) => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>💬 Ask the AI Accountant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {history.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              Ask anything about Indian accounting, GST, journal entries, or financial reporting.
            </p>
          )}
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md dark:bg-navy-800 dark:text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-navy-800">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Ask about GST, journal entries, expenses..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
          />
          <Button onClick={send} loading={loading}>
            Ask
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 2. Categorize ──────────────────────────

function CategorizePanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');

  const run = async () => {
    setLoading(true);
    try {
      const res = await aiApi.categorize({
        description: desc,
        amount: amount ? parseFloat(amount) : undefined,
        vendor: vendor || undefined,
      });
      setResult(res.data);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏷️ Categorize Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            label="Expense Description"
            placeholder="e.g. Cloud hosting payment to AWS for December"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label="Vendor"
              placeholder="Amazon Web Services"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
          </div>
          <Button onClick={run} loading={loading} disabled={!desc}>
            Categorize
          </Button>
          {result && (
            <div className="rounded-xl border border-gray-200 p-4 dark:border-navy-800">
              <div className="flex items-center gap-3">
                <Badge variant="primary" size="md">
                  {result.category?.replace(/_/g, ' ')}
                </Badge>
                <span className="text-sm text-gray-500">
                  {Math.round((result.confidence || 0) * 100)}% confidence
                </span>
              </div>
              {result.subcategory && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Subcategory: {result.subcategory}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{result.reason}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 3. Ledger Entries ──────────────────────

function LedgerPanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const run = async () => {
    setLoading(true);
    try {
      const res = await aiApi.ledgerEntries({
        transactionDescription: desc,
        amount: parseFloat(amount),
      });
      setResult(res.data);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📒 Suggest Ledger Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            label="Transaction Description"
            placeholder="Office rent payment for January"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button onClick={run} loading={loading} disabled={!desc || !amount}>
            Suggest Entries
          </Button>
          {result && Array.isArray(result) && (
            <div className="rounded-xl border border-gray-200 overflow-hidden dark:border-navy-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-navy-800/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                      Account
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                      Debit
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {result.map((entry: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-2">
                        <span className="font-mono text-xs text-gray-500">{entry.accountCode}</span>{' '}
                        {entry.accountName}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {entry.debit ? `₹${entry.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {entry.credit ? `₹${entry.credit.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 4. Duplicate Detection ─────────────────

function DuplicatesPanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [vendor, setVendor] = useState('');
  const [invNum, setInvNum] = useState('');
  const [amount, setAmount] = useState('');

  const run = async () => {
    setLoading(true);
    try {
      const res = await aiApi.checkDuplicates({
        currentInvoice: { vendor, invoiceNumber: invNum, amount: parseFloat(amount) },
        recentInvoices: [], // In real app, fetch from API
      });
      setResult(res.data);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Check for Duplicates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Vendor"
              placeholder="Acme Corp"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
            />
            <Input
              label="Invoice Number"
              placeholder="INV-1042"
              value={invNum}
              onChange={(e) => setInvNum(e.target.value)}
            />
            <Input
              label="Amount (₹)"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button onClick={run} loading={loading} disabled={!vendor || !invNum || !amount}>
            Check Duplicates
          </Button>
          {result && (
            <div className="space-y-3">
              <Alert
                variant={result.isDuplicate ? 'warning' : 'success'}
                title={result.isDuplicate ? 'Potential duplicate found' : 'No duplicates found'}
              >
                {result.reason}
              </Alert>
              {result.similarInvoices?.length > 0 && (
                <div className="rounded-xl border border-gray-200 p-4 dark:border-navy-800">
                  <h4 className="text-sm font-semibold mb-2">Similar Invoices</h4>
                  {result.similarInvoices.map((inv: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-navy-800 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {inv.vendor} — {inv.invoiceNumber}
                        </p>
                        <p className="text-xs text-gray-500">₹{inv.amount.toLocaleString()}</p>
                      </div>
                      <Badge variant={inv.similarity > 0.8 ? 'danger' : 'warning'}>
                        {Math.round(inv.similarity * 100)}% match
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 5. GST Check ───────────────────────────

function GstPanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [gstin, setGstin] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [cgst, setCgst] = useState('');
  const [sgst, setSgst] = useState('');
  const [total, setTotal] = useState('');

  const run = async () => {
    setLoading(true);
    try {
      const res = await aiApi.flagGst({
        invoice: {
          gstin: gstin || undefined,
          subtotal: subtotal ? parseFloat(subtotal) : undefined,
          cgst: cgst ? parseFloat(cgst) : undefined,
          sgst: sgst ? parseFloat(sgst) : undefined,
          total: total ? parseFloat(total) : undefined,
        },
      });
      setResult(res.data);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏛️ GST Compliance Check</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            label="GSTIN"
            placeholder="22AAAAA0000A1Z5"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input
              label="Subtotal"
              type="number"
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
            />
            <Input
              label="CGST"
              type="number"
              value={cgst}
              onChange={(e) => setCgst(e.target.value)}
            />
            <Input
              label="SGST"
              type="number"
              value={sgst}
              onChange={(e) => setSgst(e.target.value)}
            />
            <Input
              label="Total"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <Button onClick={run} loading={loading}>
            Validate GST
          </Button>
          {result && (
            <div className="space-y-3">
              {result.issues?.map((issue: any, i: number) => (
                <Alert
                  key={i}
                  variant={issue.severity === 'error' ? 'error' : 'warning'}
                  title={issue.type.replace(/_/g, ' ').toUpperCase()}
                >
                  {issue.message}
                  {issue.suggestion && (
                    <p className="mt-1 text-xs opacity-80">Suggestion: {issue.suggestion}</p>
                  )}
                </Alert>
              ))}
              {result.issues?.length === 0 && (
                <Alert variant="success" title="GST looks compliant">
                  No issues detected with the GST information provided.
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 6. Journal Entry ───────────────────────

function JournalPanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [type, setType] = useState('expense');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('');
  const [vendor, setVendor] = useState('');

  const run = async () => {
    setLoading(true);
    try {
      const res = await aiApi.journalEntry({
        transactionType: type,
        description: desc,
        amount: parseFloat(amount),
        taxAmount: tax ? parseFloat(tax) : undefined,
        vendor: vendor || undefined,
      });
      setResult(res.data);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 Suggest Journal Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Transaction Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['purchase', 'sale', 'expense', 'payment', 'receipt'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${type === t ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-gray-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Description"
            placeholder="Purchased office chairs from furniture store"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label="Tax (₹)"
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              hint="GST amount if any"
            />
            <Input label="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <Button onClick={run} loading={loading} disabled={!desc || !amount}>
            Generate Journal Entry
          </Button>
          {result && result.entries && (
            <div className="rounded-xl border border-gray-200 overflow-hidden dark:border-navy-800">
              <div className="bg-gray-50 px-4 py-2 dark:bg-navy-800/50">
                <p className="text-xs font-medium text-gray-500">
                  {result.description} — Ref: {result.reference}
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-navy-800">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">
                      Account
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                      Debit
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                  {result.entries.map((e: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-2">
                        <span className="font-mono text-xs text-gray-500">{e.accountCode}</span>{' '}
                        {e.accountName}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {e.debit ? `₹${e.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {e.credit ? `₹${e.credit.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 7. Accounting Notes ────────────────────

function NotesPanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [period, setPeriod] = useState('January 2025');
  const [revenue, setRevenue] = useState('');
  const [expenses, setExpenses] = useState('');

  const run = async () => {
    setLoading(true);
    try {
      const rev = revenue ? parseFloat(revenue) : 0;
      const exp = expenses ? parseFloat(expenses) : 0;
      const res = await aiApi.accountingNotes({
        period,
        financialSummary:
          revenue || expenses ? { revenue: rev, expenses: exp, profit: rev - exp } : undefined,
      });
      setResult(res.data);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Generate Accounting Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            label="Period"
            placeholder="January 2025"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Revenue (₹)"
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
            />
            <Input
              label="Expenses (₹)"
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
            />
          </div>
          <Button onClick={run} loading={loading}>
            Generate Notes
          </Button>
          {result && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-navy-800">
                <h4 className="text-sm font-semibold mb-2">Summary</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{result.summary}</p>
              </div>
              {result.keyFindings?.length > 0 && (
                <ResultList title="Key Findings" items={result.keyFindings} variant="primary" />
              )}
              {result.risks?.length > 0 && (
                <ResultList title="Risks" items={result.risks} variant="danger" />
              )}
              {result.recommendations?.length > 0 && (
                <ResultList title="Recommendations" items={result.recommendations} variant="info" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 8. Explain Invoice ─────────────────────

function ExplainPanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [vendor, setVendor] = useState('');
  const [invNum, setInvNum] = useState('');
  const [total, setTotal] = useState('');

  const run = async () => {
    setLoading(true);
    try {
      const res = await aiApi.explainInvoice({
        vendor: vendor || undefined,
        invoiceNumber: invNum || undefined,
        total: total ? parseFloat(total) : undefined,
      });
      setResult(res.data);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 Explain Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input label="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
            <Input
              label="Invoice Number"
              value={invNum}
              onChange={(e) => setInvNum(e.target.value)}
            />
            <Input
              label="Total (₹)"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <Button onClick={run} loading={loading} disabled={!vendor && !invNum && !total}>
            Explain
          </Button>
          {result && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-navy-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {result.explanation}
                </p>
              </div>
              {result.breakdown && (
                <div className="grid grid-cols-5 gap-2 text-center">
                  {Object.entries(result.breakdown).map(([key, val]) => (
                    <div key={key} className="rounded-lg bg-gray-50 p-2 dark:bg-navy-800">
                      <p className="text-[10px] uppercase text-gray-400">{key}</p>
                      <p className="text-sm font-semibold font-mono">
                        ₹{(val as number).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {result.flags?.length > 0 && (
                <div className="space-y-1">
                  {result.flags.map((flag: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400"
                    >
                      <span>⚠️</span> {flag}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 9. Payment Reminders ───────────────────

function RemindersPanel({ loading, setLoading, result, setResult, onError }: PanelProps) {
  const [clients, setClients] = useState(
    'Acme Corp,INV-1001,52000,2025-01-15,30\nBeta Inc,INV-1002,125000,2024-12-01,50',
  );
  const [tone, setTone] = useState('professional');

  const run = async () => {
    setLoading(true);
    try {
      const invoices = clients
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [clientName, invoiceNumber, amount, dueDate, daysOverdue] = line
            .split(',')
            .map((s) => s.trim());
          return {
            clientName,
            invoiceNumber,
            amount: parseFloat(amount),
            dueDate,
            daysOverdue: parseInt(daysOverdue),
          };
        });
      const res = await aiApi.paymentReminders({ overdueInvoices: invoices, tone });
      setResult(res.data);
    } catch (err) {
      onError(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📧 Payment Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            label="Overdue Invoices (CSV: Client,Invoice#,Amount,DueDate,DaysOverdue)"
            value={clients}
            onChange={(e) => setClients(e.target.value)}
            className="font-mono text-xs min-h-[100px]"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tone
            </label>
            <div className="flex gap-1.5">
              {['professional', 'friendly', 'firm'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${tone === t ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-gray-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={run} loading={loading}>
            Generate Reminders
          </Button>
          {result &&
            Array.isArray(result) &&
            result.map((r: any, i: number) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-navy-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{r.clientName}</p>
                    <p className="text-xs text-gray-500">
                      {r.invoiceNumber} — ₹{r.amount.toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      r.reminderLevel === 'urgent'
                        ? 'danger'
                        : r.reminderLevel === 'firm'
                          ? 'warning'
                          : 'info'
                    }
                    dot
                  >
                    {r.reminderLevel}
                  </Badge>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Subject: {r.emailSubject}
                  </p>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 rounded-lg p-3 dark:bg-navy-800/50">
                    {r.emailBody}
                  </pre>
                </div>
              </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Helper Components ──────────────────────

function ResultList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: string;
}) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[variant] || colors.primary}`}>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
