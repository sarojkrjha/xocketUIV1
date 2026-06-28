import type { PagedResult } from '@/shared/api/pagination';

export type MonitoringDashboard = {
  todayAlerts: number;
  pendingReviews: number;
  convertedToPlacement: number;
  reportsGenerated: number;
  failedRuns: number;
  averageProcessingMinutes: number;
};

export type MonitoringRunSearchRequest = {
  page: number;
  pageSize: number;
  status?: number;
};

export type MonitoringRunItem = {
  id: number;
  runId: number;
  clientId: number | null;
  portfolioId: number | null;
  runType: string | null;
  status: number | string | null;
  statusLabel: string;
  totalAccounts: number | null;
  alertCount: number | null;
  convertedCount: number | null;
  startedOnUtc: string | null;
  completedOnUtc: string | null;
  triggeredBy: string | null;
};

export type MonitoringRunPagedResult = PagedResult<MonitoringRunItem>;

export type RunMonitoringRequest = {
  clientId?: number;
  portfolioId?: number;
  runType?: string;
  triggeredBy?: string;
};

export type MonitoringReportDetail = {
  reportId: number;
  monitorRunId: number | null;
  clientId: number | null;
  portfolioId: number | null;
  status: number | string | null;
  statusLabel: string;
  createdBy: string | null;
  createdOnUtc: string | null;
  deliveredOnUtc: string | null;
  totalItems: number | null;
  approvedItems: number | null;
  rejectedItems: number | null;
  convertedItems: number | null;
  raw: Record<string, unknown>;
};

export type ConvertMonitoringItemRequest = {
  reportItemId: number;
  claimAmount: number;
  accountOpenDate: string;
  convertedBy?: string;
};

export type GenerateMonitoringReportRequest = {
  runId: number;
  clientId: number;
  portfolioId?: number;
  createdBy?: string;
};

export type DecideMonitoringReportItemRequest = {
  reportItemId: number;
  decision: 'approve' | 'reject';
};

export type MarkMonitoringReportDeliveredRequest = {
  reportId: number;
  deliveredBy?: string;
};
