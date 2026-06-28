import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  getAccountClaims,
  getAccountDocuments,
  getAccountTasks,
  getAccountTimeline,
  type WorkspaceListRequest
} from '../api/accountWorkspaceApi';

export function useAccountTimeline(request: WorkspaceListRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.accounts.timeline(request.accountId, request.page ?? 1, request.pageSize ?? 10),
    queryFn: () => getAccountTimeline(request),
    enabled,
    staleTime: 60_000
  });
}

export function useAccountClaims(request: WorkspaceListRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.accounts.claims(request.accountId, request.page ?? 1, request.pageSize ?? 10),
    queryFn: () => getAccountClaims(request),
    enabled,
    staleTime: 60_000
  });
}

export function useAccountDocuments(request: WorkspaceListRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.accounts.documents(request.accountId, request.page ?? 1, request.pageSize ?? 10),
    queryFn: () => getAccountDocuments(request),
    enabled,
    staleTime: 60_000
  });
}

export function useAccountTasks(request: WorkspaceListRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.accounts.tasks(request.accountId, request.page ?? 1, request.pageSize ?? 10),
    queryFn: () => getAccountTasks(request),
    enabled,
    staleTime: 60_000
  });
}
