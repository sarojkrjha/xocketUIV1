import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getMonitoringDashboard, getMonitoringReport, getMonitoringRuns } from '../api/monitoringApi';
import type { MonitoringRunSearchRequest } from '../types/monitoring';

export function useMonitoringDashboard() {
  return useQuery({
    queryKey: queryKeys.monitoring.dashboard,
    queryFn: getMonitoringDashboard
  });
}

export function useMonitoringRuns(request: MonitoringRunSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.monitoring.runs(request),
    queryFn: () => getMonitoringRuns(request),
    enabled
  });
}

export function useMonitoringReport(reportId: number | null) {
  return useQuery({
    queryKey: reportId ? queryKeys.monitoring.reportDetail(reportId) : ['monitoring', 'reports', 'none'],
    queryFn: () => getMonitoringReport(reportId ?? 0),
    enabled: Boolean(reportId)
  });
}
