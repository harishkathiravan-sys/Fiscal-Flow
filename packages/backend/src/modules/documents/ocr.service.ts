import { prisma } from '../../config/database';
import { extractTextFromDocument } from '../../config/vision';
import { getPresignedUrl } from '../../config/s3';
import type { Prisma } from '@prisma/client';

// ─── Types ──────────────────────────────────

export interface OcrFieldResult {
  vendor: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  gstin: string | null;
  subtotal: number | null;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  total: number | null;
  hsnCode: string | null;
}

interface OcrConfidence {
  vendor: number;
  invoiceNumber: number;
  invoiceDate: number;
  gstin: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  hsnCode: number;
}

// ─── Process OCR for a Document ─────────────

export async function processDocumentOcr(documentId: string): Promise<void> {
  // Mark as processing
  await prisma.ocrExtraction.upsert({
    where: { documentId },
    update: { status: 'PROCESSING' },
    create: { documentId, status: 'PROCESSING' },
  });

  try {
    // Fetch document
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new Error('Document not found');

    // Get presigned URL and fetch the file
    const url = await getPresignedUrl(document.s3Key, 300);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch document from S3');
    const buffer = Buffer.from(await response.arrayBuffer());

    // Extract text via Google Vision
    const { text, confidence } = await extractTextFromDocument(buffer, document.mimeType);

    if (!text || text.trim().length === 0) {
      await prisma.ocrExtraction.update({
        where: { documentId },
        data: {
          status: 'FAILED',
          rawText: '',
          errorMessage: 'No text could be extracted from this document',
        },
      });
      return;
    }

    // Parse fields from extracted text
    const fields = extractInvoiceFields(text);
    const confidenceScores = calculateConfidence(text, fields);

    // Save extraction results
    await prisma.ocrExtraction.update({
      where: { documentId },
      data: {
        status: 'COMPLETED',
        rawText: text,
        vendor: fields.vendor,
        invoiceNumber: fields.invoiceNumber,
        invoiceDate: fields.invoiceDate ? new Date(fields.invoiceDate) : null,
        gstin: fields.gstin,
        subtotal: fields.subtotal,
        cgst: fields.cgst,
        sgst: fields.sgst,
        igst: fields.igst,
        total: fields.total,
        hsnCode: fields.hsnCode,
        confidence: confidenceScores as any,
      },
    });

    // Update document OCR status
    await prisma.document.update({
      where: { id: documentId },
      data: { ocrStatus: 'COMPLETED' },
    });
  } catch (error: any) {
    console.error(`OCR processing failed for document ${documentId}:`, error);

    await prisma.ocrExtraction.update({
      where: { documentId },
      data: {
        status: 'FAILED',
        errorMessage: error.message || 'OCR processing failed',
      },
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { ocrStatus: 'FAILED' },
    });
  }
}

// ─── GST Invoice Field Extractor ────────────

export function extractInvoiceFields(text: string): OcrFieldResult {
  const lines = text.split('\n').map((l) => l.trim());

  return {
    vendor: extractVendor(text, lines),
    invoiceNumber: extractInvoiceNumber(text, lines),
    invoiceDate: extractInvoiceDate(text, lines),
    gstin: extractGstin(text),
    subtotal: extractAmount(text, [
      'subtotal',
      'sub total',
      'amount before tax',
      'taxable amount',
      'net amount',
    ]),
    cgst: extractGstinTax(text, 'cgst'),
    sgst: extractGstinTax(text, 'sgst'),
    igst: extractGstinTax(text, 'igst'),
    total: extractAmount(text, [
      'total',
      'grand total',
      'amount payable',
      'balance due',
      'total amount',
      'net payable',
    ]),
    hsnCode: extractHsnCode(text),
  };
}

// ─── Individual Extractors ──────────────────

