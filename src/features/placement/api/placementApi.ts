import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { apiGet, apiPost, apiPut, buildPath } from '@/shared/api/request';
import { normalizePagedResult } from '@/shared/api/pagination';
import type {
  PagedResult,
  PlacementAccount,
  PlacementAccountDetail,
  PlacementBankruptcyMatch,
  PlacementDashboard,
  PlacementQueueRequest,
  MovePlacementQueueRequest,
  PlacementReviewFlag,
  AddPlacementFlagRequest,
  SelectPlacementMatchRequest,
  DecideLegalReviewRequest,
  ResolvePlacementReviewFlagRequest,
  FilingAssignmentRequest,
  GeneratePlacementDocumentRequest,
  PlacementFilingPage,
  SubmitPlacementFilingRequest,
  UploadPlacementCourtReceiptRequest,
  UploadPlacementPocDocumentRequest
} from '../types/placement';
import { formatPlacementMatchStatus, formatPlacementQueueStatus } from './placementStatusMaps';

const emptyDashboard: PlacementDashboard = {
  readyToMatch: 0,
  pendingMatchReview: 0,
  legalReview: 0,
  readyForPoc: 0,
  readyToFile: 0,
  exceptions: 0,
  completedToday: 0,
  totalOpen: 0
};

export async function getPlacementDashboard(): Promise<PlacementDashboard> {
  const data = await apiGet<unknown>(ApiPath.apiV1PlacementDashboard);
  const payload = objectOrEmpty(data);

  return {
    readyToMatch: numberOrZero(payload.readyToMatch ?? payload.readyForMatching ?? payload.newPlacements),
    pendingMatchReview: numberOrZero(payload.pendingMatchReview ?? payload.pendingReview ?? payload.matchReview),
    legalReview: numberOrZero(payload.legalReview ?? payload.pendingLegalReview),
    readyForPoc: numberOrZero(payload.readyForPoc ?? payload.readyForClaim ?? payload.readyForClaimCreation),
    readyToFile: numberOrZero(payload.readyToFile ?? payload.filingReady),
    exceptions: numberOrZero(payload.exceptions ?? payload.exceptionCount),
    completedToday: numberOrZero(payload.completedToday ?? payload.filedToday),
    totalOpen: numberOrZero(payload.totalOpen ?? payload.openCount ?? payload.totalCount)
  };
}

export async function getPlacementAccounts(request: PlacementQueueRequest): Promise<PagedResult<PlacementAccount>> {
  const data = await apiGet<unknown>(ApiPath.apiV1PlacementQueue, {
    page: request.page,
    pageSize: request.pageSize,
    search: request.search,
    queueStatus: request.queueStatus,
    matchStatus: request.matchStatus,
    clientId: request.clientId,
    courtId: request.courtId,
    filerUserId: request.filerUserId
  });

  return normalizePagedResult(data, request, normalizeAccount);
}


export async function movePlacementAccountQueue(request: MovePlacementQueueRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdQueue, {
    placementAccountId: request.placementAccountId
  });

  return apiPut<unknown, MovePlacementQueueRequest>(path, request);
}

export async function getPlacementAccountDetail(placementAccountId: number): Promise<PlacementAccountDetail> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountId, { placementAccountId });
  const data = await apiGet<unknown>(path);
  return normalizeDetail(objectOrEmpty(data));
}


export async function runPlacementBankruptcyMatching(placementAccountId: number, requestedBy?: string | null): Promise<PlacementBankruptcyMatch[]> {
  const path = buildPath(ApiPath.apiV1MatchingPlacementAccountsPlacementAccountIdBankruptcyCandidates, { placementAccountId });
  const data = await apiPost<unknown, { requestedBy?: string | null }>(path, { requestedBy: requestedBy ?? undefined });
  return normalizeMatches(extractArray(data));
}

export async function selectPlacementBankruptcyMatch(request: SelectPlacementMatchRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdMatchesPlacementBankruptcyMatchIdSelect, {
    placementAccountId: request.placementAccountId,
    placementBankruptcyMatchId: request.placementBankruptcyMatchId
  });

  return apiPut<unknown, SelectPlacementMatchRequest>(path, request);
}

export async function addPlacementReviewFlag(request: AddPlacementFlagRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdFlags, { placementAccountId: request.placementAccountId });
  return apiPost<unknown, AddPlacementFlagRequest>(path, request);
}

