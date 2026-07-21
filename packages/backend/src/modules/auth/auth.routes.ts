import { Router, Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validation';
import * as authService from './auth.service';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Helper to extract client info
function getClientInfo(req: Request) {
  return {
    userAgent: req.headers['user-agent'] || undefined,
    ipAddress: ((req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip) ?? undefined,
  };
}

// ─── POST /api/auth/register ────────────────

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const { userAgent, ipAddress } = getClientInfo(req);
    const result = await authService.register(data, userAgent, ipAddress);

    res.status(201).json({
      message: 'Account created successfully. Please verify your email.',
      user: result.user,
      organization: result.organization,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      verificationToken: result.verificationToken,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ───────────────────

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const { userAgent, ipAddress } = getClientInfo(req);
    const result = await authService.login(data, userAgent, ipAddress);

    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/refresh ─────────────────

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshAccessToken(data.refreshToken);

    res.json({
      message: 'Token refreshed',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout ──────────────────

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = refreshTokenSchema.parse(req.body);
    await authService.logout(data.refreshToken);

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout-all ──────────────

router.post(
  '/logout-all',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.logoutAll(req.user!.sub);
      res.json({ message: 'All sessions terminated' });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /api/auth/forgot-password ─────────

router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(data.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/reset-password ──────────

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(data.token, data.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/verify-email ────────────

router.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(data.token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ───────────────────────

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getCurrentUser(req.user!.sub);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
