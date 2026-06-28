export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ClaimSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  accountId?: number;
  bankruptcyCaseId?: number;
  status?: number;
};

export type ClaimQueueItem = {
  id: number;
  claimId: number;
  accountId: number | null;
  accountNumber: string | null;
  bankruptcyCaseId: number | null;
  bankruptcyCaseNumber: string | null;
  debtorName: string | null;
  courtName: string | null;
  trusteeName: string | null;
  claimAmount: number | null;
  barDate: string | null;
  filedOnUtc: string | null;
  status: string | null;
  statusCode: number | null;
  courtClaimNumber: string | null;
  attorneyName: string | null;
  createdOnUtc: string | null;
};

export type ClaimDetail = ClaimQueueItem & {
  debtorLast4: string | null;
  trusteeId: number | null;
  principalAmount: number | null;
  paidAmount: number | null;
  remainingBalance: number | null;
  filingPackageId: number | null;
  filingStatus: string | null;
  receiptStatus: string | null;
  documents: ClaimDocument[];
  payments: ClaimPayment[];
  workflowEvents: ClaimWorkflowEvent[];
};

export type ClaimDocument = {
  id: number;
  name: string | null;
  documentType: string | null;
  status: string | null;
  version: string | null;
  generatedBy: string | null;
  generatedOnUtc: string | null;
};

export type ClaimPayment = {
  id: number;
  amount: number | null;
  paymentDate: string | null;
  referenceNumber: string | null;
  sourceSystem: string | null;
  status: string | null;
};

export type ClaimWorkflowEvent = {
  id: number;
  title: string;
  description: string | null;
  eventUtc: string | null;
  status: string | null;
};

export type CreateClaimRequest = {
  accountId: number;
  bankruptcyCaseId: number;
  bankruptcyCaseNumber?: string | null;
  trusteeId?: number | null;
  debtorSsn?: string | null;
  debtorLast4?: string | null;
  claimAmount: number;
  barDate?: string | null;
  createdBy?: string | null;
};

export type PrepareFilingPackageRequest = {
  claimId: number;
  requestedBy?: string | null;
  forceRegenerate: boolean;
  generatePdf: boolean;
};

export type RegisterFilingRequest = {
  claimId: number;
  filingPackageId?: number | null;
  filedBy?: string | null;
  filedOnUtc?: string | null;
  trackingNumber?: string | null;
  courtClaimNumber?: string | null;
  notes?: string | null;
  registeredBy?: string | null;
  force: boolean;
};

export type ProcessReceiptRequest = {
  claimId: number;
  filingRegistrationId?: number | null;
  receiptDocumentId: number;
  courtReceiptNumber?: string | null;
  receiptDateUtc?: string | null;
  receivedBy?: string | null;
  notes?: string | null;
  validateImmediately: boolean;
  force: boolean;
};

export type AddClaimPaymentRequest = {
  claimId: number;
  amount: number;
  paymentDate: string;
  referenceNumber?: string | null;
  createdBy?: string | null;
};

export type AdvanceClaimStatusRequest = {
  claimId: number;
  toStatus: number;
  reason?: string | null;
  changedBy?: string | null;
};


export type ClaimEligibilityRequest = {
  accountId: number;
  placementAccountId?: number;
  bankruptcyCaseId?: number;
  claimAmount?: number;
  barDate?: string | null;
  requestedBy?: string | null;
};

export type ClaimEligibilityResult = {
  eligible: boolean | null;
  decision: string | null;
  reason: string | null;
  warnings: string[];
  missingRequirements: string[];
};

export type AssignAttorneyRequest = {
  claimId: number;
  assignedBy?: string | null;
  forceReassign: boolean;
};

export type PostClaimPaymentRequest = {
  claimId: number;
  amount: number;
  paymentDate: string;
  referenceNumber?: string | null;
  postedBy?: string | null;
  sourceSystem?: string | null;
  sourcePaymentId?: string | null;
  externalReference?: string | null;
  allowOverpayment: boolean;
};

export type ProcessBankruptcyEventRequest = {
  claimId?: number | null;
  bankruptcyCaseId?: number | null;
  bankruptcyEventType?: string | null;
  eventDateUtc?: string | null;
  source?: string | null;
  sourceReference?: string | null;
  processedBy?: string | null;
  notes?: string | null;
  force: boolean;
};

export type CreateClaimAmendmentRequest = {
  claimId: number;
  newClaimAmount: number;
  reason?: string | null;
  createdBy?: string | null;
};

export type ClaimAmendment = {
  id: number;
  amendmentId: number;
  claimId: number | null;
  newClaimAmount: number | null;
  reason: string | null;
  status: string | null;
  createdBy: string | null;
  createdOnUtc: string | null;
  filedOnUtc: string | null;
};

export type CreateClaimObjectionRequest = {
  claimId: number;
  objectionType?: string | null;
  objectionReason?: string | null;
  responseDueDate?: string | null;
  createdBy?: string | null;
};

export type ClaimObjection = {
  id: number;
  objectionId: number;
  claimId: number | null;
  objectionType: string | null;
  objectionReason: string | null;
  responseDueDate: string | null;
  status: string | null;
  createdBy: string | null;
  createdOnUtc: string | null;
  respondedOnUtc: string | null;
  resolution: string | null;
};

export type ResolveClaimObjectionRequest = {
  objectionId: number;
  resolution?: string | null;
};

export type CreateClaimTransferRequest = {
  claimId: number;
  fromCreditor?: string | null;
  toCreditor?: string | null;
  effectiveDate: string;
  createdBy?: string | null;
};

export type ClaimTransfer = {
  id: number;
  transferId: number;
  claimId: number | null;
  fromCreditor: string | null;
  toCreditor: string | null;
  effectiveDate: string | null;
  status: string | null;
  createdBy: string | null;
  createdOnUtc: string | null;
  filedOnUtc: string | null;
  acceptedOnUtc: string | null;
};
