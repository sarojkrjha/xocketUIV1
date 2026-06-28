import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { apiGet, apiPost, apiPut, buildPath } from '@/shared/api/request';
import { normalizePagedResult } from '@/shared/api/pagination';
import type {
  AddClaimPaymentRequest,
  AdvanceClaimStatusRequest,
  AssignAttorneyRequest,
  ClaimAmendment,
  ClaimEligibilityRequest,
  ClaimEligibilityResult,
  ClaimObjection,
  ClaimTransfer,
  CreateClaimAmendmentRequest,
  CreateClaimObjectionRequest,
  CreateClaimTransferRequest,
  ClaimDetail,
  ClaimDocument,
  ClaimPayment,
  ClaimQueueItem,
  ClaimSearchRequest,
  ClaimWorkflowEvent,
  CreateClaimRequest,
  PagedResult,
  PrepareFilingPackageRequest,
  ProcessBankruptcyEventRequest,
  ProcessReceiptRequest,
  RegisterFilingRequest,
  ResolveClaimObjectionRequest,
  PostClaimPaymentRequest
} from '../types/claims';
import { formatClaimStatus } from './claimStatusMaps';


export async function checkClaimEligibility(request: ClaimEligibilityRequest): Promise<ClaimEligibilityResult> {
  const data = await apiGet<unknown>(ApiPath.apiV1ClaimsEligibility, {
    accountId: request.accountId,
    placementAccountId: request.placementAccountId,
    bankruptcyCaseId: request.bankruptcyCaseId,
    claimAmount: request.claimAmount,
    barDate: request.barDate,
    requestedBy: request.requestedBy
  });
  const item = objectOrEmpty(data);
  return {
    eligible: boolOrNull(item.eligible ?? item.isEligible ?? item.canCreateClaim),
    decision: stringOrNull(item.decision ?? item.status ?? item.result),
    reason: stringOrNull(item.reason ?? item.message ?? item.description),
    warnings: stringArray(item.warnings ?? item.warningMessages),
    missingRequirements: stringArray(item.missingRequirements ?? item.missingFields ?? item.validationErrors)
  };
}

export async function assignAttorney(request: AssignAttorneyRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdAttorneyAssignment, { claimId: request.claimId });
  return apiPost<unknown, AssignAttorneyRequest>(path, request);
}

export async function postClaimPayment(request: PostClaimPaymentRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdPaymentsPost, { claimId: request.claimId });
  return apiPost<unknown, PostClaimPaymentRequest>(path, request);
}

export async function processBankruptcyEvent(request: ProcessBankruptcyEventRequest): Promise<unknown> {
  return apiPost<unknown, ProcessBankruptcyEventRequest>(ApiPath.apiV1ClaimsBankruptcyEvents, request);
}

export async function getClaimAmendments(claimId: number): Promise<ClaimAmendment[]> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdAmendments, { claimId });
  return extractArray(await apiGet<unknown>(path)).map(normalizeClaimAmendment);
}

export async function createClaimAmendment(request: CreateClaimAmendmentRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdAmendments, { claimId: request.claimId });
  return apiPost<unknown, CreateClaimAmendmentRequest>(path, request);
}

export async function markClaimAmendmentFiled(amendmentId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsAmendmentsAmendmentIdFiled, { amendmentId });
  return apiPut<unknown, Record<string, never>>(path, {});
}

export async function getClaimObjections(claimId: number): Promise<ClaimObjection[]> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdObjections, { claimId });
  return extractArray(await apiGet<unknown>(path)).map(normalizeClaimObjection);
}

export async function createClaimObjection(request: CreateClaimObjectionRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdObjections, { claimId: request.claimId });
  return apiPost<unknown, CreateClaimObjectionRequest>(path, request);
}

export async function markClaimObjectionResponded(objectionId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsObjectionsObjectionIdResponded, { objectionId });
  return apiPut<unknown, Record<string, never>>(path, {});
}

export async function resolveClaimObjection(request: ResolveClaimObjectionRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsObjectionsObjectionIdResolve, { objectionId: request.objectionId });
  return apiPut<unknown, ResolveClaimObjectionRequest>(path, request);
}

export async function getClaimTransfers(claimId: number): Promise<ClaimTransfer[]> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdTransfers, { claimId });
  return extractArray(await apiGet<unknown>(path)).map(normalizeClaimTransfer);
}

export async function createClaimTransfer(request: CreateClaimTransferRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdTransfers, { claimId: request.claimId });
  return apiPost<unknown, CreateClaimTransferRequest>(path, request);
}

export async function markClaimTransferFiled(transferId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsTransfersTransferIdFiled, { transferId });
  return apiPut<unknown, Record<string, never>>(path, {});
}

