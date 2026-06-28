import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  assignClientToUser,
  assignRoleToUser,
  createAdminClient,
  createAdminPortfolio,
  createSecurityUser,
  createWorkflowQueue,
  getAdminClients,
  getAdminPortfolios,
  getSecurityPermissions,
  getSecurityRoles,
  getSecurityUsers,
  getSystemSettings,
  getWorkflowQueues,
  upsertSystemSetting
} from '../api/administrationApi';
import type { AdminSearchRequest, PortfolioSearchRequest, WorkflowQueueSearchRequest } from '../types/administration';

const adminKeys = {
  root: ['administration'] as const,
  clients: (request: AdminSearchRequest) => [...queryKeys.administration.clients(request)] as const,
  portfolios: (request: PortfolioSearchRequest) => [...queryKeys.administration.portfolios(request)] as const,
  settings: (request: AdminSearchRequest) => [...queryKeys.administration.settings(request)] as const,
  queues: (request: WorkflowQueueSearchRequest) => [...queryKeys.administration.queues(request)] as const,
  roles: (request: AdminSearchRequest) => [...queryKeys.administration.roles(request)] as const,
  permissions: (request: AdminSearchRequest) => [...queryKeys.administration.permissions(request)] as const,
  users: (request: AdminSearchRequest) => [...queryKeys.administration.users(request)] as const
};

export function useAdminClients(request: AdminSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: adminKeys.clients(request), queryFn: () => getAdminClients(request), enabled, staleTime: 30_000 });
}

export function useAdminPortfolios(request: PortfolioSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: adminKeys.portfolios(request), queryFn: () => getAdminPortfolios(request), enabled, staleTime: 30_000 });
}

export function useSystemSettings(request: AdminSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: adminKeys.settings(request), queryFn: () => getSystemSettings(request), enabled, staleTime: 30_000 });
}

export function useWorkflowQueues(request: WorkflowQueueSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: adminKeys.queues(request), queryFn: () => getWorkflowQueues(request), enabled, staleTime: 30_000 });
}

export function useSecurityRoles(request: AdminSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: adminKeys.roles(request), queryFn: () => getSecurityRoles(request), enabled, staleTime: 60_000 });
}

export function useSecurityPermissions(request: AdminSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: adminKeys.permissions(request), queryFn: () => getSecurityPermissions(request), enabled, staleTime: 60_000 });
}

export function useSecurityUsers(request: AdminSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: adminKeys.users(request), queryFn: () => getSecurityUsers(request), enabled, staleTime: 30_000 });
}

export function useAdministrationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.root });

  return {
    createClient: useMutation({ mutationFn: createAdminClient, onSuccess: invalidate }),
    createPortfolio: useMutation({ mutationFn: createAdminPortfolio, onSuccess: invalidate }),
    upsertSetting: useMutation({ mutationFn: upsertSystemSetting, onSuccess: invalidate }),
    createQueue: useMutation({ mutationFn: createWorkflowQueue, onSuccess: invalidate }),
    createUser: useMutation({ mutationFn: createSecurityUser, onSuccess: invalidate }),
    assignRole: useMutation({ mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) => assignRoleToUser(userId, roleId), onSuccess: invalidate }),
    assignClient: useMutation({ mutationFn: ({ userId, clientId }: { userId: number; clientId: number }) => assignClientToUser(userId, clientId), onSuccess: invalidate })
  };
}
