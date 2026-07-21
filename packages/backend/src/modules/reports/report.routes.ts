import { Router, type Request, type Response, type NextFunction } from 'express';
import * as reportService from './report.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

function parseDates(req: Request) {
  const start = req.query.startDate
    ? new Date(String(req.query.startDate))
    : new Date(new Date().getFullYear(), 0, 1);
  const end = req.query.endDate ? new Date(String(req.query.endDate)) : new Date();
  return { start, end };
}

router.get('/pnl', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end } = parseDates(req);
    res.json(await reportService.getProfitAndLoss(req.user!.sub, start, end));
  } catch (err) {
    next(err);
  }
});

router.get('/balance-sheet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await reportService.getBalanceSheet(req.user!.sub));
  } catch (err) {
    next(err);
  }
});

router.get('/cash-flow', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end } = parseDates(req);
    res.json(await reportService.getCashFlow(req.user!.sub, start, end));
  } catch (err) {
    next(err);
  }
});

router.get('/expense-analysis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end } = parseDates(req);
    res.json(await reportService.getExpenseAnalysis(req.user!.sub, start, end));
  } catch (err) {
    next(err);
  }
});

router.get('/invoice-report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end } = parseDates(req);
    res.json(await reportService.getInvoiceReport(req.user!.sub, start, end));
  } catch (err) {
    next(err);
  }
});

router.get('/revenue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end } = parseDates(req);
    res.json(await reportService.getRevenueReport(req.user!.sub, start, end));
  } catch (err) {
    next(err);
  }
});

export default router;
