export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ReportingDashboardMetric = {
  code: string;
  label: string;
  value: number | string | null;
  helper: string;
  trend?: string | null;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info';
};

export type ReportingDashboard = {
  module: string;
  title: string;
  metrics: ReportingDashboardMetric[];
  lastRefreshedUtc?: string | null;
};

export type ReportSnapshotSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  reportCode?: string;
  sourceModule?: string;
  status?: number;
};

export type ReportSnapshotItem = {
  id: number;
  snapshotId: number;
  reportCode: string | null;
  reportName: string | null;
  sourceModule: string | null;
  status: string | null;
  statusCode: number | null;
  createdBy: string | null;
  createdUtc: string | null;
  generatedUtc: string | null;
  totalRows: number | null;
  fileName: string | null;
};

export type ReportSnapshotDetail = ReportSnapshotItem & {
  description: string | null;
  parameters: Record<string, unknown> | null;
  previewRows: Record<string, unknown>[];
};

export type DashboardKey = 'operations' | 'placement' | 'claims' | 'ndc' | 'scrub' | 'bankruptcyMonitoring';

export type CreateMonitoringSnapshotRequest = {
  reportId: number;
  createdBy: string;
};
