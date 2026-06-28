import { useQuery } from '@tanstack/react-query';

import { getAccount } from '../api/accountsApi';
import { queryKeys } from '@/shared/api/queryKeys';

export function useAccountDetails(accountId: number | null) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(accountId ?? 0),
    queryFn: () => getAccount(accountId ?? 0),
    enabled: Boolean(accountId),
    staleTime: 60_000
  });
}
