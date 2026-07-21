import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import * as bankService from './bank.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await bankService.listTransactions(req.user!.sub, req.query));
  } catch (err) {
    next(err);
  }
});

router.get('/subscriptions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ subscriptions: await bankService.getSubscriptions(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

router.get('/insights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await bankService.getInsights(req.user!.sub));
  } catch (err) {
    next(err);
  }
});

router.post(
  '/import',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }
      const text = req.file.buffer.toString('utf-8');
      const isCSV = req.file.mimetype === 'text/csv' || req.file.originalname.endsWith('.csv');
      const transactions = isCSV
        ? bankService.parseCsvStatement(text)
        : bankService.parsePdfStatement(text);
      const result = await bankService.importTransactions(
        req.user!.sub,
        req.user!.sub,
        req.file.originalname,
        req.file.mimetype,
        transactions,
      );
      res.json({ message: `${result.count} transactions imported`, ...result });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
