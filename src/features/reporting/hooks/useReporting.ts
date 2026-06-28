import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getReportSnapshotDetail, getReportSnapshots, getReportingDashboard } from '../api/reportingApi';
import type { DashboardKey, ReportSnapshotSearchRequest } from '../types/reporting';

export function useReportingDashboard(key: DashboardKey) {
  return useQuery({
    queryKey: queryKeys.reporting.dashboard(key),
    queryFn: () => getReportingDashboard(key),
    staleTime: 60_000
  });
}

export function useReportSnapshots(request: ReportSnapshotSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.reporting.snapshots(request),
    queryFn: () => getReportSnapshots(request),
    enabled,
    staleTime: 30_000
  });
}

export function useReportSnapshotDetail(snapshotId: number | null) {
  return useQuery({
    queryKey: snapshotId ? queryKeys.reporting.snapshotDetail(snapshotId) : ['reporting', 'snapshots', 'detail', 'none'],
    queryFn: () => getReportSnapshotDetail(snapshotId ?? 0),
    enabled: Boolean(snapshotId),
    staleTime: 60_000
  });
}
