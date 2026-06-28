import type { PagedResult } from '@/shared/api/pagination';

export type { PagedResult };

export type PlacementQueueRequest = {
  page: number;
  pageSize: number;
  search?: string;
  queueStatus?: number;
  matchStatus?: number;
  clientId?: number;
  courtId?: number;
  filerUserId?: string;
};

export type PlacementAccountSearchRequest = PlacementQueueRequest;

export type MovePlacementQueueRequest = {
  placementAccountId: number;
  toQueueStatus: number;
  reason?: string | null;
  changedBy?: string | null;
};

export type PlacementAccount = {
  id: number;
  placementAccountId?: number | null;
  accountId?: number | null;
  accountNumber?: string | null;
  clientName?: string | null;
  portfolioName?: string | null;
  debtorName?: string | null;
  contactName?: string | null;
  bankruptcyCaseId?: number | null;
  bankruptcyCaseNumber?: string | null;
  bankruptcyCourt?: string | null;
  bankruptcyChapter?: string | null;
  matchStatus?: string | null;
  matchStatusCode?: number | null;
  queueStatus?: string | null;
  queueStatusCode?: number | null;
  placementStatus?: string | null;
  claimStatus?: string | null;
  last4Ssn?: string | null;
  balance?: number | null;
  claimAmount?: number | null;
  placedOnUtc?: string | null;
  updatedOnUtc?: string | null;
  filerUserId?: string | null;
  reviewerUserId?: string | null;
};

export type PlacementDashboard = {
  readyToMatch: number;
  pendingMatchReview: number;
  legalReview: number;
  readyForPoc: number;
  readyToFile: number;
  exceptions: number;
  completedToday: number;
  totalOpen: number;
};

export type PlacementAccountDetail = PlacementAccount & {
  courtName?: string | null;
  trusteeName?: string | null;
  attorneyName?: string | null;
  filingDistrict?: string | null;
  filingDivision?: string | null;
  barDate?: string | null;
  accountOpenDate?: string | null;
  lastPaymentDate?: string | null;
  chargeOffDate?: string | null;
  principalAmount?: number | null;
  interestAmount?: number | null;
  feesAmount?: number | null;
  expensesAmount?: number | null;
  flags?: PlacementReviewFlag[];
  matches?: PlacementBankruptcyMatch[];
};

export type PlacementReviewFlag = {
  id: number;
  flagCode?: string | null;
  flagDescription?: string | null;
  status?: string | null;
  createdBy?: string | null;
  createdOnUtc?: string | null;
};


export type MatchEvidenceStatus = 'matched' | 'partial' | 'conflict' | 'missing' | 'unknown';

export type MatchEvidence = {
  key: string;
  label: string;
  status: MatchEvidenceStatus;
  score?: number | null;
  accountValue?: string | null;
  candidateValue?: string | null;
  notes?: string | null;
};

export type PlacementBankruptcyMatch = {
  id: number;
  placementBankruptcyMatchId?: number | null;
  bankruptcyCaseId?: number | null;
  caseNumber?: string | null;
  score?: number | null;
  confidence?: 'High' | 'Medium' | 'Low' | 'Unknown';
  decision?: string | null;
  courtName?: string | null;
  chapter?: string | null;
  filingDate?: string | null;
  debtorName?: string | null;
  debtorLast4?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  attorneyName?: string | null;
  trusteeName?: string | null;
  evidence?: MatchEvidence[];
};

export type RunPlacementMatchingRequest = {
  placementAccountId: number;
  requestedBy?: string | null;
};

export type SelectPlacementMatchRequest = {
  placementAccountId: number;
  placementBankruptcyMatchId: number;
  selectedBy?: string | null;
};

export type AddPlacementFlagRequest = {
  placementAccountId: number;
  flagCode: string;
  flagDescription?: string | null;
  createdBy?: string | null;
};

export type DecideLegalReviewRequest = {
  placementAccountId: number;
  approved: boolean;
  reviewerUserId?: string | null;
  notes?: string | null;
};

export type ResolvePlacementReviewFlagRequest = {
  placementReviewFlagId: number;
  resolutionReason?: string | null;
  resolvedBy?: string | null;
};


export type FilingAssignmentRequest = {
  placementAccountId: number;
  courtId?: number | null;
  district?: string | null;
  division?: string | null;
  attorneyContactId?: number | null;
  signatoryUserId?: string | null;
  filerUserId?: string | null;
  assignedBy?: string | null;
};

export type PlacementFilingPage = {
  placementAccountId: number;
  accountNumber?: string | null;
  courtName?: string | null;
  courtWebsiteUrl?: string | null;
  ecfFilingUrl?: string | null;
  pacerUrl?: string | null;
  bankruptcyCaseNumber?: string | null;
  courtClaimNumber?: string | null;
  trackingNumber?: string | null;
  filingStatus?: string | null;
  pocDocumentId?: number | null;
  courtReceiptId?: number | null;
  lastUpdatedUtc?: string | null;
};

export type GeneratePlacementDocumentRequest = {
  placementAccountId: number;
  templateType?: string | null;
  generatedBy?: string | null;
};

export type UploadPlacementPocDocumentRequest = {
  placementAccountId: number;
  file: File;
  generatedBy?: string | null;
};

export type UploadPlacementCourtReceiptRequest = {
  placementAccountId: number;
  file: File;
  uploadedBy?: string | null;
};

export type SubmitPlacementFilingRequest = {
  placementAccountId: number;
  courtClaimNumber?: string | null;
  pocDocumentId: number;
  courtReceiptId: number;
  submittedBy?: string | null;
};
