import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { createClaim, getClaims } from '../api/claimsApi';
import type { ClaimSearchRequest, CreateClaimRequest } from '../types/claims';

export function useClaims(request: ClaimSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.claims.search(request),
    queryFn: () => getClaims(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}


export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateClaimRequest) => createClaim(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.claims.root });
    }
  });
}
