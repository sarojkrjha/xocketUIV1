import { apiClient } from '@/shared/api/apiClient';
import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { normalizePagedResult } from '@/shared/api/pagination';
import { apiGet, apiPost, apiPut, buildPath } from '@/shared/api/request';
import { formatScrubStatus } from './scrubStatusMaps';
import type {
  CreateScrubInventoryRequest,
  CreateReportedBankruptcyRequest,
  CreateScrubScheduleRequest,
  GenerateScrubResponseRequest,
  ImportScrubInventoryRequest,
  ReportedBankruptcyItem,
  ReportedBankruptcyPagedResult,
  ReportedBankruptcySearchRequest,
  ResolveReportedBankruptcyRequest,
  RunScrubInventoryRequest,
  ScrubDashboard,
  ScrubInventoryItem,
  ScrubInventoryPagedResult,
  ScrubInventorySearchRequest,
  ScrubRunItem,
  ScrubRunPagedResult,
  ScrubRunSearchRequest,
  ScrubScheduleItem,
  ScrubSchedulePagedResult,
  ScrubScheduleSearchRequest
} from '../types/scrubbing';

export async function getScrubDashboard(): Promise<ScrubDashboard> {
  const data = await apiGet<unknown>(ApiPath.apiV1ReportsDashboardScrub);
  const source = objectOrEmpty(data);
  return {
    inventoryCount: readNumber(source, ['inventoryCount', 'totalInventories', 'inventories'], 0),
    runningRuns: readNumber(source, ['runningRuns', 'processingRuns', 'activeRuns'], 0),
    completedRuns: readNumber(source, ['completedRuns', 'runsCompletedToday', 'completedToday'], 0),
    reportedOpen: readNumber(source, ['reportedOpen', 'openReportedBankruptcies', 'reportedBankruptciesOpen'], 0),
    responseReady: readNumber(source, ['responseReady', 'readyResponses', 'responseBatchesReady'], 0)
  };
}

export async function getScrubInventories(request: ScrubInventorySearchRequest): Promise<ScrubInventoryPagedResult> {
  const data = await apiGet<unknown>(ApiPath.apiV1ScrubInventories, request);
  return normalizePagedResult(data, request, normalizeScrubInventory);
}

export async function createScrubInventory(request: CreateScrubInventoryRequest): Promise<unknown> {
  return apiPost<unknown, CreateScrubInventoryRequest>(ApiPath.apiV1ScrubInventories, request);
}

export async function importScrubInventory(request: ImportScrubInventoryRequest): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', request.file);
  const path = buildPath(ApiPath.apiV1ScrubInventoriesInventoryIdImport, { inventoryId: request.inventoryId });
  const response = await apiClient.post(path, formData, {
    params: { uploadedBy: request.uploadedBy },
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function runScrubInventory(request: RunScrubInventoryRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ScrubInventoriesInventoryIdRun, { inventoryId: request.inventoryId });
  return apiPost<unknown>(path, undefined, { triggeredBy: request.triggeredBy });
}


export async function getScrubInventoryDetail(inventoryId: number): Promise<Record<string, unknown>> {
  const path = buildPath(ApiPath.apiV1ScrubInventoriesInventoryId, { inventoryId });
  return apiGet<Record<string, unknown>>(path);
}

export async function getScrubInventoryVersions(inventoryId: number): Promise<Record<string, unknown>[]> {
  const path = buildPath(ApiPath.apiV1ScrubInventoriesInventoryIdVersions, { inventoryId });
  const data = await apiGet<unknown>(path);
  return normalizeArray(data);
}

export async function getScrubRunDetail(runId: number): Promise<Record<string, unknown>> {
  const path = buildPath(ApiPath.apiV1ScrubRunsRunId, { runId });
  return apiGet<Record<string, unknown>>(path);
}

export async function getScrubResultBatch(batchId: number): Promise<Record<string, unknown>> {
  const path = buildPath(ApiPath.apiV1ScrubResultBatchesBatchId, { batchId });
  return apiGet<Record<string, unknown>>(path);
}

export async function createReportedBankruptcy(request: CreateReportedBankruptcyRequest): Promise<unknown> {
  return apiPost<unknown, CreateReportedBankruptcyRequest>(ApiPath.apiV1ScrubReportedBankruptcies, request);
}

export async function getReportedBankruptcyDetail(reportedBankruptcyId: number): Promise<Record<string, unknown>> {
  const path = buildPath(ApiPath.apiV1ScrubReportedBankruptciesReportedBankruptcyId, { reportedBankruptcyId });
  return apiGet<Record<string, unknown>>(path);
}

export async function createScrubSchedule(request: CreateScrubScheduleRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ScrubInventoriesInventoryIdSchedule, { inventoryId: request.inventoryId });
  return apiPost<unknown, Omit<CreateScrubScheduleRequest, 'inventoryId'>>(path, {
    inventoryId: request.inventoryId,
    frequency: request.frequency,
    nextRunUtc: request.nextRunUtc
  } as Omit<CreateScrubScheduleRequest, 'inventoryId'> & { inventoryId: number });
}

