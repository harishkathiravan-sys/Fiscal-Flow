import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, type InvoiceQueryParams } from '../services/invoices';

export const invKeys = {
  all: ['invoices'] as const,
  lists: () => [...invKeys.all, 'list'] as const,
  list: (params: InvoiceQueryParams) => [...invKeys.lists(), params] as const,
  details: () => [...invKeys.all, 'detail'] as const,
  detail: (id: string) => [...invKeys.details(), id] as const,
  stats: () => [...invKeys.all, 'stats'] as const,
  recurring: () => [...invKeys.all, 'recurring'] as const,
};

export function useInvoices(params: InvoiceQueryParams = {}) {
  return useQuery({
    queryKey: invKeys.list(params),
    queryFn: () => invoicesApi.list(params),
    staleTime: 30_000,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invKeys.detail(id),
    queryFn: () => invoicesApi.get(id),
    enabled: !!id,
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: invKeys.stats(),
    queryFn: () => invoicesApi.stats(),
    staleTime: 60_000,
  });
}

export function useRecurringInvoices() {
  return useQuery({
    queryKey: invKeys.recurring(),
    queryFn: () => invoicesApi.recurring(),
    staleTime: 60_000,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: invKeys.all }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => invoicesApi.update(id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: invKeys.all });
      qc.invalidateQueries({ queryKey: invKeys.detail(id) });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: invKeys.all }),
  });
}

export function useDuplicateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.duplicate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: invKeys.all }),
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => invoicesApi.recordPayment(id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: invKeys.all });
      qc.invalidateQueries({ queryKey: invKeys.detail(id) });
    },
  });
}
