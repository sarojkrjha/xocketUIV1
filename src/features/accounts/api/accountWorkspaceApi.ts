import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { normalizePagedResult, type PagedResult } from '@/shared/api/pagination';
import { apiGet } from '@/shared/api/request';

const PAGE_SIZE = 10;

export type WorkspaceListRequest = {
  accountId: number;
  page?: number;
  pageSize?: number;
};

export type TimelineEventRow = {
  id: number;
  eventType?: string | null;
  title?: string | null;
  description?: string | null;
  eventUtc?: string | null;
  createdByUserId?: string | null;
};

export type ClaimSummaryRow = {
  id: number;
  claimId?: number | null;
  bankruptcyCaseId?: number | null;
  bankruptcyCaseNumber?: string | null;
  claimAmount?: number | null;
  status?: string | number | null;
  barDate?: string | null;
  filedOnUtc?: string | null;
};

export type DocumentSummaryRow = {
  id: number;
  documentId?: number | null;
  fileName?: string | null;
  documentType?: string | null;
  status?: string | number | null;
  version?: string | number | null;
  createdOnUtc?: string | null;
  generatedBy?: string | null;
  uploadedBy?: string | null;
};

export type TaskSummaryRow = {
  id: number;
  taskId?: number | null;
  title?: string | null;
  description?: string | null;
  status?: string | number | null;
  priority?: string | number | null;
  dueUtc?: string | null;
  assignedToUserId?: string | null;
};

function stringOrNull(value: unknown): string | null {
  return value === undefined || value === null || value === '' ? null : String(value);
}

function numberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTimeline(row: Record<string, unknown>): TimelineEventRow {
  return {
    id: Number(row.id ?? row.timelineEventId ?? 0),
    eventType: stringOrNull(row.eventType),
    title: stringOrNull(row.title ?? row.eventName),
    description: stringOrNull(row.description),
    eventUtc: stringOrNull(row.eventUtc ?? row.createdOnUtc ?? row.createdUtc),
    createdByUserId: stringOrNull(row.createdByUserId ?? row.createdBy)
  };
}

function normalizeClaim(row: Record<string, unknown>): ClaimSummaryRow {
  return {
    id: Number(row.id ?? row.claimId ?? 0),
    claimId: numberOrNull(row.claimId ?? row.id),
    bankruptcyCaseId: numberOrNull(row.bankruptcyCaseId),
    bankruptcyCaseNumber: stringOrNull(row.bankruptcyCaseNumber ?? row.caseNumber),
    claimAmount: numberOrNull(row.claimAmount ?? row.amount),
    status: stringOrNull(row.status) ?? numberOrNull(row.status),
    barDate: stringOrNull(row.barDate),
    filedOnUtc: stringOrNull(row.filedOnUtc ?? row.filedDate)
  };
}

function normalizeDocument(row: Record<string, unknown>): DocumentSummaryRow {
  return {
    id: Number(row.id ?? row.documentId ?? 0),
    documentId: numberOrNull(row.documentId ?? row.id),
    fileName: stringOrNull(row.fileName ?? row.name),
    documentType: stringOrNull(row.documentType ?? row.type),
    status: stringOrNull(row.status) ?? numberOrNull(row.status),
    version: stringOrNull(row.version) ?? numberOrNull(row.versionNumber),
    createdOnUtc: stringOrNull(row.createdOnUtc ?? row.generatedOnUtc ?? row.uploadedOnUtc),
    generatedBy: stringOrNull(row.generatedBy),
    uploadedBy: stringOrNull(row.uploadedBy)
  };
}

function normalizeTask(row: Record<string, unknown>): TaskSummaryRow {
  return {
    id: Number(row.id ?? row.taskId ?? 0),
    taskId: numberOrNull(row.taskId ?? row.id),
    title: stringOrNull(row.title),
    description: stringOrNull(row.description),
    status: stringOrNull(row.status) ?? numberOrNull(row.status),
    priority: stringOrNull(row.priority) ?? numberOrNull(row.priority),
    dueUtc: stringOrNull(row.dueUtc),
    assignedToUserId: stringOrNull(row.assignedToUserId)
  };
}

export async function getAccountTimeline(request: WorkspaceListRequest): Promise<PagedResult<TimelineEventRow>> {
  const query = {
    page: request.page ?? 1,
    pageSize: request.pageSize ?? PAGE_SIZE,
    referenceType: 'Account',
    referenceId: request.accountId
  };

  const data = await apiGet<unknown>(ApiPath.apiV1Timeline, query);
  return normalizePagedResult(data, query, normalizeTimeline);
}

export async function getAccountClaims(request: WorkspaceListRequest): Promise<PagedResult<ClaimSummaryRow>> {
  const query = {
    page: request.page ?? 1,
    pageSize: request.pageSize ?? PAGE_SIZE,
    accountId: request.accountId
  };

  const data = await apiGet<unknown>(ApiPath.apiV1Claims, query);
  return normalizePagedResult(data, query, normalizeClaim);
}

export async function getAccountDocuments(request: WorkspaceListRequest): Promise<PagedResult<DocumentSummaryRow>> {
  const query = {
    page: request.page ?? 1,
    pageSize: request.pageSize ?? PAGE_SIZE,
    referenceType: 'Account',
    referenceId: request.accountId
  };

  const data = await apiGet<unknown>(ApiPath.apiV1Documents, query);
  return normalizePagedResult(data, query, normalizeDocument);
}

export async function getAccountTasks(request: WorkspaceListRequest): Promise<PagedResult<TaskSummaryRow>> {
  const query = {
    page: request.page ?? 1,
    pageSize: request.pageSize ?? PAGE_SIZE,
    referenceType: 'Account',
    referenceId: request.accountId
  };

  const data = await apiGet<unknown>(ApiPath.apiV1Tasks, query);
  return normalizePagedResult(data, query, normalizeTask);
}
