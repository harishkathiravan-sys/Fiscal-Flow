import { api } from './api';

// ─── Types ──────────────────────────────────

export interface ClientContact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
}

export interface ClientTag {
  id: string;
  name: string;
  color: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  companyName?: string;
  industry?: string;
  website?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags: ClientTag[];
  contacts: ClientContact[];
  _count?: { contacts: number; tags: number };
}

export interface ClientListResponse {
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ClientTagCount {
  name: string;
  color: string;
  count: number;
}

export interface CreateClientPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  companyName?: string;
  industry?: string;
  website?: string;
  notes?: string;
  tags?: string[];
  contacts?: Omit<ClientContact, 'id'>[];
}

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── API Functions ──────────────────────────

export const clientsApi = {
  list: (params: ClientQueryParams = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    return api<ClientListResponse>(`/clients${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => api<{ client: Client }>(`/clients/${id}`),

  create: (data: CreateClientPayload) =>
    api<{ message: string; client: Client }>('/clients', { method: 'POST', body: data }),

  update: (id: string, data: Partial<CreateClientPayload>) =>
    api<{ message: string; client: Client }>(`/clients/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => api<{ message: string }>(`/clients/${id}`, { method: 'DELETE' }),

  tags: () => api<{ tags: ClientTagCount[] }>('/clients/tags'),
};
