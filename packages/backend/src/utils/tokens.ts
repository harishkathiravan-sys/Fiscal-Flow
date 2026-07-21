import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { env } from '../config/env';
import type { Role } from '@prisma/client';

// ─── JWT Payload ────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

// ─── Access Token ───────────────────────────

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

// ─── Refresh Token ──────────────────────────

export function generateRefreshToken(): string {
  return randomBytes(40).toString('hex');
}

// ─── Verification Token ─────────────────────

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

// ─── Reset Token ────────────────────────────

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

// ─── Expiry Helpers ─────────────────────────

export function getRefreshTokenExpiry(): Date {
  const days = 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function getVerificationTokenExpiry(): Date {
  const hours = 24;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function getResetTokenExpiry(): Date {
  const minutes = 60;
  return new Date(Date.now() + minutes * 60 * 1000);
}