export async function markClaimTransferAccepted(transferId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsTransfersTransferIdAccepted, { transferId });
  return apiPut<unknown, Record<string, never>>(path, {});
}

export async function getClaims(request: ClaimSearchRequest): Promise<PagedResult<ClaimQueueItem>> {
  const data = await apiGet<unknown>(ApiPath.apiV1Claims, {
    page: request.page,
    pageSize: request.pageSize,
    search: request.search,
    accountId: request.accountId,
    bankruptcyCaseId: request.bankruptcyCaseId,
    status: request.status
  });

  return normalizePagedResult(data, request, normalizeClaimQueueItem);
}

export async function getClaimDetail(claimId: number): Promise<ClaimDetail> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimId, { claimId });
  const data = await apiGet<unknown>(path);
  return normalizeClaimDetail(objectOrEmpty(data));
}

export async function createClaim(request: CreateClaimRequest): Promise<unknown> {
  return apiPost<unknown, CreateClaimRequest>(ApiPath.apiV1Claims, request);
}

export async function prepareFilingPackage(request: PrepareFilingPackageRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdFilingPackage, { claimId: request.claimId });
  return apiPost<unknown, PrepareFilingPackageRequest>(path, request);
}

export async function registerFiling(request: RegisterFilingRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdRegisterFiling, { claimId: request.claimId });
  return apiPost<unknown, RegisterFilingRequest>(path, request);
}

export async function processReceipt(request: ProcessReceiptRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdReceipt, { claimId: request.claimId });
  return apiPost<unknown, ProcessReceiptRequest>(path, request);
}

export async function addClaimPayment(request: AddClaimPaymentRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdPayments, { claimId: request.claimId });
  return apiPost<unknown, AddClaimPaymentRequest>(path, request);
}

export async function advanceClaimStatus(request: AdvanceClaimStatusRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1ClaimsClaimIdStatus, { claimId: request.claimId });
  return apiPut<unknown, AdvanceClaimStatusRequest>(path, request);
}

const normalizeClaimQueueItem = (item: Record<string, unknown>): ClaimQueueItem => ({
  id: Number(item.id ?? item.claimId ?? 0),
  claimId: Number(item.claimId ?? item.id ?? 0),
  accountId: numberOrNull(item.accountId),
  accountNumber: stringOrNull(item.accountNumber ?? item.primaryAccountNumber),
  bankruptcyCaseId: numberOrNull(item.bankruptcyCaseId),
  bankruptcyCaseNumber: stringOrNull(item.bankruptcyCaseNumber ?? item.caseNumber),
  debtorName: stringOrNull(item.debtorName ?? item.contactName ?? item.fullName),
  courtName: stringOrNull(item.courtName ?? item.bankruptcyCourt),
  trusteeName: stringOrNull(item.trusteeName),
  claimAmount: numberOrNull(item.claimAmount ?? item.amount),
  barDate: stringOrNull(item.barDate),
  filedOnUtc: stringOrNull(item.filedOnUtc ?? item.filedDate),
  status: formatClaimStatus(item.status ?? item.claimStatus),
  statusCode: numberOrNull(item.status ?? item.claimStatus),
  courtClaimNumber: stringOrNull(item.courtClaimNumber),
  attorneyName: stringOrNull(item.attorneyName ?? item.assignedAttorneyName),
  createdOnUtc: stringOrNull(item.createdOnUtc ?? item.createdDate)
});

const normalizeClaimDetail = (item: Record<string, unknown>): ClaimDetail => {
  const base = normalizeClaimQueueItem(item);
  const claimAmount = base.claimAmount;
  const paidAmount = numberOrNull(item.paidAmount ?? item.totalPaidAmount ?? item.totalPayments);

  return {
    ...base,
    debtorLast4: stringOrNull(item.debtorLast4 ?? item.last4Ssn ?? item.last4SSN ?? item.last4),
    trusteeId: numberOrNull(item.trusteeId),
    principalAmount: numberOrNull(item.principalAmount),
    paidAmount,
    remainingBalance: numberOrNull(item.remainingBalance ?? item.balanceRemaining) ?? (claimAmount !== null && paidAmount !== null ? claimAmount - paidAmount : null),
    filingPackageId: numberOrNull(item.filingPackageId),
    filingStatus: stringOrNull(item.filingStatus),
    receiptStatus: stringOrNull(item.receiptStatus),
    documents: normalizeDocuments(item.documents ?? item.claimDocuments),
    payments: normalizePayments(item.payments ?? item.claimPayments),
    workflowEvents: normalizeWorkflowEvents(item.workflowEvents ?? item.timeline ?? item.events)
  };
};

