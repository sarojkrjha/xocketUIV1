import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { getDocumentVersions } from '../api/documentsApi';

export function useDocumentVersions(documentId: number | null) {
  return useQuery({
    queryKey: queryKeys.documents.versions(documentId ?? 0),
    queryFn: () => getDocumentVersions(documentId ?? 0),
    enabled: Boolean(documentId),
    staleTime: 30_000
  });
}
