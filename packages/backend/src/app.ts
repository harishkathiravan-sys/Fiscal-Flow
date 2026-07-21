import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import clientRoutes from './modules/clients/client.routes';
import documentRoutes from './modules/documents/document.routes';
import ocrRoutes from './modules/documents/ocr.routes';
import aiRoutes from './modules/ai/ai.routes';
import invoiceRoutes from './modules/invoices/invoice.routes';
import expenseRoutes from './modules/expenses/expense.routes';
import bankRoutes from './modules/bank/bank.routes';
import gstRoutes from './modules/gst/gst.routes';
import reportRoutes from './modules/reports/report.routes';
import insightRoutes from './modules/insights/insight.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// ─── Security ────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? process.env['FRONTEND_URL'] : 'http://localhost:5173',
    credentials: true,
  }),
);

// ─── Rate Limiting ───────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts.' },
});
app.use('/api/auth', authLimiter);

// ─── Body Parsing ────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: env.NODE_ENV });
});

// ─── API Routes ─────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents', ocrRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/insights', insightRoutes);

// ─── 404 & Error ────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.use(errorHandler);

export default app;
