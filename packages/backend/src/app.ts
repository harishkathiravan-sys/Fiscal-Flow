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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// ─── Body Parsing ────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ─────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents', ocrRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/organizations', organizationRoutes);
// app.use('/api/accounts', accountRoutes);
// app.use('/api/journal-entries', journalEntryRoutes);
// app.use('/api/reports', reportRoutes);

// ─── 404 Handler ────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error Handler ───────────────────────────
app.use(errorHandler);

export default app;
