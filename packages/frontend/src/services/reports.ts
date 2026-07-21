import { api } from './api';
export const reportsApi = {
  pnl: (start?: string, end?: string) =>
    api<any>(`/reports/pnl${start ? `?startDate=${start}&endDate=${end}` : ''}`),
  balanceSheet: () => api<any>('/reports/balance-sheet'),
  cashFlow: (start?: string, end?: string) =>
    api<any>(`/reports/cash-flow${start ? `?startDate=${start}&endDate=${end}` : ''}`),
  expenseAnalysis: (start?: string, end?: string) =>
    api<any>(`/reports/expense-analysis${start ? `?startDate=${start}&endDate=${end}` : ''}`),
  invoiceReport: (start?: string, end?: string) =>
    api<any>(`/reports/invoice-report${start ? `?startDate=${start}&endDate=${end}` : ''}`),
  revenue: (start?: string, end?: string) =>
    api<any>(`/reports/revenue${start ? `?startDate=${start}&endDate=${end}` : ''}`),
};
