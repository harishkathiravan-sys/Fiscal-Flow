import { prisma } from '../../config/database';
import { hashPassword, comparePassword, validatePasswordStrength } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generateResetToken,
  getRefreshTokenExpiry,
  getVerificationTokenExpiry,
  getResetTokenExpiry,
} from '../../utils/tokens';
import type { Role } from '@prisma/client';
import type { RegisterInput, LoginInput } from './auth.validation';

// ─── Errors ─────────────────────────────────

export class AuthError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ─── Register ───────────────────────────────

export async function register(data: RegisterInput, userAgent?: string, ipAddress?: string) {
  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AuthError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  // Validate password strength
  const passwordCheck = validatePasswordStrength(data.password);
  if (!passwordCheck.valid) {
    throw new AuthError(passwordCheck.errors.join('. '), 400, 'WEAK_PASSWORD');
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user + org + membership in transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'ADMIN',
        emailVerified: false,
      },
    });

    // Create organization if name provided
    let organization = null;
    if (data.organizationName) {
      organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          memberships: {
            create: {
              userId: user.id,
              role: 'ADMIN',
            },
          },
        },
      });
    }

    // Generate verification token
    const verificationToken = await tx.verificationToken.create({
      data: {
        token: generateVerificationToken(),
        userId: user.id,
        type: 'EMAIL_VERIFICATION',
        expiresAt: getVerificationTokenExpiry(),
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    });

    const refreshTokenValue = generateRefreshToken();
    await tx.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      organization: organization ? { id: organization.id, name: organization.name } : null,
      accessToken,
      refreshToken: refreshTokenValue,
      verificationToken: verificationToken.token,
    };
  });

  return result;
}

// ─── Login ──────────────────────────────────

export async function login(data: LoginInput, userAgent?: string, ipAddress?: string) {
  // Find user
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AuthError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AuthError('Your account has been deactivated', 403, 'ACCOUNT_DISABLED');
  }

  // Verify password
  const validPassword = await comparePassword(data.password, user.password);
  if (!validPassword) {
    throw new AuthError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role as Role,
  });

  const refreshTokenValue = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      userAgent,
      ipAddress,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
    },
    accessToken,
    refreshToken: refreshTokenValue,
  };
}

// ─── Refresh Token ──────────────────────────

export async function refreshAccessToken(refreshTokenValue: string) {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: true },
  });

  if (!refreshToken) {
    throw new AuthError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  if (refreshToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
    throw new AuthError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
  }

  if (!refreshToken.user.isActive) {
    throw new AuthError('Your account has been deactivated', 403, 'ACCOUNT_DISABLED');
  }

  // Rotate refresh token (delete old, create new)
  await prisma.refreshToken.delete({ where: { id: refreshToken.id } });

  const newRefreshTokenValue = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      token: newRefreshTokenValue,
      userId: refreshToken.user.id,
      userAgent: refreshToken.userAgent,
      ipAddress: refreshToken.ipAddress,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  const accessToken = generateAccessToken({
    sub: refreshToken.user.id,
    email: refreshToken.user.email,
    role: refreshToken.user.role as Role,
  });

  return {
    user: {
      id: refreshToken.user.id,
      email: refreshToken.user.email,
      name: refreshToken.user.name,
      role: refreshToken.user.role,
      avatar: refreshToken.user.avatar,
      emailVerified: refreshToken.user.emailVerified,
    },
    accessToken,
    refreshToken: newRefreshTokenValue,
  };
}

// ─── Logout ─────────────────────────────────

export async function logout(refreshTokenValue: string) {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshTokenValue },
  });
}

// ─── Logout All Sessions ────────────────────

export async function logoutAll(userId: string) {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

// ─── Forgot Password ────────────────────────

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: 'If an account exists with that email, a reset link has been sent.' };
  }

  // Invalidate old reset tokens
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Create new reset token
  const resetToken = await prisma.passwordReset.create({
    data: {
      token: generateResetToken(),
      userId: user.id,
      expiresAt: getResetTokenExpiry(),
    },
  });

  // TODO: Send email with resetToken.token
  console.log(`[DEV] Password reset token for ${email}: ${resetToken.token}`);

  return {
    message: 'If an account exists with that email, a reset link has been sent.',
    // Only in development — remove in production
    _devToken: process.env.NODE_ENV === 'development' ? resetToken.token : undefined,
  };
}

// ─── Reset Password ─────────────────────────

export async function resetPassword(token: string, newPassword: string) {
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetRecord) {
    throw new AuthError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  if (resetRecord.usedAt) {
    throw new AuthError('Reset token has already been used', 400, 'RESET_TOKEN_USED');
  }

  if (resetRecord.expiresAt < new Date()) {
    throw new AuthError('Reset token has expired', 400, 'RESET_TOKEN_EXPIRED');
  }

  // Validate password strength
  const passwordCheck = validatePasswordStrength(newPassword);
  if (!passwordCheck.valid) {
    throw new AuthError(passwordCheck.errors.join('. '), 400, 'WEAK_PASSWORD');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    // Update password
    await tx.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await tx.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all refresh tokens (force re-login)
    await tx.refreshToken.deleteMany({
      where: { userId: resetRecord.userId },
    });
  });

  return { message: 'Password reset successful. Please log in with your new password.' };
}

// ─── Verify Email ───────────────────────────

export async function verifyEmail(token: string) {
  const verificationRecord = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationRecord) {
    throw new AuthError('Invalid verification token', 400, 'INVALID_VERIFICATION_TOKEN');
  }

  if (verificationRecord.usedAt) {
    throw new AuthError('Verification token has already been used', 400, 'VERIFICATION_TOKEN_USED');
  }

  if (verificationRecord.expiresAt < new Date()) {
    throw new AuthError('Verification token has expired', 400, 'VERIFICATION_TOKEN_EXPIRED');
  }

  if (verificationRecord.type !== 'EMAIL_VERIFICATION') {
    throw new AuthError('Invalid token type', 400, 'INVALID_TOKEN_TYPE');
  }

  await prisma.$transaction(async (tx) => {
    // Mark email as verified
    await tx.user.update({
      where: { id: verificationRecord.userId },
      data: { emailVerified: true },
    });

    // Mark token as used
    await tx.verificationToken.update({
      where: { id: verificationRecord.id },
      data: { usedAt: new Date() },
    });
  });

  return { message: 'Email verified successfully' };
}

// ─── Get Current User ───────────────────────

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          organization: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AuthError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}
