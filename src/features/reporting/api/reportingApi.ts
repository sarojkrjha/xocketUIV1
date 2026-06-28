import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { apiGet, apiPost, buildPath } from '@/shared/api/request';
import { normalizePagedResult } from '@/shared/api/pagination';
import type { CreateMonitoringSnapshotRequest, DashboardKey, PagedResult, ReportSnapshotDetail, ReportSnapshotItem, ReportSnapshotSearchRequest, ReportingDashboard, ReportingDashboardMetric } from '../types/reporting';

const dashboardPaths: Record<DashboardKey, string> = {
  operations: ApiPath.apiV1ReportsDashboardOperations,
  placement: ApiPath.apiV1ReportsDashboardPlacement,
  claims: ApiPath.apiV1ReportsDashboardClaims,
  ndc: ApiPath.apiV1ReportsDashboardNdc,
  scrub: ApiPath.apiV1ReportsDashboardScrub,
  bankruptcyMonitoring: ApiPath.apiV1ReportsDashboardBankruptcyMonitoring
};

const dashboardTitles: Record<DashboardKey, string> = {
  operations: 'Operations Health',
  placement: 'Placement Performance',
  claims: 'Claims Performance',
  ndc: 'NDC Payments',
  scrub: 'Scrubbing Health',
  bankruptcyMonitoring: 'Bankruptcy Monitoring'
};

export async function getReportingDashboard(key: DashboardKey): Promise<ReportingDashboard> {
  const data = await apiGet<unknown>(dashboardPaths[key]);
  return normalizeDashboard(key, objectOrEmpty(data));
}

export async function getReportSnapshots(request: ReportSnapshotSearchRequest): Promise<PagedResult<ReportSnapshotItem>> {
  const data = await apiGet<unknown>(ApiPath.apiV1ReportsSnapshots, {
    page: request.page,
    pageSize: request.pageSize,
    search: request.search,
    reportCode: request.reportCode,
    sourceModule: request.sourceModule,
    status: request.status
  });

  return normalizePagedResult(data, request, normalizeSnapshotItem);
}

export async function getReportSnapshotDetail(snapshotId: number): Promise<ReportSnapshotDetail> {
  const path = buildPath(ApiPath.apiV1ReportsSnapshotsSnapshotId, { snapshotId });
  const data = objectOrEmpty(await apiGet<unknown>(path));
  return {
    ...normalizeSnapshotItem(data),
    description: stringOrNull(data.description ?? data.summary),
    parameters: objectOrNull(data.parameters ?? data.requestParameters),
    previewRows: arrayOfObjects(data.previewRows ?? data.rows ?? data.items)
  };
}


export async function createBankruptcyMonitoringSnapshot(request: CreateMonitoringSnapshotRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ReportsSnapshotsBankruptcyMonitoringReportId, { reportId: request.reportId });
  return apiPost<unknown, undefined>(path, undefined, { createdBy: request.createdBy });
}

export async function exportReportSnapshot(snapshotId: number): Promise<Blob> {
  const path = buildPath(ApiPath.apiV1ReportsSnapshotsSnapshotIdExport, { snapshotId });
  return apiGet<Blob>(path, undefined, { responseType: 'blob' });
}

function normalizeDashboard(key: DashboardKey, source: Record<string, unknown>): ReportingDashboard {
  const explicitMetrics = Array.isArray(source.metrics) ? source.metrics : null;
  const metrics = explicitMetrics
    ? explicitMetrics.map((entry, index) => normalizeMetric(objectOrEmpty(entry), index))
    : fallbackMetricsFor(key, source);

  return {
    module: key,
    title: stringOrNull(source.title) ?? dashboardTitles[key],
    metrics,
    lastRefreshedUtc: stringOrNull(source.lastRefreshedUtc ?? source.generatedUtc ?? source.updatedUtc)
  };
}

