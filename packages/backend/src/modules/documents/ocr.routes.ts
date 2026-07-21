import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import * as ocrService from './ocr.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// ─── GET /api/documents/:id/ocr ─────────────

router.get('/:id/ocr', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const extraction = await ocrService.getOcrResult(String(req.params.id));
    res.json({ extraction });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/documents/:id/ocr ─────────────

const updateSchema = z.object({
  vendor: z.string().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
  invoiceDate: z.string().nullable().optional(),
  gstin: z.string().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  cgst: z.number().nullable().optional(),
  sgst: z.number().nullable().optional(),
  igst: z.number().nullable().optional(),
  total: z.number().nullable().optional(),
  hsnCode: z.string().nullable().optional(),
});

router.put('/:id/ocr', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSchema.parse(req.body);
    const extraction = await ocrService.updateOcrExtraction(String(req.params.id), data);
    res.json({ message: 'OCR extraction updated', extraction });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/documents/:id/ocr/process ────

router.post('/:id/ocr/process', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Start OCR processing (runs async, returns immediately)
    ocrService.processDocumentOcr(String(req.params.id)).catch((err) => {
      console.error('OCR processing error:', err);
    });

    res.json({ message: 'OCR processing started' });
  } catch (err) {
    next(err);
  }
});

export default router;