export async function decidePlacementLegalReview(request: DecideLegalReviewRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdLegalReview, {
    placementAccountId: request.placementAccountId
  });

  return apiPut<unknown, DecideLegalReviewRequest>(path, request);
}


export async function resolvePlacementReviewFlag(request: ResolvePlacementReviewFlagRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementFlagsPlacementReviewFlagIdResolve, {
    placementReviewFlagId: request.placementReviewFlagId
  });

  return apiPut<unknown, ResolvePlacementReviewFlagRequest>(path, request);
}

export async function assignPlacementFiling(request: FilingAssignmentRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdFilingAssignment, {
    placementAccountId: request.placementAccountId
  });

  return apiPut<unknown, FilingAssignmentRequest>(path, request);
}

export async function getPlacementFilingPage(placementAccountId: number): Promise<PlacementFilingPage> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdFilingPage, { placementAccountId });
  const data = await apiGet<unknown>(path);
  const item = objectOrEmpty(data);

  return {
    placementAccountId,
    accountNumber: stringOrNull(item.accountNumber),
    courtName: stringOrNull(item.courtName ?? item.bankruptcyCourt),
    courtWebsiteUrl: stringOrNull(item.courtWebsiteUrl ?? item.websiteUrl ?? item.courtUrl),
    ecfFilingUrl: stringOrNull(item.ecfFilingUrl ?? item.filingUrl ?? item.ecfUrl),
    pacerUrl: stringOrNull(item.pacerUrl),
    bankruptcyCaseNumber: stringOrNull(item.bankruptcyCaseNumber ?? item.caseNumber),
    courtClaimNumber: stringOrNull(item.courtClaimNumber ?? item.claimNumber),
    trackingNumber: stringOrNull(item.trackingNumber),
    filingStatus: stringOrNull(item.filingStatus ?? item.status),
    pocDocumentId: numberOrNull(item.pocDocumentId ?? item.documentId),
    courtReceiptId: numberOrNull(item.courtReceiptId ?? item.receiptDocumentId),
    lastUpdatedUtc: stringOrNull(item.lastUpdatedUtc ?? item.updatedOnUtc ?? item.modifiedOnUtc)
  };
}

export async function generatePlacementDocument(request: GeneratePlacementDocumentRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdDocumentsGenerate, {
    placementAccountId: request.placementAccountId
  });

  return apiPost<unknown, GeneratePlacementDocumentRequest>(path, request);
}

export async function uploadPlacementPocDocument(request: UploadPlacementPocDocumentRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdPocDocuments, {
    placementAccountId: request.placementAccountId
  });
  const formData = new FormData();
  formData.append('file', request.file);

  return apiPost<unknown, FormData>(path, formData, { generatedBy: request.generatedBy ?? undefined });
}

export async function uploadPlacementCourtReceipt(request: UploadPlacementCourtReceiptRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdCourtReceipts, {
    placementAccountId: request.placementAccountId
  });
  const formData = new FormData();
  formData.append('file', request.file);

  return apiPost<unknown, FormData>(path, formData, { uploadedBy: request.uploadedBy ?? undefined });
}

export async function submitPlacementFiling(request: SubmitPlacementFilingRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementAccountsPlacementAccountIdSubmitFiling, {
    placementAccountId: request.placementAccountId
  });

  return apiPost<unknown, SubmitPlacementFilingRequest>(path, request);
}

