import { api } from './api';
export const insightsApi = {
  list: () => api<any>('/insights'),
  generate: () => api<any>('/insights/generate', { method: 'POST' }),
  dismiss: (id: string) => api<any>(`/insights/${id}/dismiss`, { method: 'POST' }),
};