function extractVendor(text: string, lines: string[]): string | null {
  // Usually the vendor name is in the first few lines
  // Look for "From:", "Seller:", "Vendor:", "Supplier:" prefix
  const prefixes = /^(from|seller|vendor|supplier|billed?\s+by|company)\s*[:\-]/i;
  for (const line of lines.slice(0, 10)) {
    const match = line.match(prefixes);
    if (match) {
      return line.slice(match[0].length).trim() || null;
    }
  }

  // Fallback: first non-empty line that looks like a name (not a number, not too short)
  for (const line of lines.slice(0, 5)) {
    const clean = line.replace(/[^a-zA-Z\s&.,'-]/g, '').trim();
    if (
      clean.length > 3 &&
      !/^\d/.test(clean) &&
      !/invoice|bill|receipt|tax|date|number/i.test(clean)
    ) {
      return clean;
    }
  }

  return null;
}

function extractInvoiceNumber(text: string, lines: string[]): string | null {
  // Patterns: "Invoice No:", "Inv #", "Invoice Number:", "Bill No:", "Receipt No:"
  const patterns = [
    /(?:invoice|inv|bill|receipt)\s*(?:no|num|number|#)\.?\s*[:\-]?\s*([A-Za-z0-9\/\-]+)/i,
    /(?:reference|ref)\s*(?:no|num|number|#)\.?\s*[:\-]?\s*([A-Za-z0-9\/\-]+)/i,
    /(?:order)\s*(?:no|num|number|#)\.?\s*[:\-]?\s*([A-Za-z0-9\/\-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

function extractInvoiceDate(text: string, lines: string[]): string | null {
  // Patterns: "Date:", "Invoice Date:", "Dated:"
  const datePatterns = [
    /(?:invoice\s+)?date\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(?:invoice\s+)?date\s*[:\-]?\s*(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
    /dated?\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = parseFlexibleDate(match[1].trim());
      if (parsed) return parsed;
    }
  }

  return null;
}

function parseFlexibleDate(dateStr: string): string | null {
  // Try DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = dateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
  if (slashMatch) {
    let [, day, month, year] = slashMatch;
    if (year.length === 2) year = '20' + year;
    const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // Try "DD Mon YYYY"
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];

  return null;
}

function extractGstin(text: string): string | null {
  // GSTIN format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
  const gstinPattern = /\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9])\b/;
  const match = text.match(gstinPattern);
  return match ? match[1] : null;
}

function extractAmount(text: string, keywords: string[]): number | null {
  const lowerText = text.toLowerCase();

  for (const keyword of keywords) {
    // Look for pattern: keyword ... ₹/$/Rs. followed by amount
    const patterns = [
      new RegExp(`${keyword}\\s*[:\-]?\\s*[₹$Rs.]*\\s*([\\d,]+\\.?\\d*)`, 'i'),
      new RegExp(`[₹$Rs.]*\\s*([\\d,]+\\.\\d{2})\\s*${keyword}`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) return amount;
      }
    }
  }

  return null;
}

function extractGstinTax(text: string, taxType: 'cgst' | 'sgst' | 'igst'): number | null {
  const lowerText = text.toLowerCase();
  const typeUpper = taxType.toUpperCase();

  // Look for: "CGST @18%" or "CGST 9%" or "CGST Amount: ₹123.45"
  const patterns = [
    new RegExp(
      `${typeUpper}\\s*[@%]?\\s*(\\d+\\.?\\d*)%?\\s*[:\-]?\\s*[₹$Rs.]*\\s*([\\d,]+\\.?\\d*)`,
      'i',
    ),
    new RegExp(`[₹$Rs.]*\\s*([\\d,]+\\.\\d{2})\\s*${typeUpper}`, 'i'),
    new RegExp(`${typeUpper}\\s*[:\-]?\\s*[₹$Rs.]?\\s*([\\d,]+\\.?\\d*)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = lowerText.match(pattern);
    if (match) {
      // If group 2 exists, that's the amount; otherwise group 1
      const amountStr = match[2] || match[1];
      const amount = parseFloat(amountStr.replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0 && amount < 10000000) return amount;
    }
  }

  return null;
}

function extractHsnCode(text: string): string | null {
  // HSN code: 4-8 digit number often preceded by "HSN"
  const patterns = [/hsn\s*(?:code|no)?\s*[:\-]?\s*(\d{4,8})/i, /\bhsn\s*[:\-]?\s*(\d{4,8})\b/i];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// ─── Confidence Calculator ──────────────────

function calculateConfidence(text: string, fields: OcrFieldResult): OcrConfidence {
  const hasText = (val: string | null) => (val && val.length > 0 ? 0.9 : 0);
  const hasNum = (val: number | null) => (val !== null && val > 0 ? 0.95 : 0);

  return {
    vendor: hasText(fields.vendor),
    invoiceNumber: hasText(fields.invoiceNumber),
    invoiceDate: hasText(fields.invoiceDate),
    gstin:
      fields.gstin && /^\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z0-9]$/.test(fields.gstin)
        ? 0.99
        : hasText(fields.gstin),
    subtotal: hasNum(fields.subtotal),
    cgst: hasNum(fields.cgst),
    sgst: hasNum(fields.sgst),
    igst: hasNum(fields.igst),
    total: hasNum(fields.total),
    hsnCode: hasText(fields.hsnCode),
  };
}

// ─── Get Extraction Result ──────────────────

export async function getOcrResult(documentId: string) {
  const extraction = await prisma.ocrExtraction.findUnique({
    where: { documentId },
  });
  return extraction;
}

// ─── Update Extraction (manual correction) ──

export async function updateOcrExtraction(documentId: string, data: Partial<OcrFieldResult>) {
  const extraction = await prisma.ocrExtraction.findUnique({
    where: { documentId },
  });

  if (!extraction) {
    throw new Error('OCR extraction not found');
  }

  const updated = await prisma.ocrExtraction.update({
    where: { documentId },
    data: {
      ...data,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined,
      isCorrected: true,
    },
  });

  return updated;
}
