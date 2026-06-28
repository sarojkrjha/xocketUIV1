import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { apiGet, apiPost, apiPut, buildPath } from '@/shared/api/request';
import { normalizePagedResult } from '@/shared/api/pagination';
import type {
  CreateNdcScheduleRequest,
  ImportNdcPaymentsRequest,
  NdcDashboard,
  NdcImportRunDetail,
  NdcImportRunItem,
  NdcImportRunSearchRequest,
  NdcScheduleItem,
  NdcScheduleSearchRequest,
  PagedResult,
  PaymentQueueItem,
  PaymentSearchRequest,
  PostNdcPaymentToClaimRequest
} from '../types/payments';
import { formatPaymentMappingStatus } from './paymentStatusMaps';

export async function getNdcDashboard(): Promise<NdcDashboard> {
  const data = await apiGet<unknown>(ApiPath.apiV1NdcDashboard);
  const source = objectOrEmpty(data);
  return {
    totalPayments: numberOrNull(source.totalPayments ?? source.paymentCount ?? source.totalCount),
    matchedPayments: numberOrNull(source.matchedPayments ?? source.matchedCount),
    exceptionPayments: numberOrNull(source.exceptionPayments ?? source.exceptionCount),
    importedToday: numberOrNull(source.importedToday ?? source.todayCount),
    pendingSchedules: numberOrNull(source.pendingSchedules ?? source.activeSchedules),
    lastRunStatus: stringOrNull(source.lastRunStatus ?? source.status)
  };
}

export async function getNdcPayments(request: PaymentSearchRequest): Promise<PagedResult<PaymentQueueItem>> {
  const data = await apiGet<unknown>(ApiPath.apiV1NdcPayments, {
    page: request.page,
    pageSize: request.pageSize,
    search: request.search,
    importRunId: request.importRunId,
    trusteeId: request.trusteeId,
    caseNumber: request.caseNumber,
    claimNumber: request.claimNumber,
    mappingStatus: request.mappingStatus
  });

  return normalizePagedResult(data, request, normalizePaymentQueueItem);
}

export async function getNdcImportRuns(request: NdcImportRunSearchRequest): Promise<PagedResult<NdcImportRunItem>> {
  const data = await apiGet<unknown>(ApiPath.apiV1NdcImportRuns, {
    page: request.page,
    pageSize: request.pageSize,
    search: request.search,
    trusteeId: request.trusteeId,
    status: request.status
  });

  return normalizePagedResult(data, request, normalizeImportRunItem);
}


export async function getNdcImportRunDetail(runId: number): Promise<NdcImportRunDetail> {
  const path = buildPath(ApiPath.apiV1NdcImportRunsRunId, { runId });
  const data = await apiGet<unknown>(path);
  const source = objectOrEmpty(data);
  const base = normalizeImportRunItem(source);
  const payments = extractArray(source.payments ?? source.items ?? source.paymentItems ?? source.ndcPayments).map(normalizePaymentQueueItem);
  const errors = extractArray(source.errors ?? source.importErrors ?? source.validationErrors).map((entry, index) => ({
    id: Number(entry.id ?? entry.errorId ?? index + 1),
    lineNumber: numberOrNull(entry.lineNumber ?? entry.line ?? entry.rowNumber),
    accountNumber: stringOrNull(entry.accountNumber ?? entry.account),
    message: stringOrNull(entry.message ?? entry.errorMessage ?? entry.description),
    severity: stringOrNull(entry.severity ?? entry.errorType ?? entry.level)
  }));

  return {
    ...base,
    raw: source,
    payments,
    errors
  };
}

export async function postNdcPaymentToClaim(request: PostNdcPaymentToClaimRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdPaymentsPost, { claimId: request.claimId });
  return apiPost<unknown, Record<string, unknown>>(path, {
    claimId: request.claimId,
    amount: request.amount,
    paymentDate: request.paymentDate,
    referenceNumber: request.referenceNumber ?? null,
    postedBy: request.postedBy ?? null,
    sourceSystem: request.sourceSystem ?? 'NDC',
    sourcePaymentId: request.sourcePaymentId ?? (request.paymentId ? String(request.paymentId) : null),
    externalReference: request.externalReference ?? null,
    allowOverpayment: request.allowOverpayment
  });
}

