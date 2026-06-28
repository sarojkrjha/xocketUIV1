import type { PagedResult } from '@/shared/api/pagination';

export type { PagedResult };

export type ContactSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  contactType?: number;
  last4?: string;
  phone?: string;
  email?: string;
  stateCode?: string;
};

export type ContactRow = {
  id: number;
  contactId?: number | null;
  fullName?: string | null;
  companyName?: string | null;
  contactType?: string | number | null;
  last4?: string | null;
  phone?: string | null;
  email?: string | null;
  address1?: string | null;
  city?: string | null;
  stateCode?: string | null;
  postalCode?: string | null;
  isActive?: boolean | null;
  raw: Record<string, unknown>;
};
