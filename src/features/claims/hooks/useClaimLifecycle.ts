import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getClaimAmendments, getClaimObjections, getClaimTransfers } from '../api/claimsApi';

export function useClaimLifecycle(claimId: number) {
  const amendments = useQuery({
    queryKey: [...queryKeys.claims.detail(claimId), 'amendments'],
    queryFn: () => getClaimAmendments(claimId),
    enabled: claimId > 0
  });

  const objections = useQuery({
    queryKey: [...queryKeys.claims.detail(claimId), 'objections'],
    queryFn: () => getClaimObjections(claimId),
    enabled: claimId > 0
  });

  const transfers = useQuery({
    queryKey: [...queryKeys.claims.detail(claimId), 'transfers'],
    queryFn: () => getClaimTransfers(claimId),
    enabled: claimId > 0
  });

  return { amendments, objections, transfers };
}
