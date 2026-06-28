import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { normalizePagedResult } from '@/shared/api/pagination';
import { apiGet, buildPath } from '@/shared/api/request';
import type { ContactRow, ContactSearchRequest, PagedResult } from '../types/contact';

function stringOrNull(value: unknown): string | null {
  return value === undefined || value === null || value === '' ? null : String(value);
}

function booleanOrNull(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function normalizeContact(item: Record<string, unknown>): ContactRow {
  return {
    id: Number(item.id ?? item.contactId ?? 0),
    contactId: Number(item.contactId ?? item.id ?? 0),
    fullName: stringOrNull(item.fullName ?? item.contactName ?? item.name),
    companyName: stringOrNull(item.companyName),
    contactType: stringOrNull(item.contactType) ?? (item.contactTypeId === undefined ? null : Number(item.contactTypeId)),
    last4: stringOrNull(item.last4 ?? item.last4Ssn ?? item.last4SSN),
    phone: stringOrNull(item.phone ?? item.phoneNumber),
    email: stringOrNull(item.email),
    address1: stringOrNull(item.address1),
    city: stringOrNull(item.city),
    stateCode: stringOrNull(item.stateCode ?? item.state),
    postalCode: stringOrNull(item.postalCode ?? item.zipCode ?? item.zip),
    isActive: booleanOrNull(item.isActive),
    raw: item
  };
}

export async function searchContacts(request: ContactSearchRequest): Promise<PagedResult<ContactRow>> {
  const data = await apiGet<unknown>(ApiPath.apiV1AccountsContacts, request);
  return normalizePagedResult(data, request, normalizeContact);
}

export async function getContact(contactId: number): Promise<ContactRow> {
  const data = await apiGet<unknown>(buildPath(ApiPath.apiV1AccountsContactsContactId, { contactId }));
  return normalizeContact((data ?? {}) as Record<string, unknown>);
}
