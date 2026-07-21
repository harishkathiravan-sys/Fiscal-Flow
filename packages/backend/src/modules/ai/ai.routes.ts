import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import * as aiService from './ai.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// ─── POST /api/ai/categorize ────────────────

router.post('/categorize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      description: z.string().min(1),
      amount: z.number().optional(),
      vendor: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const result = await aiService.categorizeExpense(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/ledger-entries ────────────

router.post('/ledger-entries', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      transactionDescription: z.string().min(1),
      amount: z.number().positive(),
      date: z.string().optional(),
      vendor: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const result = await aiService.suggestLedgerEntries(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/check-duplicates ──────────

router.post('/check-duplicates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      currentInvoice: z.object({
        vendor: z.string(),
        invoiceNumber: z.string(),
        amount: z.number(),
        date: z.string().optional(),
      }),
      recentInvoices: z.array(
        z.object({
          documentId: z.string(),
          vendor: z.string(),
          invoiceNumber: z.string(),
          amount: z.number(),
          date: z.string(),
        }),
      ),
    });
    const data = schema.parse(req.body);
    const result = await aiService.detectDuplicateInvoices(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/flag-gst ──────────────────

router.post('/flag-gst', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      invoice: z.object({
        vendor: z.string().optional(),
        gstin: z.string().optional(),
        subtotal: z.number().optional(),
        cgst: z.number().optional(),
        sgst: z.number().optional(),
        igst: z.number().optional(),
        total: z.number().optional(),
        hsnCode: z.string().optional(),
      }),
    });
    const data = schema.parse(req.body);
    const result = await aiService.flagMissingGst(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/journal-entry ─────────────

router.post('/journal-entry', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      transactionType: z.enum(['purchase', 'sale', 'expense', 'payment', 'receipt', 'other']),
      description: z.string().min(1),
      amount: z.number().positive(),
      taxAmount: z.number().optional(),
      vendor: z.string().optional(),
      client: z.string().optional(),
      date: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const result = await aiService.suggestJournalEntries(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/accounting-notes ──────────

router.post('/accounting-notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      period: z.string().optional(),
      transactions: z
        .array(
          z.object({
            description: z.string(),
            amount: z.number(),
            category: z.string().optional(),
          }),
        )
        .optional(),
      financialSummary: z
        .object({
          revenue: z.number(),
          expenses: z.number(),
          profit: z.number(),
        })
        .optional(),
    });
    const data = schema.parse(req.body);
    const result = await aiService.generateAccountingNotes(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/explain-invoice ───────────

router.post('/explain-invoice', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      rawText: z.string().optional(),
      vendor: z.string().optional(),
      invoiceNumber: z.string().optional(),
      total: z.number().optional(),
      items: z
        .array(
          z.object({
            description: z.string(),
            amount: z.number(),
            hsnCode: z.string().optional(),
          }),
        )
        .optional(),
      gst: z
        .object({
          cgst: z.number(),
          sgst: z.number(),
          igst: z.number(),
        })
        .optional(),
    });
    const data = schema.parse(req.body);
    const result = await aiService.explainInvoice(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/payment-reminders ─────────

router.post('/payment-reminders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      overdueInvoices: z.array(
        z.object({
          clientName: z.string(),
          invoiceNumber: z.string(),
          amount: z.number(),
          dueDate: z.string(),
          daysOverdue: z.number(),
        }),
      ),
      tone: z.enum(['professional', 'friendly', 'firm']).optional(),
    });
    const data = schema.parse(req.body);
    const result = await aiService.generatePaymentReminders(data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/ai/chat ──────────────────────

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      message: z.string().min(1),
      context: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const result = await aiService.chat(data);
    res.json({ success: true, data: { response: result } });
  } catch (err) {
    next(err);
  }
});

export default router;
