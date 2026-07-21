import { api, getAccessToken } from './api';

// ─── Types ──────────────────────────────────

export type DocumentType =
  'INVOICE' | 'RECEIPT' | 'BILL' | 'PURCHASE_ORDER' | 'BANK_STATEMENT' | 'GST_DOCUMENT' | 'OTHER';

export interface DocumentItem {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  type: DocumentType;
  description?: string;
  tags: string[];
  ocrStatus: string;
  isArchived: boolean;
  folderId?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; avatar?: string };
  folder?: { id: string; name: string };
  _count?: { versions: number };
}

export interface DocumentVersion {
  id: string;
  version: number;
  fileName: string;
  fileSize: number;
  s3Key: string;
  comment?: string;
  url: string;
  createdAt: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  _count: { documents: number; children: number };
}

export interface DocumentListResponse {
  documents: DocumentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DocumentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: DocumentType;
  folderId?: string | null;
  isArchived?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Document Type Labels ───────────────────

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  INVOICE: 'Invoice',
  RECEIPT: 'Receipt',
  BILL: 'Bill',
  PURCHASE_ORDER: 'Purchase Order',
  BANK_STATEMENT: 'Bank Statement',
  GST_DOCUMENT: 'GST Document',
  OTHER: 'Other',
};

export const DOCUMENT_TYPE_ICONS: Record<DocumentType, string> = {
  INVOICE: '🧾',
  RECEIPT: '🧾',
  BILL: '📄',
  PURCHASE_ORDER: '📋',
  BANK_STATEMENT: '🏦',
  GST_DOCUMENT: '🏛️',
  OTHER: '📎',
};

// ─── API Functions ──────────────────────────

export const documentsApi = {
  list: (params: DocumentQueryParams = {}) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
    });
    const qs = sp.toString();
    return api<DocumentListResponse>(`/documents${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) =>
    api<{ document: DocumentItem & { versions: DocumentVersion[] } }>(`/documents/${id}`),

  upload: async (
    file: File,
    metadata: {
      name: string;
      type: DocumentType;
      description?: string;
      tags?: string[];
      folderId?: string;
    },
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name);
    formData.append('type', metadata.type);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags));
    if (metadata.folderId) formData.append('folderId', metadata.folderId);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const token = getAccessToken();
    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Upload failed');
    }

    return response.json();
  },

  update: (
    id: string,
    data: {
      name?: string;
      type?: DocumentType;
      description?: string;
      tags?: string[];
      folderId?: string | null;
      isArchived?: boolean;
    },
  ) =>
    api<{ message: string; document: DocumentItem }>(`/documents/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) => api<{ message: string }>(`/documents/${id}`, { method: 'DELETE' }),

  uploadVersion: async (id: string, file: File, comment?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (comment) formData.append('comment', comment);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const token = getAccessToken();
    const response = await fetch(`${API_BASE}/documents/${id}/version`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Upload failed');
    }

    return response.json();
  },

  folders: () => api<{ folders: DocumentFolder[] }>('/documents/folders'),

  createFolder: (data: { name: string; parentId?: string }) =>
    api<{ message: string; folder: DocumentFolder }>('/documents/folders', {
      method: 'POST',
      body: data,
    }),

  deleteFolder: (id: string) =>
    api<{ message: string }>(`/documents/folders/${id}`, { method: 'DELETE' }),
};