function normalizeDocuments(value: unknown): ClaimDocument[] {
  return extractArray(value).map((entry) => {
    const item = objectOrEmpty(entry);
    return {
      id: Number(item.id ?? item.documentId ?? 0),
      name: stringOrNull(item.name ?? item.fileName ?? item.documentName),
      documentType: stringOrNull(item.documentType ?? item.type),
      status: stringOrNull(item.status),
      version: stringOrNull(item.version ?? item.versionNumber),
      generatedBy: stringOrNull(item.generatedBy ?? item.uploadedBy),
      generatedOnUtc: stringOrNull(item.generatedOnUtc ?? item.uploadedOnUtc ?? item.createdOnUtc)
    };
  });
}

function normalizePayments(value: unknown): ClaimPayment[] {
  return extractArray(value).map((entry) => {
    const item = objectOrEmpty(entry);
    return {
      id: Number(item.id ?? item.paymentId ?? 0),
      amount: numberOrNull(item.amount ?? item.paymentAmount),
      paymentDate: stringOrNull(item.paymentDate ?? item.paidOnUtc),
      referenceNumber: stringOrNull(item.referenceNumber ?? item.checkNumber),
      sourceSystem: stringOrNull(item.sourceSystem),
      status: stringOrNull(item.status ?? item.mappingStatus)
    };
  });
}

function normalizeWorkflowEvents(value: unknown): ClaimWorkflowEvent[] {
  return extractArray(value).map((entry, index) => {
    const item = objectOrEmpty(entry);
    return {
      id: Number(item.id ?? item.timelineEventId ?? index + 1),
      title: stringOrNull(item.title ?? item.eventName ?? item.eventType) ?? `Workflow Event ${index + 1}`,
      description: stringOrNull(item.description ?? item.notes),
      eventUtc: stringOrNull(item.eventUtc ?? item.createdOnUtc),
      status: stringOrNull(item.status)
    };
  });
}


function normalizeClaimAmendment(entry: unknown): ClaimAmendment {
  const item = objectOrEmpty(entry);
  return {
    id: Number(item.id ?? item.amendmentId ?? 0),
    amendmentId: Number(item.amendmentId ?? item.id ?? 0),
    claimId: numberOrNull(item.claimId),
    newClaimAmount: numberOrNull(item.newClaimAmount ?? item.amount),
    reason: stringOrNull(item.reason),
    status: stringOrNull(item.status),
    createdBy: stringOrNull(item.createdBy),
    createdOnUtc: stringOrNull(item.createdOnUtc ?? item.createdDate),
    filedOnUtc: stringOrNull(item.filedOnUtc ?? item.filedDate)
  };
}

function normalizeClaimObjection(entry: unknown): ClaimObjection {
  const item = objectOrEmpty(entry);
  return {
    id: Number(item.id ?? item.objectionId ?? 0),
    objectionId: Number(item.objectionId ?? item.id ?? 0),
    claimId: numberOrNull(item.claimId),
    objectionType: stringOrNull(item.objectionType ?? item.type),
    objectionReason: stringOrNull(item.objectionReason ?? item.reason),
    responseDueDate: stringOrNull(item.responseDueDate),
    status: stringOrNull(item.status),
    createdBy: stringOrNull(item.createdBy),
    createdOnUtc: stringOrNull(item.createdOnUtc ?? item.createdDate),
    respondedOnUtc: stringOrNull(item.respondedOnUtc ?? item.responseDate),
    resolution: stringOrNull(item.resolution)
  };
}

function normalizeClaimTransfer(entry: unknown): ClaimTransfer {
  const item = objectOrEmpty(entry);
  return {
    id: Number(item.id ?? item.transferId ?? 0),
    transferId: Number(item.transferId ?? item.id ?? 0),
    claimId: numberOrNull(item.claimId),
    fromCreditor: stringOrNull(item.fromCreditor),
    toCreditor: stringOrNull(item.toCreditor),
    effectiveDate: stringOrNull(item.effectiveDate),
    status: stringOrNull(item.status),
    createdBy: stringOrNull(item.createdBy),
    createdOnUtc: stringOrNull(item.createdOnUtc ?? item.createdDate),
    filedOnUtc: stringOrNull(item.filedOnUtc ?? item.filedDate),
    acceptedOnUtc: stringOrNull(item.acceptedOnUtc ?? item.acceptedDate)
  };
}

function boolOrNull(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => String(entry)).filter((entry) => entry.trim().length > 0);
}

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const payload = objectOrEmpty(value);
  const candidates = payload.items ?? payload.data ?? payload.results ?? payload.records;
  return Array.isArray(candidates) ? candidates : [];
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const result = String(value).trim();
  return result.length > 0 ? result : null;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
