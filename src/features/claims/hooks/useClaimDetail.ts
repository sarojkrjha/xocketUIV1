import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getClaimDetail } from '../api/claimsApi';

export function useClaimDetail(claimId: number) {
  return useQuery({
    queryKey: queryKeys.claims.detail(claimId),
    queryFn: () => getClaimDetail(claimId),
    enabled: claimId > 0,
    staleTime: 30_000
  });
}
