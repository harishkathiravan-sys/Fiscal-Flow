import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  recordPaymentSchema,
  recurringInvoiceSchema,
  emailInvoiceSchema,
  invoiceQuerySchema,
} from './invoice.validation';
import * as invoiceService from './invoice.service';
import { generateInvoicePdf } from './invoice-pdf';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// ─── GET /api/invoices/stats ────────────────

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await invoiceService.getInvoiceStats(req.user!.sub);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/invoices/recurring ────────────

router.get('/recurring', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recurring = await invoiceService.listRecurringInvoices(req.user!.sub);
    res.json({ recurring });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/invoices/recurring ───────────

router.post('/recurring', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = recurringInvoiceSchema.parse(req.body);
    const result = await invoiceService.createRecurringInvoice(req.user!.sub, req.user!.sub, data);
    res.status(201).json({ message: 'Recurring invoice created', recurring: result });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/invoices/recurring/:id/toggle ─

router.patch('/recurring/:id/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.toggleRecurringInvoice(
      String(req.params.id),
      req.user!.sub,
    );
    res.json({ recurring: result });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/invoices ──────────────────────

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = invoiceQuerySchema.parse(req.query);
    const result = await invoiceService.listInvoices(req.user!.sub, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/invoices/:id ──────────────────

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.getInvoice(String(req.params.id), req.user!.sub);
    res.json({ invoice });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/invoices ─────────────────────

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createInvoiceSchema.parse(req.body);
    const invoice = await invoiceService.createInvoice(req.user!.sub, req.user!.sub, data);
    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/invoices/:id ──────────────────

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateInvoiceSchema.parse(req.body);
    const invoice = await invoiceService.updateInvoice(String(req.params.id), req.user!.sub, data);
    res.json({ message: 'Invoice updated', invoice });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/invoices/:id ───────────────

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.deleteInvoice(String(req.params.id), req.user!.sub);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/invoices/:id/duplicate ───────

router.post('/:id/duplicate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.duplicateInvoice(
      String(req.params.id),
      req.user!.sub,
      req.user!.sub,
    );
    res.status(201).json({ message: 'Invoice duplicated', invoice });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/invoices/:id/payments ────────

router.post('/:id/payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = recordPaymentSchema.parse(req.body);
    const result = await invoiceService.recordPayment(String(req.params.id), req.user!.sub, data);
    res.status(201).json({ message: 'Payment recorded', ...result });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/invoices/:id/pdf ──────────────

router.get('/:id/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.getInvoice(String(req.params.id), req.user!.sub);

    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: new Date(invoice.issueDate).toLocaleDateString('en-IN'),
      dueDate: new Date(invoice.dueDate).toLocaleDateString('en-IN'),
      status: invoice.status,
      from: {
        name: 'FiscalFlow',
        address: 'Your Business Address',
        gstin: invoice.gstin || undefined,
        pan: invoice.pan || undefined,
      },
      to: {
        name: invoice.client.name,
        address: invoice.billingAddress || invoice.client.address || undefined,
        gstin: invoice.client.gstin || undefined,
      },
      items: invoice.items.map((item) => ({
        description: item.description,
        hsnCode: item.hsnCode || undefined,
        quantity: item.quantity.toNumber(),
        unitPrice: item.unitPrice.toNumber(),
        gstRate: item.gstRate.toNumber(),
        amount: item.amount.toNumber(),
      })),
      subtotal: invoice.subtotal.toNumber(),
      discountPercent: invoice.discountPercent?.toNumber(),
      discountAmount: invoice.discountAmount.toNumber(),
      cgst: invoice.cgst.toNumber(),
      sgst: invoice.sgst.toNumber(),
      igst: invoice.igst.toNumber(),
      totalTax: invoice.totalTax.toNumber(),
      total: invoice.total.toNumber(),
      amountPaid: invoice.amountPaid.toNumber(),
      balanceDue: invoice.balanceDue.toNumber(),
      notes: invoice.notes || undefined,
      terms: invoice.terms || undefined,
    };

    const pdfBuffer = await generateInvoicePdf(pdfData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/invoices/:id/email ───────────

router.post('/:id/email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Email sending logic would go here
    // For now, return success
    const data = emailInvoiceSchema.parse(req.body);
    res.json({ message: `Invoice email would be sent to ${data.to}` });
  } catch (err) {
    next(err);
  }
});

export default router;