export async function getScrubSchedules(request: ScrubScheduleSearchRequest): Promise<ScrubSchedulePagedResult> {
  const data = await apiGet<unknown>(ApiPath.apiV1ScrubSchedules, request);
  return normalizePagedResult(data, request, normalizeScrubSchedule);
}

export async function deactivateScrubSchedule(scheduleId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ScrubSchedulesScheduleIdDeactivate, { scheduleId });
  return apiPut<unknown, undefined>(path);
}

export async function getScrubRuns(request: ScrubRunSearchRequest): Promise<ScrubRunPagedResult> {
  const data = await apiGet<unknown>(ApiPath.apiV1ScrubRuns, request);
  return normalizePagedResult(data, request, normalizeScrubRun);
}

export async function getReportedBankruptcies(request: ReportedBankruptcySearchRequest): Promise<ReportedBankruptcyPagedResult> {
  const data = await apiGet<unknown>(ApiPath.apiV1ScrubReportedBankruptcies, request);
  return normalizePagedResult(data, request, normalizeReportedBankruptcy);
}

export async function generateScrubResponse(request: GenerateScrubResponseRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ScrubResultBatchesBatchIdResponse, { batchId: request.batchId });
  return apiPost<unknown>(path, undefined, { generatedBy: request.generatedBy });
}

export async function exportScrubResultBatch(batchId: number, format = 'csv'): Promise<Blob> {
  const path = buildPath(ApiPath.apiV1ScrubResultBatchesBatchIdExport, { batchId });
  const response = await apiClient.get(path, { params: { format }, responseType: 'blob' });
  return response.data;
}

export async function resolveReportedBankruptcy(request: ResolveReportedBankruptcyRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ScrubReportedBankruptciesReportedBankruptcyIdResolve, {
    reportedBankruptcyId: request.reportedBankruptcyId
  });
  return apiPut<unknown, Omit<ResolveReportedBankruptcyRequest, 'reportedBankruptcyId'>>(path, {
    resolvedBy: request.resolvedBy,
    notes: request.notes
  });
}

function normalizeScrubInventory(value: Record<string, unknown>): ScrubInventoryItem {
  const inventoryId = readNumber(value, ['inventoryId', 'id']);
  const status = readStatus(value, ['status', 'inventoryStatus']);
  return {
    id: inventoryId,
    inventoryId,
    inventoryName: readString(value, ['inventoryName', 'name', 'title']) ?? `Inventory ${inventoryId}`,
    clientId: readNumberOrNull(value, ['clientId']),
    clientName: readString(value, ['clientName']),
    sourceSystem: readString(value, ['sourceSystem']),
    status,
    statusLabel: formatScrubStatus(status),
    currentVersionNumber: readNumberOrNull(value, ['currentVersionNumber', 'versionNumber']),
    totalItems: readNumberOrNull(value, ['totalItems', 'itemCount', 'recordCount']),
    activeItems: readNumberOrNull(value, ['activeItems']),
    lastRunStatus: readStatus(value, ['lastRunStatus']),
    lastRunUtc: readString(value, ['lastRunUtc', 'lastRunOnUtc']),
    createdOnUtc: readString(value, ['createdOnUtc', 'createdUtc']),
    isActive: readBooleanOrNull(value, ['isActive'])
  };
}

