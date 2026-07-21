import { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { AuthError } from '../modules/auth/auth.service';

// ─── Require Role ───────────────────────────

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError('Authentication required', 401, 'NO_TOKEN'));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(
        new AuthError(
          `Access denied. Required role: ${roles.join(' or ')}`,
          403,
          'INSUFFICIENT_PERMISSIONS',
        ),
      );
    }

    next();
  };
}

// ─── Require Admin ──────────────────────────

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  return requireRole('ADMIN')(req, _res, next);
}

// ─── Require Accountant or Admin ────────────

export function requireAccountantOrAbove(req: Request, _res: Response, next: NextFunction) {
  return requireRole('ADMIN', 'ACCOUNTANT')(req, _res, next);
}
