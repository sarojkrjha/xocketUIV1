import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { normalizePagedResult } from '@/shared/api/pagination';
import { apiGet } from '@/shared/api/request';
import type { BankruptcyCaseRow, BankruptcyCaseSearchRequest, PagedResult, ReferenceLookupRequest, ReferenceLookupRow } from '../types/bankruptcy';

function stringOrNull(value: unknown): string | null {
  return value === undefined || value === null || value === '' ? null : String(value);
}

function numberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeCase(item: Record<string, unknown>): BankruptcyCaseRow {
  return {
    id: Number(item.id ?? item.bankruptcyCaseId ?? item.caseId ?? 0),
    caseNumber: stringOrNull(item.caseNumber ?? item.bankruptcyCaseNumber),
    bankruptcyCaseNumber: stringOrNull(item.bankruptcyCaseNumber ?? item.caseNumber),
    chapter: stringOrNull(item.chapter),
    status: stringOrNull(item.status ?? item.bankruptcyCaseStatus),
    filingDate: stringOrNull(item.filingDate),
    closedDate: stringOrNull(item.closedDate),
    dismissedDate: stringOrNull(item.dismissedDate),
    courtId: numberOrNull(item.courtId ?? item.bankruptcyCourtId),
    trusteeId: numberOrNull(item.trusteeId ?? item.bankruptcyTrusteeId),
    attorneyId: numberOrNull(item.attorneyId ?? item.bankruptcyAttorneyId),
    courtName: stringOrNull(item.courtName),
    trusteeName: stringOrNull(item.trusteeName),
    attorneyName: stringOrNull(item.attorneyName),
    debtorName: stringOrNull(item.debtorName ?? item.primaryDebtorName ?? item.fullName),
    sourceSystem: stringOrNull(item.sourceSystem),
    raw: item
  };
}

function normalizeReference(item: Record<string, unknown>): ReferenceLookupRow {
  return {
    id: Number(item.id ?? item.courtId ?? item.trusteeId ?? item.attorneyId ?? 0),
    name: stringOrNull(item.name ?? item.courtName ?? item.trusteeName ?? item.attorneyName ?? item.fullName),
    code: stringOrNull(item.code ?? item.courtCode),
    stateCode: stringOrNull(item.stateCode ?? item.state),
    city: stringOrNull(item.city),
    phone: stringOrNull(item.phone ?? item.phoneNumber),
    email: stringOrNull(item.email),
    raw: item
  };
}

export async function searchBankruptcyCases(request: BankruptcyCaseSearchRequest): Promise<PagedResult<BankruptcyCaseRow>> {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyCases, request);
  return normalizePagedResult(data, request, normalizeCase);
}

export async function searchCourts(request: ReferenceLookupRequest): Promise<PagedResult<ReferenceLookupRow>> {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyCourts, request);
  return normalizePagedResult(data, request, normalizeReference);
}

export async function searchTrustees(request: ReferenceLookupRequest): Promise<PagedResult<ReferenceLookupRow>> {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyTrustees, request);
  return normalizePagedResult(data, request, normalizeReference);
}

export async function searchAttorneys(request: ReferenceLookupRequest): Promise<PagedResult<ReferenceLookupRow>> {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyAttorneys, request);
  return normalizePagedResult(data, request, normalizeReference);
}
