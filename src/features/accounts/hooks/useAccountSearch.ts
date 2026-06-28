import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { searchAccounts } from '../api/accountsApi';
import type { AccountSearchRequest } from '../types/account';

export function useAccountSearch(request: AccountSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.accounts.search(request),
    queryFn: () => searchAccounts(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}
