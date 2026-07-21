const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ─── Token Storage ──────────────────────────

const TOKEN_KEY = 'fiscalflow_access_token';
const REFRESH_KEY = 'fiscalflow_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ─── API Client ─────────────────────────────

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Attach access token
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new ApiError(
      data.error || 'Request failed',
      response.status,
      data.code || 'UNKNOWN_ERROR',
      data.details,
    );
    throw error;
  }

  return data as T;
}

// ─── Auto Refresh ───────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function attemptRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Refresh failed');
  }

  const data = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

// ─── Auth API ───────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'CLIENT';
  avatar?: string;
  emailVerified: boolean;
  createdAt?: string;
  memberships?: Array<{
    role: string;
    organization: { id: string; name: string };
  }>;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  verificationToken?: string;
  organization?: { id: string; name: string } | null;
}

export const authApi = {
  register: (data: { name: string; email: string; password: string; organizationName?: string }) =>
    api<AuthResponse>('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string }) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body: data }),

  logout: (refreshToken: string) => api('/auth/logout', { method: 'POST', body: { refreshToken } }),

  logoutAll: () => api('/auth/logout-all', { method: 'POST' }),

  refresh: (refreshToken: string) =>
    api<AuthResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } }),

  forgotPassword: (email: string) =>
    api<{ message: string; _devToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  resetPassword: (token: string, password: string) =>
    api<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),

  verifyEmail: (token: string) =>
    api<{ message: string }>('/auth/verify-email', { method: 'POST', body: { token } }),

  me: () => api<{ user: AuthUser }>('/auth/me'),
};

// ─── Error Class ────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
