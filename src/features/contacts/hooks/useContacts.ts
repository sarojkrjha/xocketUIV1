import { useQuery } from '@tanstack/react-query';
import { getContact, searchContacts } from '../api/contactsApi';
import type { ContactSearchRequest } from '../types/contact';

export function useContactSearch(request: ContactSearchRequest, enabled: boolean) {
  return useQuery({
    queryKey: ['contacts', 'search', request],
    queryFn: () => searchContacts(request),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000
  });
}

export function useContactDetail(contactId: number | null) {
  return useQuery({
    queryKey: ['contacts', 'detail', contactId],
    queryFn: () => getContact(contactId ?? 0),
    enabled: Boolean(contactId),
    staleTime: 60_000
  });
}
