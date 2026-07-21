import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AuthError } from '../modules/auth/auth.service';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: messages,
    });
  }

  // Auth errors
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  // Unknown errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
  });
}
