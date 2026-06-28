import { apiClient } from '@/shared/api/apiClient';
import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { normalizePagedResult } from '@/shared/api/pagination';
import { apiGet, apiPost, apiPut, buildPath } from '@/shared/api/request';
import { formatMonitoringStatus } from './monitoringStatusMaps';
import type {
  ConvertMonitoringItemRequest,
  DecideMonitoringReportItemRequest,
  GenerateMonitoringReportRequest,
  MarkMonitoringReportDeliveredRequest,
  MonitoringDashboard,
  MonitoringReportDetail,
  MonitoringRunItem,
  MonitoringRunPagedResult,
  MonitoringRunSearchRequest,
  RunMonitoringRequest
} from '../types/monitoring';

export async function getMonitoringDashboard(): Promise<MonitoringDashboard> {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyMonitoringDashboard);
  const source = objectOrEmpty(data);
  return {
    todayAlerts: readNumber(source, ['todayAlerts', 'alertsToday', 'alertCount', 'openAlerts'], 0),
    pendingReviews: readNumber(source, ['pendingReviews', 'needsReview', 'reviewCount'], 0),
    convertedToPlacement: readNumber(source, ['convertedToPlacement', 'convertedToday', 'placementConversions'], 0),
    reportsGenerated: readNumber(source, ['reportsGenerated', 'reportsToday', 'reportCount'], 0),
    failedRuns: readNumber(source, ['failedRuns', 'failedCount', 'exceptions'], 0),
    averageProcessingMinutes: readNumber(source, ['averageProcessingMinutes', 'avgProcessingMinutes', 'averageDurationMinutes'], 0)
  };
}

export async function runBankruptcyMonitoring(request: RunMonitoringRequest): Promise<unknown> {
  return apiPost<unknown, RunMonitoringRequest>(ApiPath.apiV1BankruptcyMonitoringRun, request);
}


export async function generateMonitoringReport(request: GenerateMonitoringReportRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1BankruptcyMonitoringRunsRunIdReports, { runId: request.runId });
  return apiPost<unknown, Omit<GenerateMonitoringReportRequest, 'runId'>>(path, {
    clientId: request.clientId,
    portfolioId: request.portfolioId,
    createdBy: request.createdBy,
    monitorRunId: request.runId
  } as Omit<GenerateMonitoringReportRequest, 'runId'> & { monitorRunId: number });
}

export async function decideMonitoringReportItem(request: DecideMonitoringReportItemRequest): Promise<unknown> {
  const path = buildPath(
    request.decision === 'approve'
      ? ApiPath.apiV1BankruptcyMonitoringReportItemsReportItemIdApprove
      : ApiPath.apiV1BankruptcyMonitoringReportItemsReportItemIdReject,
    { reportItemId: request.reportItemId }
  );
  return apiPut<unknown, undefined>(path);
}

export async function markMonitoringReportDelivered(request: MarkMonitoringReportDeliveredRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1BankruptcyMonitoringReportsReportIdDelivered, { reportId: request.reportId });
  return apiPut<unknown, Omit<MarkMonitoringReportDeliveredRequest, 'reportId'>>(path, { deliveredBy: request.deliveredBy });
}

export async function getMonitoringRuns(request: MonitoringRunSearchRequest): Promise<MonitoringRunPagedResult> {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyMonitoringRuns, request);
  return normalizePagedResult(data, request, normalizeMonitoringRun);
}

export async function getMonitoringRunDetail(runId: number): Promise<Record<string, unknown>> {
  const path = buildPath(ApiPath.apiV1BankruptcyMonitoringRunsRunId, { runId });
  return apiGet<Record<string, unknown>>(path);
}

export async function getMonitoringReport(reportId: number): Promise<MonitoringReportDetail> {
  const path = buildPath(ApiPath.apiV1BankruptcyMonitoringReportsReportId, { reportId });
  const data = await apiGet<unknown>(path);
  return normalizeMonitoringReport(objectOrEmpty(data), reportId);
}

export async function exportMonitoringReport(reportId: number): Promise<Blob> {
  const path = buildPath(ApiPath.apiV1BankruptcyMonitoringReportsReportIdExport, { reportId });
  const response = await apiClient.get(path, { responseType: 'blob' });
  return response.data;
}

export async function convertMonitoringItemToPlacement(request: ConvertMonitoringItemRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1BankruptcyMonitoringReportItemsReportItemIdConvertToPlacement, { reportItemId: request.reportItemId });
  return apiPost<unknown, Omit<ConvertMonitoringItemRequest, 'reportItemId'>>(path, {
    claimAmount: request.claimAmount,
    accountOpenDate: request.accountOpenDate,
    convertedBy: request.convertedBy
  });
}

function normalizeMonitoringRun(value: Record<string, unknown>): MonitoringRunItem {
  const runId = readNumber(value, ['runId', 'monitorRunId', 'id']);
  const status = readStatus(value, ['status', 'runStatus']);
  return {
    id: runId,
    runId,
    clientId: readNumberOrNull(value, ['clientId']),
    portfolioId: readNumberOrNull(value, ['portfolioId']),
    runType: readString(value, ['runType', 'type']),
    status,
    statusLabel: formatMonitoringStatus(status),
    totalAccounts: readNumberOrNull(value, ['totalAccounts', 'accountCount', 'totalItems']),
    alertCount: readNumberOrNull(value, ['alertCount', 'alerts', 'matchedItems']),
    convertedCount: readNumberOrNull(value, ['convertedCount', 'convertedItems']),
    startedOnUtc: readString(value, ['startedOnUtc', 'startedUtc', 'createdOnUtc']),
    completedOnUtc: readString(value, ['completedOnUtc', 'completedUtc']),
    triggeredBy: readString(value, ['triggeredBy', 'createdBy'])
  };
}

function normalizeMonitoringReport(value: Record<string, unknown>, fallbackReportId: number): MonitoringReportDetail {
  const reportId = readNumber(value, ['reportId', 'id'], fallbackReportId);
  const status = readStatus(value, ['status', 'reportStatus']);
  return {
    reportId,
    monitorRunId: readNumberOrNull(value, ['monitorRunId', 'runId']),
    clientId: readNumberOrNull(value, ['clientId']),
    portfolioId: readNumberOrNull(value, ['portfolioId']),
    status,
    statusLabel: formatMonitoringStatus(status),
    createdBy: readString(value, ['createdBy', 'generatedBy']),
    createdOnUtc: readString(value, ['createdOnUtc', 'createdUtc', 'generatedOnUtc']),
    deliveredOnUtc: readString(value, ['deliveredOnUtc', 'deliveredUtc']),
    totalItems: readNumberOrNull(value, ['totalItems', 'itemCount']),
    approvedItems: readNumberOrNull(value, ['approvedItems', 'approvedCount']),
    rejectedItems: readNumberOrNull(value, ['rejectedItems', 'rejectedCount']),
    convertedItems: readNumberOrNull(value, ['convertedItems', 'convertedCount']),
    raw: value
  };
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