export async function getNdcSchedules(request: NdcScheduleSearchRequest): Promise<PagedResult<NdcScheduleItem>> {
  const data = await apiGet<unknown>(ApiPath.apiV1NdcSchedules, {
    page: request.page,
    pageSize: request.pageSize,
    search: request.search,
    trusteeId: request.trusteeId,
    isActive: request.isActive
  });

  return normalizePagedResult(data, request, normalizeScheduleItem);
}

export async function importNdcPayments(request: ImportNdcPaymentsRequest): Promise<unknown> {
  return apiPost<unknown, ImportNdcPaymentsRequest>(ApiPath.apiV1NdcPaymentsImport, request);
}

export async function createNdcSchedule(request: CreateNdcScheduleRequest): Promise<unknown> {
  return apiPost<unknown, CreateNdcScheduleRequest>(ApiPath.apiV1NdcSchedules, request);
}

export async function deactivateNdcSchedule(scheduleId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1NdcSchedulesScheduleIdDeactivate, { scheduleId });
  return apiPut<unknown, never>(path);
}

const normalizePaymentQueueItem = (entry: Record<string, unknown>): PaymentQueueItem => {
  const statusCode = numberOrNull(entry.mappingStatus ?? entry.status);
  return {
    id: Number(entry.id ?? entry.paymentId ?? 0),
    paymentId: Number(entry.paymentId ?? entry.id ?? 0),
    importRunId: numberOrNull(entry.importRunId),
    trusteeId: stringOrNull(entry.trusteeId),
    trusteeName: stringOrNull(entry.trusteeName),
    caseNumber: stringOrNull(entry.caseNumber ?? entry.bankruptcyCaseNumber),
    claimNumber: stringOrNull(entry.claimNumber ?? entry.courtClaimNumber),
    debtorName: stringOrNull(entry.debtorName ?? entry.fullName),
    accountNumber: stringOrNull(entry.accountNumber),
    amount: numberOrNull(entry.amount ?? entry.paymentAmount),
    paymentDate: stringOrNull(entry.paymentDate ?? entry.paidOnUtc),
    referenceNumber: stringOrNull(entry.referenceNumber ?? entry.checkNumber ?? entry.externalReference),
    mappingStatus: formatPaymentMappingStatus(entry.mappingStatus ?? entry.status),
    mappingStatusCode: statusCode,
    sourceSystem: stringOrNull(entry.sourceSystem ?? 'NDC')
  };
};

const normalizeImportRunItem = (entry: Record<string, unknown>): NdcImportRunItem => {
  const statusCode = numberOrNull(entry.status ?? entry.runStatus);
  return {
    id: Number(entry.id ?? entry.runId ?? 0),
    runId: Number(entry.runId ?? entry.id ?? 0),
    trusteeId: stringOrNull(entry.trusteeId),
    checkNumber: stringOrNull(entry.checkNumber),
    paymentDate: stringOrNull(entry.paymentDate),
    status: formatPaymentMappingStatus(entry.status ?? entry.runStatus),
    statusCode,
    totalRecords: numberOrNull(entry.totalRecords ?? entry.totalCount),
    matchedRecords: numberOrNull(entry.matchedRecords ?? entry.matchedCount),
    exceptionRecords: numberOrNull(entry.exceptionRecords ?? entry.exceptionCount),
    startedUtc: stringOrNull(entry.startedUtc ?? entry.startedOnUtc),
    completedUtc: stringOrNull(entry.completedUtc ?? entry.completedOnUtc),
    triggeredBy: stringOrNull(entry.triggeredBy ?? entry.createdBy)
  };
};

const normalizeScheduleItem = (entry: Record<string, unknown>): NdcScheduleItem => ({
  id: Number(entry.id ?? entry.scheduleId ?? 0),
  scheduleId: Number(entry.scheduleId ?? entry.id ?? 0),
  trusteeId: stringOrNull(entry.trusteeId),
  checkNumber: stringOrNull(entry.checkNumber),
  paymentDate: stringOrNull(entry.paymentDate),
  frequency: stringOrNull(entry.frequency),
  isActive: booleanOrNull(entry.isActive),
  nextRunUtc: stringOrNull(entry.nextRunUtc ?? entry.nextRun)
});

function objectOrEmpty(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const result = String(value).trim();
  return result.length > 0 ? result : null;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanOrNull(value: unknown): boolean | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}


function extractArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item));
  return [];
}