const normalizeAccount = (item: Record<string, unknown>): PlacementAccount => ({
  id: Number(item.id ?? item.placementAccountId ?? item.accountId ?? 0),
  placementAccountId: numberOrNull(item.placementAccountId ?? item.id),
  accountId: numberOrNull(item.accountId),
  accountNumber: stringOrNull(item.accountNumber ?? item.primaryAccountNumber ?? item.accountNo ?? item.accountCode),
  clientName: stringOrNull(item.clientName ?? item.client),
  portfolioName: stringOrNull(item.portfolioName ?? item.portfolio),
  debtorName: stringOrNull(item.debtorName ?? item.contactFullName ?? item.contactName ?? item.fullName),
  contactName: stringOrNull(item.contactName ?? item.contactFullName ?? item.fullName),
  bankruptcyCaseId: numberOrNull(item.bankruptcyCaseId ?? item.activeBankruptcyCaseId),
  bankruptcyCaseNumber: stringOrNull(item.bankruptcyCaseNumber ?? item.caseNumber),
  bankruptcyCourt: stringOrNull(item.bankruptcyCourt ?? item.courtName),
  bankruptcyChapter: stringOrNull(item.bankruptcyChapter ?? item.chapter),
  matchStatus: formatPlacementMatchStatus(item.matchStatus ?? item.bankruptcyMatchStatus),
  matchStatusCode: numberOrNull(item.matchStatus ?? item.bankruptcyMatchStatus),
  queueStatus: formatPlacementQueueStatus(item.queueStatus ?? item.placementQueueStatus),
  queueStatusCode: numberOrNull(item.queueStatus ?? item.placementQueueStatus),
  placementStatus: formatPlacementQueueStatus(item.queueStatus ?? item.placementQueueStatus) ?? stringOrNull(item.placementStatus ?? item.status),
  claimStatus: stringOrNull(item.claimStatus),
  last4Ssn: stringOrNull(item.last4Ssn ?? item.last4SSN ?? item.last4),
  balance: numberOrNull(item.balance ?? item.currentBalance ?? item.claimAmount),
  claimAmount: numberOrNull(item.claimAmount),
  placedOnUtc: stringOrNull(item.placedOnUtc ?? item.createdOnUtc ?? item.datePlaced ?? item.placementDate),
  updatedOnUtc: stringOrNull(item.updatedOnUtc ?? item.modifiedOnUtc),
  filerUserId: stringOrNull(item.filerUserId ?? item.assignedFilerUserId),
  reviewerUserId: stringOrNull(item.reviewerUserId ?? item.assignedReviewerUserId)
});

const normalizeDetail = (item: Record<string, unknown>): PlacementAccountDetail => {
  const base = normalizeAccount(item);
  return {
    ...base,
    courtName: stringOrNull(item.courtName ?? item.bankruptcyCourt),
    trusteeName: stringOrNull(item.trusteeName),
    attorneyName: stringOrNull(item.attorneyName ?? item.assignedAttorneyName),
    filingDistrict: stringOrNull(item.filingDistrict ?? item.district),
    filingDivision: stringOrNull(item.filingDivision ?? item.division),
    barDate: stringOrNull(item.barDate),
    accountOpenDate: stringOrNull(item.accountOpenDate),
    lastPaymentDate: stringOrNull(item.lastPaymentDate),
    chargeOffDate: stringOrNull(item.chargeOffDate),
    principalAmount: numberOrNull(item.principalAmount),
    interestAmount: numberOrNull(item.interestAmount),
    feesAmount: numberOrNull(item.feesAmount),
    expensesAmount: numberOrNull(item.expensesAmount),
    flags: normalizeFlags(item.flags ?? item.reviewFlags),
    matches: normalizeMatches(item.matches ?? item.bankruptcyMatches ?? item.candidates)
  };
};

function normalizeFlags(value: unknown): PlacementReviewFlag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((flag) => {
    const item = objectOrEmpty(flag);
    return {
      id: Number(item.id ?? item.placementReviewFlagId ?? 0),
      flagCode: stringOrNull(item.flagCode),
      flagDescription: stringOrNull(item.flagDescription ?? item.description),
      status: stringOrNull(item.status),
      createdBy: stringOrNull(item.createdBy),
      createdOnUtc: stringOrNull(item.createdOnUtc)
    };
  });
}

function normalizeMatches(value: unknown): PlacementBankruptcyMatch[] {
  const candidates = Array.isArray(value) ? value : extractArray(value);
  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates.map((candidate) => {
    const item = objectOrEmpty(candidate);
    const score = numberOrNull(item.score ?? item.matchScore ?? item.confidenceScore ?? item.totalScore);
    return {
      id: Number(item.id ?? item.placementBankruptcyMatchId ?? item.matchId ?? 0),
      placementBankruptcyMatchId: numberOrNull(item.placementBankruptcyMatchId ?? item.id ?? item.matchId),
      bankruptcyCaseId: numberOrNull(item.bankruptcyCaseId ?? item.caseId),
      caseNumber: stringOrNull(item.caseNumber ?? item.bankruptcyCaseNumber ?? item.caseNo),
      score,
      confidence: confidenceFromScore(score),
      decision: stringOrNull(item.decision ?? item.status ?? item.matchStatus),
      courtName: stringOrNull(item.courtName ?? item.bankruptcyCourt),
      chapter: stringOrNull(item.chapter ?? item.bankruptcyChapter),
      filingDate: stringOrNull(item.filingDate ?? item.filedOn ?? item.petitionDate),
      debtorName: stringOrNull(item.debtorName ?? item.fullName ?? item.contactName),
      debtorLast4: stringOrNull(item.debtorLast4 ?? item.last4Ssn ?? item.last4SSN ?? item.last4),
      address: stringOrNull(item.address ?? item.address1 ?? item.fullAddress),
      phone: stringOrNull(item.phone ?? item.phoneNumber),
      email: stringOrNull(item.email ?? item.emailAddress),
      attorneyName: stringOrNull(item.attorneyName),
      trusteeName: stringOrNull(item.trusteeName),
      evidence: normalizeEvidence(item.evidence ?? item.scoreBreakdown ?? item.matchReasons ?? item.reasons, item, score)
    };
  });
}

