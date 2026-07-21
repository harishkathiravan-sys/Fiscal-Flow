import { api } from './api';
export const bankApi = {
  list: (params: any = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
    });
    return api<any>(`/bank?${sp.toString()}`);
  },
  subscriptions: () => api<any>('/bank/subscriptions'),
  insights: () => api<any>('/bank/insights'),
  import: async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const { getAccessToken } = await import('./api');
    const res = await fetch(`${API_BASE}/bank/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: fd,
    });
    if (!res.ok) throw new Error('Import failed');
    return res.json();
  },
};
