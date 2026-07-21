import { api, getAccessToken } from './api';

export const expensesApi = {
  list: (params: any = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
    });
    const qs = sp.toString();
    return api<any>(`/expenses${qs ? `?${qs}` : ''}`);
  },
  create: (data: any) =>
    api<{ message: string; expense: any }>('/expenses', { method: 'POST', body: data }),
  update: (id: string, data: any) =>
    api<{ message: string; expense: any }>(`/expenses/${id}`, { method: 'PUT', body: data }),
  delete: (id: string) => api<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' }),
  stats: () => api<any>('/expenses/stats'),
  vendors: () => api<any>('/expenses/vendors'),
  monthly: (year: number, month: number) =>
    api<any>(`/expenses/monthly?year=${year}&month=${month}`),
  upload: async (file: File) => {
    const fd = new FormData();
    fd.append('receipt', file);
    const res = await fetch(`${API_BASE}/expenses/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: fd,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
