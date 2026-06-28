import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { apiGet } from '@/shared/api/request';
import { normalizePagedResult } from '@/shared/api/pagination';
import type { AccountDetail, AccountSearchRequest, AccountSearchRow, PagedResult } from '../types/account';

const normalizeAccount = (item: Record<string, unknown>): AccountSearchRow => ({
  id: Number(item.id ?? item.accountId ?? 0),
  accountNumber: stringOrNull(item.accountNumber ?? item.primaryAccountNumber),
  clientName: stringOrNull(item.clientName),
  portfolioName: stringOrNull(item.portfolioName),
  contactName: stringOrNull(item.contactName ?? item.fullName ?? item.contactFullName),
  last4: stringOrNull(item.last4 ?? item.last4Ssn ?? item.last4SSN),
  phone: stringOrNull(item.phone ?? item.phoneNumber),
  email: stringOrNull(item.email),
  bankruptcyCaseNumber: stringOrNull(item.bankruptcyCaseNumber ?? item.caseNumber),
  courtName: stringOrNull(item.courtName),
  stateCode: stringOrNull(item.stateCode),
  status: stringOrNull(item.status),
  currentBalance: numberOrNull(item.currentBalance ?? item.balance)
});

export const normalizeAccountDetail = (item: Record<string, unknown>): AccountDetail => {
  const contactsCandidate = item.contacts ?? item.accountContacts ?? item.relatedContacts;
  const contacts = Array.isArray(contactsCandidate)
    ? contactsCandidate.map((contact) => {
      const row = (contact ?? {}) as Record<string, unknown>;
      return {
        id: numberOrNull(row.id),
        contactId: numberOrNull(row.contactId),
        fullName: stringOrNull(row.fullName),
        contactName: stringOrNull(row.contactName ?? row.fullName ?? row.name),
        relationshipType: stringOrNull(row.relationshipType) ?? numberOrNull(row.relationshipTypeId),
        contactType: stringOrNull(row.contactType) ?? numberOrNull(row.contactTypeId),
        isPrimary: booleanOrNull(row.isPrimary),
        last4: stringOrNull(row.last4 ?? row.last4Ssn ?? row.last4SSN),
        phone: stringOrNull(row.phone ?? row.phoneNumber),
        email: stringOrNull(row.email)
      };
    })
    : [];

  return {
    id: Number(item.id ?? item.accountId ?? 0),
    accountNumber: stringOrNull(item.accountNumber ?? item.primaryAccountNumber),
    primaryAccountNumber: stringOrNull(item.primaryAccountNumber ?? item.accountNumber),
    clientId: numberOrNull(item.clientId),
    clientName: stringOrNull(item.clientName),
    portfolioId: numberOrNull(item.portfolioId),
    portfolioName: stringOrNull(item.portfolioName),
    currentBalance: numberOrNull(item.currentBalance ?? item.balance),
    placementDate: stringOrNull(item.placementDate),
    status: stringOrNull(item.status) ?? numberOrNull(item.status),
    isActive: booleanOrNull(item.isActive),
    contactName: stringOrNull(item.contactName ?? item.primaryContactName),
    primaryContactName: stringOrNull(item.primaryContactName ?? item.contactName),
    last4: stringOrNull(item.last4 ?? item.last4Ssn ?? item.last4SSN),
    phone: stringOrNull(item.phone ?? item.phoneNumber),
    email: stringOrNull(item.email),
    bankruptcyCaseId: numberOrNull(item.bankruptcyCaseId),
    activeBankruptcyCaseId: numberOrNull(item.activeBankruptcyCaseId),
    bankruptcyCaseNumber: stringOrNull(item.bankruptcyCaseNumber ?? item.caseNumber),
    bankruptcyStatus: stringOrNull(item.bankruptcyStatus) ?? numberOrNull(item.bankruptcyStatus),
    filingDate: stringOrNull(item.filingDate),
    courtId: numberOrNull(item.courtId),
    courtName: stringOrNull(item.courtName),
    contacts,
    raw: item
  };
};

function stringOrNull(value: unknown): string | null {
  return value === undefined || value === null || value === '' ? null : String(value);
}

function numberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanOrNull(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return null;
}

export async function searchAccounts(request: AccountSearchRequest): Promise<PagedResult<AccountSearchRow>> {
  const data = await apiGet<unknown>(ApiPath.apiV1AccountsSearch, request);
  return normalizePagedResult(data, request, normalizeAccount);
}

export async function getAccount(accountId: number): Promise<AccountDetail> {
  const data = await apiGet<unknown>(ApiPath.apiV1AccountsAccountId.replace('{accountId}', String(accountId)));
  return normalizeAccountDetail((data ?? {}) as Record<string, unknown>);
}