function normalizeEvidence(value: unknown, source: Record<string, unknown>, score: number | null) {
  if (Array.isArray(value)) {
    return value.map((entry, index) => {
      const item = objectOrEmpty(entry);
      return {
        key: stringOrNull(item.key ?? item.rule ?? item.name) ?? `evidence-${index}`,
        label: stringOrNull(item.label ?? item.ruleName ?? item.name ?? item.key) ?? `Evidence ${index + 1}`,
        status: evidenceStatus(item.status ?? item.result ?? item.match),
        score: numberOrNull(item.score ?? item.points ?? item.weight),
        accountValue: stringOrNull(item.accountValue ?? item.leftValue),
        candidateValue: stringOrNull(item.candidateValue ?? item.rightValue),
        notes: stringOrNull(item.notes ?? item.reason)
      };
    });
  }

  return [
    evidenceFromField('ssn', 'SSN / Last 4', source.ssnMatched ?? source.last4Matched ?? source.isSsnMatch, source.last4Ssn, source.debtorLast4, score !== null && score >= 90 ? 100 : null),
    evidenceFromField('name', 'Name', source.nameMatched ?? source.isNameMatch, source.contactName ?? source.debtorName, source.debtorName, null),
    evidenceFromField('address', 'Address', source.addressMatched ?? source.isAddressMatch, source.accountAddress, source.address ?? source.fullAddress, null),
    evidenceFromField('phone', 'Phone', source.phoneMatched ?? source.isPhoneMatch, source.accountPhone, source.phone ?? source.phoneNumber, null),
    evidenceFromField('email', 'Email', source.emailMatched ?? source.isEmailMatch, source.accountEmail, source.email ?? source.emailAddress, null)
  ];
}

function evidenceFromField(key: string, label: string, statusValue: unknown, accountValue: unknown, candidateValue: unknown, score: number | null) {
  return {
    key,
    label,
    status: evidenceStatus(statusValue),
    score,
    accountValue: stringOrNull(accountValue),
    candidateValue: stringOrNull(candidateValue),
    notes: null
  };
}

function evidenceStatus(value: unknown): 'matched' | 'partial' | 'conflict' | 'missing' | 'unknown' {
  if (value === true) return 'matched';
  if (value === false) return 'conflict';
  const normalized = stringOrNull(value)?.toLowerCase();
  if (!normalized) return 'unknown';
  if (['match', 'matched', 'true', 'yes', 'pass'].includes(normalized)) return 'matched';
  if (['partial', 'possible', 'warning'].includes(normalized)) return 'partial';
  if (['conflict', 'mismatch', 'false', 'fail', 'failed'].includes(normalized)) return 'conflict';
  if (['missing', 'not available', 'na', 'n/a'].includes(normalized)) return 'missing';
  return 'unknown';
}

function confidenceFromScore(score: number | null): 'High' | 'Medium' | 'Low' | 'Unknown' {
  if (score === null) return 'Unknown';
  if (score >= 90) return 'High';
  if (score >= 75) return 'Medium';
  return 'Low';
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  const item = objectOrEmpty(value);
  const candidates = item.items ?? item.candidates ?? item.matches ?? item.bankruptcyCandidates ?? item.data ?? item.results ?? item.value;
  return Array.isArray(candidates) ? candidates : [];
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function stringOrNull(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return String(value);
}

function numberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function numberOrZero(value: unknown): number {
  return numberOrNull(value) ?? 0;
}

export { emptyDashboard };
