import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { addPlacementReviewFlag, decidePlacementLegalReview, resolvePlacementReviewFlag, runPlacementBankruptcyMatching, selectPlacementBankruptcyMatch } from '../api/placementApi';
import type { AddPlacementFlagRequest, DecideLegalReviewRequest, ResolvePlacementReviewFlagRequest, SelectPlacementMatchRequest } from '../types/placement';

export function useRunPlacementMatching(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestedBy?: string | null) => runPlacementBankruptcyMatching(placementAccountId, requestedBy),
    onSuccess: (matches) => {
      queryClient.setQueryData(queryKeys.placement.matches(placementAccountId), matches);
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.detail(placementAccountId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.dashboard });
    }
  });
}

export function useSelectPlacementMatch(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SelectPlacementMatchRequest) => selectPlacementBankruptcyMatch(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.detail(placementAccountId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.queue({}) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.dashboard });
    }
  });
}

export function useAddPlacementFlag(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddPlacementFlagRequest) => addPlacementReviewFlag(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.detail(placementAccountId) });
    }
  });
}


export function useDecidePlacementLegalReview(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DecideLegalReviewRequest) => decidePlacementLegalReview(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.detail(placementAccountId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.queue({}) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.dashboard });
    }
  });
}


export function useResolvePlacementReviewFlag(placementAccountId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ResolvePlacementReviewFlagRequest) => resolvePlacementReviewFlag(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.detail(placementAccountId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.queue({}) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.placement.dashboard });
    }
  });
}
