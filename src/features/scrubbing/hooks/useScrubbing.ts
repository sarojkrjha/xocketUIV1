import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getReportedBankruptcies, getScrubDashboard, getScrubInventories, getScrubRuns, getScrubSchedules } from '../api/scrubbingApi';
import type { ReportedBankruptcySearchRequest, ScrubInventorySearchRequest, ScrubRunSearchRequest, ScrubScheduleSearchRequest } from '../types/scrubbing';

export function useScrubDashboard() {
  return useQuery({
    queryKey: queryKeys.scrubbing.dashboard,
    queryFn: getScrubDashboard,
    staleTime: 30_000
  });
}

export function useScrubInventories(request: ScrubInventorySearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.scrubbing.inventories(request),
    queryFn: () => getScrubInventories(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}

export function useScrubRuns(request: ScrubRunSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.scrubbing.runs(request),
    queryFn: () => getScrubRuns(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}

export function useReportedBankruptcies(request: ReportedBankruptcySearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.scrubbing.reportedBankruptcies(request),
    queryFn: () => getReportedBankruptcies(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}

export function useScrubSchedules(request: ScrubScheduleSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: ['scrubbing', 'schedules', request],
    queryFn: () => getScrubSchedules(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}
