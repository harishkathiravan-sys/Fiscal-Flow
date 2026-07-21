import { Router, type Request, type Response, type NextFunction } from 'express';
import * as insightService from './insight.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ insights: await insightService.getInsights(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ insights: await insightService.generateInsights(req.user!.sub) });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/dismiss', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await insightService.dismissInsight(String(req.params.id)));
  } catch (err) {
    next(err);
  }
});

export default router;
