import type { PagedResult } from '@/shared/api/pagination';

export type ScrubInventorySearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  clientId?: number;
  isActive?: boolean;
};

export type ScrubRunSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  inventoryId?: number;
  status?: number;
};

export type ReportedBankruptcySearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  inventoryItemId?: number;
  bankruptcyCaseId?: number;
  status?: number;
  isOpen?: boolean;
};

export type CreateScrubInventoryRequest = {
  clientId: number;
  inventoryName: string;
  sourceSystem?: string;
};

export type ImportScrubInventoryRequest = {
  inventoryId: number;
  uploadedBy: string;
  file: File;
};

export type RunScrubInventoryRequest = {
  inventoryId: number;
  triggeredBy: string;
};

export type GenerateScrubResponseRequest = {
  batchId: number;
  generatedBy: string;
};

export type ResolveReportedBankruptcyRequest = {
  reportedBankruptcyId: number;
  resolvedBy: string;
  notes?: string;
};

export type ScrubInventoryItem = {
  id: number;
  inventoryId: number;
  inventoryName: string;
  clientId?: number | null;
  clientName?: string | null;
  sourceSystem?: string | null;
  status?: string | number | null;
  statusLabel: string;
  currentVersionNumber?: number | null;
  totalItems?: number | null;
  activeItems?: number | null;
  lastRunStatus?: string | number | null;
  lastRunUtc?: string | null;
  createdOnUtc?: string | null;
  isActive?: boolean | null;
};

export type ScrubRunItem = {
  id: number;
  runId: number;
  inventoryId?: number | null;
  inventoryName?: string | null;
  versionNumber?: number | null;
  status?: string | number | null;
  statusLabel: string;
  totalItems?: number | null;
  matchedItems?: number | null;
  reportedItems?: number | null;
  startedOnUtc?: string | null;
  completedOnUtc?: string | null;
  triggeredBy?: string | null;
  resultBatchId?: number | null;
};

export type ReportedBankruptcyItem = {
  id: number;
  reportedBankruptcyId: number;
  inventoryItemId?: number | null;
  bankruptcyCaseId?: number | null;
  accountNumber?: string | null;
  debtorName?: string | null;
  bankruptcyCaseNumber?: string | null;
  courtName?: string | null;
  status?: string | number | null;
  statusLabel: string;
  isOpen?: boolean | null;
  firstReportedUtc?: string | null;
  lastReportedUtc?: string | null;
  reportCount?: number | null;
};

export type ScrubDashboard = {
  inventoryCount: number;
  runningRuns: number;
  completedRuns: number;
  reportedOpen: number;
  responseReady: number;
};

export type ScrubInventoryPagedResult = PagedResult<ScrubInventoryItem>;
export type ScrubRunPagedResult = PagedResult<ScrubRunItem>;
export type ReportedBankruptcyPagedResult = PagedResult<ReportedBankruptcyItem>;

export type CreateReportedBankruptcyRequest = {
  scrubMatchId: number;
  createdBy?: string;
};

export type CreateScrubScheduleRequest = {
  inventoryId: number;
  frequency?: string;
  nextRunUtc: string;
};

export type ScrubScheduleSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  inventoryId?: number;
  isActive?: boolean;
};

export type ScrubScheduleItem = {
  id: number;
  scheduleId: number;
  inventoryId: number | null;
  inventoryName: string | null;
  frequency: string | null;
  nextRunUtc: string | null;
  isActive: boolean | null;
  createdOnUtc: string | null;
};

export type ScrubSchedulePagedResult = PagedResult<ScrubScheduleItem>;