function normalizeScrubRun(value: Record<string, unknown>): ScrubRunItem {
  const runId = readNumber(value, ['runId', 'scrubRunId', 'id']);
  const status = readStatus(value, ['status', 'runStatus']);
  return {
    id: runId,
    runId,
    inventoryId: readNumberOrNull(value, ['inventoryId']),
    inventoryName: readString(value, ['inventoryName']),
    versionNumber: readNumberOrNull(value, ['versionNumber', 'inventoryVersionNumber']),
    status,
    statusLabel: formatScrubStatus(status),
    totalItems: readNumberOrNull(value, ['totalItems', 'itemCount']),
    matchedItems: readNumberOrNull(value, ['matchedItems', 'matchCount']),
    reportedItems: readNumberOrNull(value, ['reportedItems', 'reportedBankruptcyCount']),
    startedOnUtc: readString(value, ['startedOnUtc', 'startedUtc']),
    completedOnUtc: readString(value, ['completedOnUtc', 'completedUtc']),
    triggeredBy: readString(value, ['triggeredBy', 'createdBy']),
    resultBatchId: readNumberOrNull(value, ['resultBatchId', 'batchId'])
  };
}

function normalizeReportedBankruptcy(value: Record<string, unknown>): ReportedBankruptcyItem {
  const reportedBankruptcyId = readNumber(value, ['reportedBankruptcyId', 'id']);
  const status = readStatus(value, ['status', 'reportedStatus']);
  return {
    id: reportedBankruptcyId,
    reportedBankruptcyId,
    inventoryItemId: readNumberOrNull(value, ['inventoryItemId', 'scrubInventoryItemId']),
    bankruptcyCaseId: readNumberOrNull(value, ['bankruptcyCaseId']),
    accountNumber: readString(value, ['accountNumber']),
    debtorName: readString(value, ['debtorName', 'consumerName', 'name']),
    bankruptcyCaseNumber: readString(value, ['bankruptcyCaseNumber', 'caseNumber']),
    courtName: readString(value, ['courtName']),
    status,
    statusLabel: formatScrubStatus(status),
    isOpen: readBooleanOrNull(value, ['isOpen']),
    firstReportedUtc: readString(value, ['firstReportedUtc', 'createdOnUtc']),
    lastReportedUtc: readString(value, ['lastReportedUtc', 'updatedOnUtc']),
    reportCount: readNumberOrNull(value, ['reportCount'])
  };
}

function normalizeScrubSchedule(value: Record<string, unknown>): ScrubScheduleItem {
  const scheduleId = readNumber(value, ['scheduleId', 'scrubScheduleId', 'id']);
  return {
    id: scheduleId,
    scheduleId,
    inventoryId: readNumberOrNull(value, ['inventoryId']),
    inventoryName: readString(value, ['inventoryName']),
    frequency: readString(value, ['frequency']),
    nextRunUtc: readString(value, ['nextRunUtc']),
    isActive: readBooleanOrNull(value, ['isActive']),
    createdOnUtc: readString(value, ['createdOnUtc', 'createdUtc'])
  };
}

function normalizeArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.map(objectOrEmpty);
  const source = objectOrEmpty(value);
  const items = source.items ?? source.data ?? source.results ?? source.versions;
  return Array.isArray(items) ? items.map(objectOrEmpty) : [];
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function readNumber(source: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function readNumberOrNull(source: Record<string, unknown>, keys: string[]): number | null {
  const value = readNumber(source, keys, Number.NaN);
  return Number.isFinite(value) ? value : null;
}

function readString(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function readStatus(source: Record<string, unknown>, keys: string[]): string | number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  return null;
}

function readBooleanOrNull(source: Record<string, unknown>, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'boolean') return value;
  }
  return null;
}
