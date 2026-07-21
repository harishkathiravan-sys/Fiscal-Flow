import { api } from './api';
export const gstApi = {
  calculate: (amount: number, rate: number, type: 'intra' | 'inter') =>
    api<any>('/gst/calculate', { method: 'POST', body: { amount, rate, type } }),
  validateGstin: (gstin: string) =>
    api<{ valid: boolean; errors: string[] }>('/gst/validate-gstin', {
      method: 'POST',
      body: { gstin },
    }),
  validatePan: (pan: string) =>
    api<{ valid: boolean; errors: string[] }>('/gst/validate-pan', {
      method: 'POST',
      body: { pan },
    }),
  dueDates: (year: number, month: number) => api<any>(`/gst/due-dates?year=${year}&month=${month}`),
  penalty: (data: any) => api<any>('/gst/penalty', { method: 'POST', body: data }),
  itcSuggestions: (expenses: any[]) =>
    api<any>('/gst/itc-suggestions', { method: 'POST', body: { expenses } }),
  summary: (data: any) => api<any>('/gst/summary', { method: 'POST', body: data }),
};
