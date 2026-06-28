import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  assignPlacementFiling,
  generatePlacementDocument,
  getPlacementFilingPage,
  submitPlacementFiling,
  uploadPlacementCourtReceipt,
  uploadPlacementPocDocument
} from '../api/placementApi';
import type {
  FilingAssignmentRequest,
  GeneratePlacementDocumentRequest,
  SubmitPlacementFilingRequest,
  UploadPlacementCourtReceiptRequest,
  UploadPlacementPocDocumentRequest
} from '../types/placement';

const filingPageKey = (placementAccountId: number) => ['placement', 'filing-page', placementAccountId] as const;

function invalidatePlacement(queryClient: ReturnType<typeof useQueryClient>, placementAccountId: number) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.placement.detail(placementAccountId) });
  void queryClient.invalidateQueries({ queryKey: filingPageKey(placementAccountId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.placement.queue({}) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.placement.dashboard });
}

export function usePlacementFilingPage(placementAccountId: number) {
  return useQuery({
    queryKey: filingPageKey(placementAccountId),
    queryFn: () => getPlacementFilingPage(placementAccountId),
    enabled: Number.isFinite(placementAccountId) && placementAccountId > 0,
    staleTime: 30_000
  });
}

export function useAssignPlacementFiling(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: FilingAssignmentRequest) => assignPlacementFiling(request),
    onSuccess: () => invalidatePlacement(queryClient, placementAccountId)
  });
}

export function useGeneratePlacementDocument(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GeneratePlacementDocumentRequest) => generatePlacementDocument(request),
    onSuccess: () => invalidatePlacement(queryClient, placementAccountId)
  });
}

export function useUploadPlacementPocDocument(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UploadPlacementPocDocumentRequest) => uploadPlacementPocDocument(request),
    onSuccess: () => invalidatePlacement(queryClient, placementAccountId)
  });
}

export function useUploadPlacementCourtReceipt(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UploadPlacementCourtReceiptRequest) => uploadPlacementCourtReceipt(request),
    onSuccess: () => invalidatePlacement(queryClient, placementAccountId)
  });
}

export function useSubmitPlacementFiling(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubmitPlacementFilingRequest) => submitPlacementFiling(request),
    onSuccess: () => invalidatePlacement(queryClient, placementAccountId)
  });
}
