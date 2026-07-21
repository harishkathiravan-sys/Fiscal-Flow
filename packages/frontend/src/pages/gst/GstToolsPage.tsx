import { useState } from 'react';
import { gstApi } from '../../services/gst';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/layout/PageHeader';

type Tab = 'calculator' | 'validate' | 'due-dates' | 'penalty' | 'itc';

export default function GstToolsPage() {
  const [tab, setTab] = useState<Tab>('calculator');
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'calculator', label: 'Calculator', icon: '🧮' },
    { id: 'validate', label: 'Validation', icon: '✅' },
    { id: 'due-dates', label: 'Due Dates', icon: '📅' },
    { id: 'penalty', label: 'Penalty Calc', icon: '⚠️' },
    { id: 'itc', label: 'ITC', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <PageHeader
        title="GST Management"
        description="GST calculator, validation, due dates, and more"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'GST' }]}
      />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-navy-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-primary-500 text-primary-700 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === 'calculator' && <CalculatorTab />}
        {tab === 'validate' && <ValidateTab />}
        {tab === 'due-dates' && <DueDatesTab />}
        {tab === 'penalty' && <PenaltyTab />}
        {tab === 'itc' && <ItcTab />}
      </div>
    </div>
  );
}

function CalculatorTab() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('18');
  const [type, setType] = useState<'intra' | 'inter'>('intra');
  const [result, setResult] = useState<any>(null);

  const calc = async () => {
    setResult(await gstApi.calculate(parseFloat(amount) || 0, parseFloat(rate), type));
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>GST Calculator</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="GST Rate (%)"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Type
            </label>
            <div className="flex gap-2">
              <Button
                variant={type === 'intra' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setType('intra')}
              >
                Intra-State
              </Button>
              <Button
                variant={type === 'inter' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setType('inter')}
              >
                Inter-State
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={calc} disabled={!amount}>
          Calculate
        </Button>
        {result && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 mt-4">
            {type === 'intra' ? (
              <>
                <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-navy-800">
                  <p className="text-xs text-gray-400">CGST</p>
                  <p className="font-mono font-bold">₹{result.cgst.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-navy-800">
                  <p className="text-xs text-gray-400">SGST</p>
                  <p className="font-mono font-bold">₹{result.sgst.toFixed(2)}</p>
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-navy-800">
                <p className="text-xs text-gray-400">IGST</p>
                <p className="font-mono font-bold">₹{result.igst.toFixed(2)}</p>
              </div>
            )}
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-navy-800">
              <p className="text-xs text-gray-400">Total Tax</p>
              <p className="font-mono font-bold">₹{result.totalTax.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-primary-50 p-3 text-center dark:bg-primary-900/30 sm:col-span-2">
              <p className="text-xs text-primary-600 dark:text-primary-400">Total (incl. GST)</p>
              <p className="font-mono text-lg font-bold text-primary-700 dark:text-primary-300">
                ₹{result.total.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ValidateTab() {
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [gstinResult, setGstinResult] = useState<any>(null);
  const [panResult, setPanResult] = useState<any>(null);

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>GSTIN & PAN Validation</CardTitle>
      </CardHeader>
      <div className="space-y-6">
        <div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="GSTIN"
                placeholder="22AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={async () => setGstinResult(await gstApi.validateGstin(gstin))}
                disabled={gstin.length < 15}
              >
                Validate
              </Button>
            </div>
          </div>
          {gstinResult && (
            <Alert
              variant={gstinResult.valid ? 'success' : 'error'}
              title={gstinResult.valid ? 'GSTIN is valid' : 'GSTIN is invalid'}
            >
              {gstinResult.errors?.join('; ') || 'Valid GSTIN format'}
            </Alert>
          )}
        </div>
        <div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="PAN"
                placeholder="ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={async () => setPanResult(await gstApi.validatePan(pan))}
                disabled={pan.length < 10}
              >
                Validate
              </Button>
            </div>
          </div>
          {panResult && (
            <Alert
              variant={panResult.valid ? 'success' : 'error'}
              title={panResult.valid ? 'PAN is valid' : 'PAN is invalid'}
            >
              {panResult.errors?.join('; ') || 'Valid PAN format'}
            </Alert>
          )}
        </div>
      </div>
    </Card>
  );
}

function DueDatesTab() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [dates, setDates] = useState<any>(null);

  const fetchDates = async () => {
    setDates(await gstApi.dueDates(parseInt(year), parseInt(month)));
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>GST Due Dates</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-32"
          />
          <Input
            label="Month"
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-32"
            min="1"
            max="12"
          />
          <div className="flex items-end">
            <Button onClick={fetchDates}>Check</Button>
          </div>
        </div>
        {dates && (
          <div className="space-y-3">
            {Object.entries(dates).map(([key, val]: [string, any]) => {
              const isOverdue = new Date(val.dueDate) < new Date();
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-navy-800"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{val.form}</p>
                    <p className="text-sm text-gray-500">Period: {val.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium">
                      {new Date(val.dueDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
                      {isOverdue ? 'Overdue' : 'Upcoming'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function PenaltyTab() {
  const [taxAmount, setTaxAmount] = useState('');
  const [days, setDays] = useState('');
  const [form, setForm] = useState<'gstr1' | 'gstr3b'>('gstr3b');
  const [result, setResult] = useState<any>(null);

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Penalty Calculator</CardTitle>
      </CardHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Tax Amount (₹)"
            type="number"
            value={taxAmount}
            onChange={(e) => setTaxAmount(e.target.value)}
          />
          <Input
            label="Days Late"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Form
            </label>
            <div className="flex gap-2">
              <Button
                variant={form === 'gstr1' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setForm('gstr1')}
              >
                GSTR-1
              </Button>
              <Button
                variant={form === 'gstr3b' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setForm('gstr3b')}
              >
                GSTR-3B
              </Button>
            </div>
          </div>
        </div>
        <Button
          onClick={async () =>
            setResult(
              await gstApi.penalty({
                taxAmount: parseFloat(taxAmount),
                daysLate: parseInt(days),
                formType: form,
              }),
            )
          }
          disabled={!taxAmount || !days}
        >
          Calculate
        </Button>
        {result && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-900/20">
              <p className="text-xs text-amber-600">Late Fee</p>
              <p className="font-mono text-lg font-bold">₹{result.lateFee.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
              <p className="text-xs text-red-600">Interest/Penalty</p>
              <p className="font-mono text-lg font-bold">₹{result.penalty.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-navy-800">
              <p className="text-xs text-gray-400">Total</p>
              <p className="font-mono text-lg font-bold text-red-600">₹{result.total.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ItcTab() {
  const [result, setResult] = useState<any>(null);
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Input Tax Credit (ITC) Suggestions</CardTitle>
      </CardHeader>
      <p className="text-sm text-gray-500 mb-4">Analyze expenses to find ITC-eligible purchases</p>
      <Button onClick={async () => setResult(await gstApi.itcSuggestions([]))}>
        Analyze Expenses
      </Button>
      {result?.summary && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-primary-50 p-3 text-center dark:bg-primary-900/30">
            <p className="text-xs text-primary-600">Eligible ITC</p>
            <p className="font-mono font-bold text-primary-700 dark:text-primary-300">
              ₹{result.summary.totalEligible.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-navy-800">
            <p className="text-xs text-gray-400">Ineligible</p>
            <p className="font-mono font-bold">
              ₹{result.summary.totalIneligible.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-navy-800">
            <p className="text-xs text-gray-400">Eligible Items</p>
            <p className="font-mono font-bold">{result.summary.eligibleCount}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-navy-800">
            <p className="text-xs text-gray-400">Total Items</p>
            <p className="font-mono font-bold">{result.summary.totalCount}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
