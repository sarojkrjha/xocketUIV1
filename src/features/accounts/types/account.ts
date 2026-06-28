import type { PagedResult } from '@/shared/api/pagination';

export type { PagedResult };

export type AccountSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  clientId?: number;
  portfolioId?: number;
  status?: number;
  accountNumber?: string;
  contactName?: string;
  last4?: string;
  phone?: string;
  email?: string;
  bankruptcyCaseNumber?: string;
  stateCode?: string;
  courtId?: number;
  courtName?: string;
};

export type AccountSearchRow = {
  id: number;
  accountNumber?: string | null;
  clientName?: string | null;
  portfolioName?: string | null;
  contactName?: string | null;
  last4?: string | null;
  phone?: string | null;
  email?: string | null;
  bankruptcyCaseNumber?: string | null;
  courtName?: string | null;
  stateCode?: string | null;
  status?: string | null;
  currentBalance?: number | null;
};

export type AccountContactSummary = {
  id?: number | null;
  contactId?: number | null;
  fullName?: string | null;
  contactName?: string | null;
  relationshipType?: string | number | null;
  contactType?: string | number | null;
  isPrimary?: boolean | null;
  last4?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type AccountDetail = {
  id: number;
  accountNumber?: string | null;
  primaryAccountNumber?: string | null;
  clientId?: number | null;
  clientName?: string | null;
  portfolioId?: number | null;
  portfolioName?: string | null;
  currentBalance?: number | null;
  placementDate?: string | null;
  status?: string | number | null;
  isActive?: boolean | null;
  contactName?: string | null;
  primaryContactName?: string | null;
  last4?: string | null;
  phone?: string | null;
  email?: string | null;
  bankruptcyCaseId?: number | null;
  activeBankruptcyCaseId?: number | null;
  bankruptcyCaseNumber?: string | null;
  bankruptcyStatus?: string | number | null;
  filingDate?: string | null;
  courtId?: number | null;
  courtName?: string | null;
  contacts?: AccountContactSummary[];
  raw: Record<string, unknown>;
};