function normalizeMetric(source: Record<string, unknown>, index: number): ReportingDashboardMetric {
  return {
    code: stringOrNull(source.code) ?? `metric-${index}`,
    label: stringOrNull(source.label ?? source.name) ?? `Metric ${index + 1}`,
    value: numberOrStringOrNull(source.value ?? source.count ?? source.amount),
    helper: stringOrNull(source.helper ?? source.description) ?? 'Current period',
    trend: stringOrNull(source.trend),
    tone: metricTone(index)
  };
}

function fallbackMetricsFor(key: DashboardKey, source: Record<string, unknown>): ReportingDashboardMetric[] {
  const candidates: Array<[string, string, unknown, string]> = [
    ['total', 'Total', source.total ?? source.totalCount ?? source.count, 'Current population'],
    ['open', 'Open', source.open ?? source.openCount ?? source.pending, 'Needs attention'],
    ['completed', 'Completed', source.completed ?? source.completedCount ?? source.closed, 'Completed work'],
    ['exceptions', 'Exceptions', source.exceptions ?? source.exceptionCount ?? source.failed, 'Requires review'],
    ['today', 'Today', source.today ?? source.todayCount ?? source.processedToday, 'Today activity'],
    ['amount', 'Amount', source.amount ?? source.totalAmount ?? source.paymentAmount, 'Financial value']
  ];

  const metrics = candidates
    .filter(([, , value]) => value !== undefined && value !== null)
    .slice(0, 6)
    .map(([code, label, value, helper], index) => ({ code: `${key}-${code}`, label, value: numberOrStringOrNull(value), helper, tone: metricTone(index) }));

  if (metrics.length > 0) return metrics;

  return [
    { code: `${key}-health`, label: 'Health', value: 'Ready', helper: 'Dashboard endpoint available', tone: 'success' },
    { code: `${key}-snapshots`, label: 'Snapshots', value: 0, helper: 'Load snapshots below', tone: 'primary' },
    { code: `${key}-exports`, label: 'Exports', value: 0, helper: 'Export from detail view', tone: 'info' }
  ];
}

const normalizeSnapshotItem = (entry: Record<string, unknown>): ReportSnapshotItem => {
  const statusCode = numberOrNull(entry.status ?? entry.statusCode);
  return {
    id: Number(entry.id ?? entry.snapshotId ?? 0),
    snapshotId: Number(entry.snapshotId ?? entry.id ?? 0),
    reportCode: stringOrNull(entry.reportCode),
    reportName: stringOrNull(entry.reportName ?? entry.name ?? entry.title),
    sourceModule: stringOrNull(entry.sourceModule ?? entry.module),
    status: formatSnapshotStatus(entry.status ?? entry.statusCode),
    statusCode,
    createdBy: stringOrNull(entry.createdBy ?? entry.generatedBy),
    createdUtc: stringOrNull(entry.createdUtc ?? entry.createdOnUtc),
    generatedUtc: stringOrNull(entry.generatedUtc ?? entry.generatedOnUtc),
    totalRows: numberOrNull(entry.totalRows ?? entry.rowCount ?? entry.totalCount),
    fileName: stringOrNull(entry.fileName ?? entry.outputFileName)
  };
};

function formatSnapshotStatus(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  const code = numberOrNull(value);
  switch (code) {
    case 1: return 'Queued';
    case 2: return 'Generating';
    case 3: return 'Completed';
    case 4: return 'Failed';
    default: return 'Unknown';
  }
}

function metricTone(index: number): ReportingDashboardMetric['tone'] {
  const tones: ReportingDashboardMetric['tone'][] = ['primary', 'success', 'warning', 'info', 'danger', 'primary'];
  return tones[index % tones.length];
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return null;
}

function arrayOfObjects(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item)) : [];
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

function numberOrStringOrNull(value: unknown): number | string | null {
  const numberValue = numberOrNull(value);
  if (numberValue !== null) return numberValue;
  return stringOrNull(value);
}
