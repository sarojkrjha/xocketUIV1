import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getPlacementAccountDetail } from '../api/placementApi';

export function usePlacementAccountDetail(placementAccountId: number) {
  return useQuery({
    queryKey: queryKeys.placement.detail(placementAccountId),
    queryFn: () => getPlacementAccountDetail(placementAccountId),
    enabled: Number.isFinite(placementAccountId) && placementAccountId > 0,
    staleTime: 30_000
  });
}
