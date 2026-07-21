import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import * as gstService from './gst.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.post('/calculate', (req: Request, res: Response) => {
  const { amount, rate, type } = req.body;
  res.json(gstService.calculateGst(Number(amount), Number(rate), type));
});

router.post('/validate-gstin', (req: Request, res: Response) => {
  res.json(gstService.validateGstin(req.body.gstin));
});

router.post('/validate-pan', (req: Request, res: Response) => {
  res.json(gstService.validatePan(req.body.pan));
});

router.get('/due-dates', (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const month = Number(req.query.month) || new Date().getMonth() + 1;
  res.json(gstService.getGstDueDates(year, month));
});

router.post('/penalty', (req: Request, res: Response) => {
  res.json(gstService.calculatePenalty(req.body));
});

router.post('/itc-suggestions', (req: Request, res: Response) => {
  res.json(gstService.getItcSuggestions(req.body.expenses || []));
});

router.post('/summary', (req: Request, res: Response) => {
  res.json(gstService.generateGstSummary(req.body));
});

export default router;
