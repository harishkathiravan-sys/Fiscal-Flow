import { useState, useEffect } from 'react';
import { useOcrExtraction, useUpdateOcrExtraction, useProcessOcr } from '../../hooks/useDocuments';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Alert } from '../ui/Alert';
import type { OcrExtraction } from '../../services/ocr';

// ─── Props ──────────────────────────────────

interface OcrPanelProps {
  documentId: string;
}

// ─── Component ──────────────────────────────

export function OcrPanel({ documentId }: OcrPanelProps) {
  const { data, isLoading } = useOcrExtraction(documentId);
  const updateMutation = useUpdateOcrExtraction(documentId);
  const processMutation = useProcessOcr();

  const extraction = data?.extraction;
  const status = extraction?.status;

  // Poll status — refetches automatically via refetchInterval
  // No manual polling needed

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Data (OCR)</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 py-8 justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Loading extraction data...
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // No extraction yet
  if (!extraction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Data (OCR)</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="py-8 text-center">
            <svg
              className="mx-auto h-10 w-10 text-gray-300 dark:text-navy-700"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No OCR data yet</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              loading={processMutation.isPending}
              onClick={() => processMutation.mutate(documentId)}
            >
              Run OCR Extraction
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Processing state
  if (status === 'PROCESSING' || status === 'PENDING') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Data (OCR)</CardTitle>
            <Badge variant="warning" dot>
              Processing
            </Badge>
          </div>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 py-6 justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Extracting invoice data with Google Vision...
            </span>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            This usually takes 5-15 seconds
          </p>
        </div>
      </Card>
    );
  }

  // Failed state
  if (status === 'FAILED') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Data (OCR)</CardTitle>
            <Badge variant="danger" dot>
              Failed
            </Badge>
          </div>
        </CardHeader>
        <div className="px-6 pb-6">
          <Alert variant="error" title="Extraction failed">
            {extraction.errorMessage || 'Could not extract text from this document.'}
          </Alert>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            loading={processMutation.isPending}
            onClick={() => processMutation.mutate(documentId)}
          >
            Retry OCR
          </Button>
        </div>
      </Card>
    );
  }

  // Completed — show editable form
  return (
    <OcrExtractionForm
      extraction={extraction}
      onSave={(data) => updateMutation.mutateAsync(data)}
      isSaving={updateMutation.isPending}
    />
  );
}

// ─── Editable Form ──────────────────────────

