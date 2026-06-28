import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getDocuments } from '../api/documentsApi';
import type { DocumentSearchRequest } from '../types/documents';

export function useDocuments(request: DocumentSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.documents.search(request),
    queryFn: () => getDocuments(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}
