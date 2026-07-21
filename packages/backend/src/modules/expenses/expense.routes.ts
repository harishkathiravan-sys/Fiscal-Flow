import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import * as expenseService from './expense.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  gstAmount: z.coerce.number().optional(),
  isRecurring: z.boolean().optional(),
});

router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await expenseService.getExpenseStats(req.user!.sub));
  } catch (err) {
    next(err);
  }
});

router.get('/vendors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ vendors: await expenseService.getVendorHistory(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

router.get('/monthly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    res.json(await expenseService.getMonthlyReport(req.user!.sub, year, month));
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await expenseService.listExpenses(req.user!.sub, req.query));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSchema.parse(req.body);
    const expense = await expenseService.createExpense(req.user!.sub, req.user!.sub, data);
    res.status(201).json({ message: 'Expense created', expense });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSchema.partial().parse(req.body);
    const expense = await expenseService.updateExpense(String(req.params.id), req.user!.sub, data);
    res.json({ message: 'Expense updated', expense });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await expenseService.deleteExpense(String(req.params.id), req.user!.sub));
  } catch (err) {
    next(err);
  }
});

export default router;
