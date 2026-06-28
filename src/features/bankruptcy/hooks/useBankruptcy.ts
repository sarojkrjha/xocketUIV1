import { useQuery } from '@tanstack/react-query';
import { searchAttorneys, searchBankruptcyCases, searchCourts, searchTrustees } from '../api/bankruptcyApi';
import type { BankruptcyCaseSearchRequest, ReferenceLookupRequest } from '../types/bankruptcy';

export function useBankruptcyCases(request: BankruptcyCaseSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: ['bankruptcy', 'cases', request],
    queryFn: () => searchBankruptcyCases(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}

export function useCourts(request: ReferenceLookupRequest, enabled: boolean) {
  return useQuery({ queryKey: ['bankruptcy', 'courts', request], queryFn: () => searchCourts(request), enabled, placeholderData: (previous) => previous, staleTime: 60_000 });
}

export function useTrustees(request: ReferenceLookupRequest, enabled: boolean) {
  return useQuery({ queryKey: ['bankruptcy', 'trustees', request], queryFn: () => searchTrustees(request), enabled, placeholderData: (previous) => previous, staleTime: 60_000 });
}

export function useAttorneys(request: ReferenceLookupRequest, enabled: boolean) {
  return useQuery({ queryKey: ['bankruptcy', 'attorneys', request], queryFn: () => searchAttorneys(request), enabled, placeholderData: (previous) => previous, staleTime: 60_000 });
}
