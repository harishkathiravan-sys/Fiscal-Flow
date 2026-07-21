import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, type ClientQueryParams, type CreateClientPayload } from '../services/clients';

// ─── Query Keys ─────────────────────────────

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: ClientQueryParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  tags: () => [...clientKeys.all, 'tags'] as const,
};

// ─── List Clients ───────────────────────────

export function useClients(params: ClientQueryParams = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsApi.list(params),
    staleTime: 30_000,
  });
}

// ─── Get Client ─────────────────────────────

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.get(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

// ─── Get Tags ───────────────────────────────

export function useClientTags() {
  return useQuery({
    queryKey: clientKeys.tags(),
    queryFn: () => clientsApi.tags(),
    staleTime: 60_000,
  });
}

// ─── Create Client ──────────────────────────

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientPayload) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

// ─── Update Client ──────────────────────────

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientPayload> }) =>
      clientsApi.update(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
    },
  });
}

// ─── Delete Client ──────────────────────────

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
