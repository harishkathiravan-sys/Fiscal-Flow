import { api } from './api';

// ─── Types ──────────────────────────────────

export interface OcrExtraction {
  id: string;
  documentId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  rawText?: string;
  vendor?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  gstin?: string;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  total?: number;
  hsnCode?: string;
  confidence?: Record<string, number>;
  errorMessage?: string;
  isCorrected: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── API ────────────────────────────────────

export const ocrApi = {
  get: (documentId: string) =>
    api<{ extraction: OcrExtraction | null }>(`/documents/${documentId}/ocr`),

  update: (documentId: string, data: Partial<OcrExtraction>) =>
    api<{ message: string; extraction: OcrExtraction }>(`/documents/${documentId}/ocr`, {
      method: 'PUT',
      body: data,
    }),

  process: (documentId: string) =>
    api<{ message: string }>(`/documents/${documentId}/ocr/process`, { method: 'POST' }),
};
