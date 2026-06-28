import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  createNdcSchedule,
  deactivateNdcSchedule,
  getNdcDashboard,
  getNdcImportRunDetail,
  getNdcImportRuns,
  getNdcPayments,
  getNdcSchedules,
  importNdcPayments,
  postNdcPaymentToClaim
} from '../api/paymentsApi';
import type { CreateNdcScheduleRequest, ImportNdcPaymentsRequest, NdcImportRunSearchRequest, NdcScheduleSearchRequest, PaymentSearchRequest, PostNdcPaymentToClaimRequest } from '../types/payments';

export function useNdcDashboard() {
  return useQuery({
    queryKey: queryKeys.payments.dashboard,
    queryFn: getNdcDashboard,
    staleTime: 30_000
  });
}

export function useNdcPayments(request: PaymentSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.payments.payments(request),
    queryFn: () => getNdcPayments(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}

export function useNdcImportRuns(request: NdcImportRunSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.payments.importRuns(request),
    queryFn: () => getNdcImportRuns(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}

export function useNdcImportRunDetail(runId: number | null) {
  return useQuery({
    queryKey: ['payments', 'import-run-detail', runId] as const,
    queryFn: () => getNdcImportRunDetail(runId as number),
    enabled: Boolean(runId),
    staleTime: 30_000
  });
}

export function useNdcSchedules(request: NdcScheduleSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.payments.schedules(request),
    queryFn: () => getNdcSchedules(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}

export function useImportNdcPayments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ImportNdcPaymentsRequest) => importNdcPayments(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.root });
    }
  });
}

export function useCreateNdcSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateNdcScheduleRequest) => createNdcSchedule(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.root });
    }
  });
}

export function useDeactivateNdcSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: number) => deactivateNdcSchedule(scheduleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.root });
    }
  });
}


export function usePostNdcPaymentToClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PostNdcPaymentToClaimRequest) => postNdcPaymentToClaim(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.claims.root });
    }
  });
}
