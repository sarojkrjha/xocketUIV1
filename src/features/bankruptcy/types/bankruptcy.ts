import type { PagedResult } from '@/shared/api/pagination';

export type { PagedResult };

export type BankruptcyCaseSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  chapter?: string;
  filingDateFrom?: string;
  filingDateTo?: string;
};

export type BankruptcyCaseRow = {
  id: number;
  caseNumber?: string | null;
  bankruptcyCaseNumber?: string | null;
  chapter?: string | null;
  status?: string | null;
  filingDate?: string | null;
  closedDate?: string | null;
  dismissedDate?: string | null;
  courtId?: number | null;
  trusteeId?: number | null;
  attorneyId?: number | null;
  courtName?: string | null;
  trusteeName?: string | null;
  attorneyName?: string | null;
  debtorName?: string | null;
  sourceSystem?: string | null;
  raw: Record<string, unknown>;
};

export type ReferenceLookupRequest = {
  page: number;
  pageSize: number;
  search?: string;
  stateCode?: string;
  id?: number | null;
  courtId?: number | null;
  trusteeId?: number | null;
  attorneyId?: number | null;
};

export type ReferenceLookupRow = {
  id: number;
  name?: string | null;
  code?: string | null;
  stateCode?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  raw: Record<string, unknown>;
};
