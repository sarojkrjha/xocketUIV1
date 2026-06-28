import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getPlacementDashboard } from '../api/placementApi';

export function usePlacementDashboard() {
  return useQuery({
    queryKey: queryKeys.placement.dashboard,
    queryFn: getPlacementDashboard,
    staleTime: 30_000
  });
}
