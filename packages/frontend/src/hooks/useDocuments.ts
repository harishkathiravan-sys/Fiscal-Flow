import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi, type DocumentQueryParams } from '../services/documents';
import { ocrApi, type OcrExtraction } from '../services/ocr';

// ─── Query Keys ─────────────────────────────

export const docKeys = {
  all: ['documents'] as const,
  lists: () => [...docKeys.all, 'list'] as const,
  list: (params: DocumentQueryParams) => [...docKeys.lists(), params] as const,
  details: () => [...docKeys.all, 'detail'] as const,
  detail: (id: string) => [...docKeys.details(), id] as const,
  folders: () => [...docKeys.all, 'folders'] as const,
};

// ─── List Documents ─────────────────────────

export function useDocuments(params: DocumentQueryParams = {}) {
  return useQuery({
    queryKey: docKeys.list(params),
    queryFn: () => documentsApi.list(params),
    staleTime: 30_000,
  });
}

// ─── Get Document ───────────────────────────

export function useDocument(id: string) {
  return useQuery({
    queryKey: docKeys.detail(id),
    queryFn: () => documentsApi.get(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

// ─── Get Folders ────────────────────────────

export function useFolders() {
  return useQuery({
    queryKey: docKeys.folders(),
    queryFn: () => documentsApi.folders(),
    staleTime: 60_000,
  });
}

// ─── Upload Document ────────────────────────

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: any }) =>
      documentsApi.upload(file, metadata),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all });
    },
  });
}

// ─── Update Document ────────────────────────

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => documentsApi.update(id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: docKeys.all });
      qc.invalidateQueries({ queryKey: docKeys.detail(id) });
    },
  });
}

// ─── Delete Document ────────────────────────

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.all });
    },
  });
}

// ─── Upload New Version ─────────────────────

export function useUploadVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file, comment }: { id: string; file: File; comment?: string }) =>
      documentsApi.uploadVersion(id, file, comment),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: docKeys.detail(id) });
    },
  });
}

// ─── Create Folder ──────────────────────────

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; parentId?: string }) => documentsApi.createFolder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.folders() });
    },
  });
}

// ─── Delete Folder ──────────────────────────

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteFolder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: docKeys.folders() });
      qc.invalidateQueries({ queryKey: docKeys.all });
    },
  });
}

// ─── OCR Hooks ──────────────────────────────

export function useOcrExtraction(documentId: string) {
  return useQuery({
    queryKey: [...docKeys.detail(documentId), 'ocr'],
    queryFn: () => ocrApi.get(documentId),
    staleTime: 10_000,
    enabled: !!documentId,
    refetchInterval: (query) => {
      // Poll while processing
      const status = query.state.data?.extraction?.status;
      return status === 'PROCESSING' || status === 'PENDING' ? 2000 : false;
    },
  });
}

export function useUpdateOcrExtraction(documentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OcrExtraction>) => ocrApi.update(documentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...docKeys.detail(documentId), 'ocr'] });
    },
  });
}

export function useProcessOcr() {
  return useMutation({
    mutationFn: (documentId: string) => ocrApi.process(documentId),
  });
}
