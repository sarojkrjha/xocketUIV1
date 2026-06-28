import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getPlacementAccounts, movePlacementAccountQueue } from '../api/placementApi';
import type { MovePlacementQueueRequest, PlacementAccountSearchRequest } from '../types/placement';

export function usePlacementAccounts(request: PlacementAccountSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.placement.queue(request),
    queryFn: () => getPlacementAccounts(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}


export function useMovePlacementQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: MovePlacementQueueRequest) => movePlacementAccountQueue(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.placement.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.placement.dashboard })
      ]);
    }
  });
}