function OcrExtractionForm({
  extraction,
  onSave,
  isSaving,
}: {
  extraction: OcrExtraction;
  onSave: (data: Partial<OcrExtraction>) => Promise<any>;
  isSaving: boolean;
}) {
  const [fields, setFields] = useState({
    vendor: extraction.vendor || '',
    invoiceNumber: extraction.invoiceNumber || '',
    invoiceDate: extraction.invoiceDate
      ? new Date(extraction.invoiceDate).toISOString().split('T')[0]
      : '',
    gstin: extraction.gstin || '',
    subtotal: extraction.subtotal?.toString() || '',
    cgst: extraction.cgst?.toString() || '',
    sgst: extraction.sgst?.toString() || '',
    igst: extraction.igst?.toString() || '',
    total: extraction.total?.toString() || '',
    hsnCode: extraction.hsnCode || '',
  });

  const [saved, setSaved] = useState(false);

  const setField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    await onSave({
      vendor: fields.vendor || undefined,
      invoiceNumber: fields.invoiceNumber || undefined,
      invoiceDate: fields.invoiceDate || undefined,
      gstin: fields.gstin || undefined,
      subtotal: fields.subtotal ? parseFloat(fields.subtotal) : undefined,
      cgst: fields.cgst ? parseFloat(fields.cgst) : undefined,
      sgst: fields.sgst ? parseFloat(fields.sgst) : undefined,
      igst: fields.igst ? parseFloat(fields.igst) : undefined,
      total: fields.total ? parseFloat(fields.total) : undefined,
      hsnCode: fields.hsnCode || undefined,
    });
    setSaved(true);
  };

  // Confidence-based styling
  const conf = extraction.confidence || {};
  const confidenceLevel = (field: string) => {
    const score = conf[field] || 0;
    if (score >= 0.9) return 'border-l-primary-500';
    if (score >= 0.5) return 'border-l-amber-400';
    return 'border-l-red-400';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Invoice Data (OCR)</CardTitle>
            {extraction.isCorrected && (
              <Badge variant="info" size="sm">
                Manually corrected
              </Badge>
            )}
          </div>
          <Badge variant="success" dot>
            Extracted
          </Badge>
        </div>
      </CardHeader>
      <div className="px-6 pb-6 space-y-4">
        {/* Vendor & Invoice Number */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={`border-l-2 pl-3 ${confidenceLevel('vendor')}`}>
            <Input
              label="Vendor / Supplier"
              value={fields.vendor}
              onChange={(e) => setField('vendor', e.target.value)}
              placeholder="Vendor name"
            />
          </div>
          <div className={`border-l-2 pl-3 ${confidenceLevel('invoiceNumber')}`}>
            <Input
              label="Invoice Number"
              value={fields.invoiceNumber}
              onChange={(e) => setField('invoiceNumber', e.target.value)}
              placeholder="INV-001"
            />
          </div>
        </div>

        {/* Date & GSTIN */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={`border-l-2 pl-3 ${confidenceLevel('invoiceDate')}`}>
            <Input
              label="Invoice Date"
              type="date"
              value={fields.invoiceDate}
              onChange={(e) => setField('invoiceDate', e.target.value)}
            />
          </div>
          <div className={`border-l-2 pl-3 ${confidenceLevel('gstin')}`}>
            <Input
              label="GSTIN"
              value={fields.gstin}
              onChange={(e) => setField('gstin', e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="rounded-lg border border-gray-200 dark:border-navy-800 p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Amounts
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={`border-l-2 pl-3 ${confidenceLevel('subtotal')}`}>
              <Input
                label="Subtotal"
                type="number"
                value={fields.subtotal}
                onChange={(e) => setField('subtotal', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={`border-l-2 pl-3 ${confidenceLevel('cgst')}`}>
              <Input
                label="CGST"
                type="number"
                value={fields.cgst}
                onChange={(e) => setField('cgst', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={`border-l-2 pl-3 ${confidenceLevel('sgst')}`}>
              <Input
                label="SGST"
                type="number"
                value={fields.sgst}
                onChange={(e) => setField('sgst', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={`border-l-2 pl-3 ${confidenceLevel('igst')}`}>
              <Input
                label="IGST"
                type="number"
                value={fields.igst}
                onChange={(e) => setField('igst', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className={`border-l-2 pl-3 ${confidenceLevel('total')}`}>
              <Input
                label="Total"
                type="number"
                value={fields.total}
                onChange={(e) => setField('total', e.target.value)}
                placeholder="0.00"
                className="text-base font-bold"
              />
            </div>
            <div className={`border-l-2 pl-3 ${confidenceLevel('hsnCode')}`}>
              <Input
                label="HSN Code"
                value={fields.hsnCode}
                onChange={(e) => setField('hsnCode', e.target.value)}
                placeholder="998314"
              />
            </div>
          </div>
        </div>

        {/* Confidence Legend */}
        <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-3 w-1 rounded-full bg-primary-500" /> High confidence
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-1 rounded-full bg-amber-400" /> Medium confidence
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-1 rounded-full bg-red-400" /> Low confidence
          </span>
        </div>

        {/* Raw Text (collapsible) */}
        {extraction.rawText && (
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              View raw extracted text
            </summary>
            <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-navy-800 dark:text-gray-400 whitespace-pre-wrap">
              {extraction.rawText}
            </pre>
          </details>
        )}

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && (
            <span className="text-xs text-primary-600 dark:text-primary-400 animate-fade-in">
              ✓ Saved
            </span>
          )}
          <Button onClick={handleSave} loading={isSaving} size="sm">
            Save Corrections
          </Button>
        </div>
      </div>
    </Card>
  );
}
