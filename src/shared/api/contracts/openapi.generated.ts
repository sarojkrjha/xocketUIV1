/* eslint-disable */
// Auto-generated from endpoint.json. Do not hand-edit business DTOs here.
// Regenerate this file when backend OpenAPI changes.

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type AddClaimPaymentCommand = {
  claimId?: number;
  amount?: number;
  paymentDate?: string;
  referenceNumber?: string | null;
  createdBy?: string | null;
};

export type AddPlacementReviewFlagCommand = {
  placementAccountId?: number;
  flagCode?: string | null;
  flagDescription?: string | null;
  createdBy?: string | null;
};

export type AdvanceClaimStatusCommand = {
  claimId?: number;
  toStatus?: number;
  reason?: string | null;
  changedBy?: string | null;
};

export type AdvanceDocumentStatusRequest = {
  toStatus?: number;
  reason?: string | null;
  changedBy?: string | null;
  description?: string | null;
};

export type AssignAttorneyCommand = {
  claimId?: number;
  assignedBy?: string | null;
  forceReassign?: boolean;
};

export type AssignContactToAccountCommand = {
  accountId?: number;
  contactId?: number;
  relationshipType?: number;
  isPrimary?: boolean;
  isActive?: boolean;
};

export type AssignFilingCommand = {
  placementAccountId?: number;
  courtId?: number | null;
  district?: string | null;
  division?: string | null;
  attorneyContactId?: number | null;
  signatoryUserId?: string | null;
  filerUserId?: string | null;
  assignedBy?: string | null;
};

export type AuthTokenRequest = {
  username?: string | null;
  password?: string | null;
};

export type CompleteTaskCommand = {
  taskId?: number;
  completedByUserId?: string | null;
};

export type ConvertMonitorReportItemToPlacementCommand = {
  reportItemId?: number;
  claimAmount?: number;
  accountOpenDate?: string;
  convertedBy?: string | null;
};

export type CreateAccountCommand = {
  clientId?: number;
  portfolioId?: number;
  accountNumber?: string | null;
  currentBalance?: number | null;
  placementDate?: string | null;
  status?: number;
  primaryContact?: CreateAccountContactRequest;
};

export type CreateAccountContactRequest = {
  contactType?: number;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  companyName?: string | null;
  last4?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  stateCode?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type CreateClaimAmendmentCommand = {
  claimId?: number;
  newClaimAmount?: number;
  reason?: string | null;
  createdBy?: string | null;
};

export type CreateClaimCommand = {
  accountId?: number;
  bankruptcyCaseId?: number;
  bankruptcyCaseNumber?: string | null;
  trusteeId?: number | null;
  debtorSsn?: string | null;
  debtorLast4?: string | null;
  claimAmount?: number;
  barDate?: string | null;
  createdBy?: string | null;
};

export type CreateClaimObjectionCommand = {
  claimId?: number;
  objectionType?: string | null;
  objectionReason?: string | null;
  responseDueDate?: string | null;
  createdBy?: string | null;
};

export type CreateClaimTransferCommand = {
  claimId?: number;
  fromCreditor?: string | null;
  toCreditor?: string | null;
  effectiveDate?: string;
  createdBy?: string | null;
};

export type CreateClientCommand = {
  code?: string | null;
  name?: string | null;
};

export type CreateManualPlacementAccountCommand = {
  clientId?: number;
  accountId?: number;
  accountNumber?: string | null;
  claimAmount?: number;
  principalAmount?: number | null;
  interestAmount?: number | null;
  feesAmount?: number | null;
  expensesAmount?: number | null;
  accountOpenDate?: string;
  lastPaymentDate?: string | null;
  chargeOffDate?: string | null;
  createdBy?: string | null;
};

export type CreateNdcImportScheduleCommand = {
  trusteeId?: string | null;
  checkNumber?: string | null;
  paymentDate?: string | null;
  searchAllTime?: boolean;
  frequency?: string | null;
};

export type CreatePortfolioCommand = {
  clientId?: number;
  portfolioNumber?: string | null;
  portfolioName?: string | null;
  portfolioType?: number;
};

export type CreateReportedBankruptcyCommand = {
  scrubMatchId?: number;
  createdBy?: string | null;
};

export type CreateScrubInventoryCommand = {
  clientId?: number;
  inventoryName?: string | null;
  sourceSystem?: string | null;
};

export type CreateScrubScheduleCommand = {
  inventoryId?: number;
  frequency?: string | null;
  nextRunUtc?: string;
};

export type CreateTaskCommand = {
  title?: string | null;
  description?: string | null;
  priority?: number;
  dueUtc?: string | null;
  assignedToUserId?: string | null;
  createdByUserId?: string | null;
  referenceType?: string | null;
  referenceId?: number;
};

export type CreateTimelineEventCommand = {
  eventType?: string | null;
  title?: string | null;
  description?: string | null;
  createdByUserId?: string | null;
  eventUtc?: string | null;
  referenceType?: string | null;
  referenceId?: number;
};

export type CreateUserCommand = {
  externalIdentityId?: string | null;
  email?: string | null;
  displayName?: string | null;
};

export type CreateWorkflowQueueCommand = {
  code?: string | null;
  name?: string | null;
  module?: string | null;
  description?: string | null;
};

export type DecideLegalReviewCommand = {
  placementAccountId?: number;
  approved?: boolean;
  reviewerUserId?: string | null;
  notes?: string | null;
};

export type DemoBankruptcyImportRequest = {
  courtFilePath?: string | null;
  trusteeFilePath?: string | null;
  attorneyFilePath?: string | null;
  bankruptcyFilePath?: string | null;
  debtorFilePath?: string | null;
  debtorAddressFilePath?: string | null;
};

export type GenerateBankruptcyMonitorReportCommand = {
  monitorRunId?: number;
  clientId?: number;
  portfolioId?: number | null;
  createdBy?: string | null;
};

export type GenerateDocumentRequest = {
  documentType?: string | null;
  referenceType?: string | null;
  referenceId?: number;
  generatedBy?: string | null;
  templateType?: string | null;
  fileName?: string | null;
  generatePdf?: boolean;
  additionalFields?: Record<string, string> | null;
  requiredFields?: string[] | null;
};

export type GeneratePlacementDocumentCommand = {
  placementAccountId?: number;
  templateType?: string | null;
  generatedBy?: string | null;
};

export type ImportNdcPaymentsCommand = {
  trusteeId?: string | null;
  checkNumber?: string | null;
  paymentDate?: string | null;
  searchAllTime?: boolean;
  triggeredBy?: string | null;
};

export type MarkBankruptcyMonitorReportDeliveredCommand = {
  reportId?: number;
  deliveredBy?: string | null;
};

export type MovePlacementQueueCommand = {
  placementAccountId?: number;
  toQueueStatus?: number;
  reason?: string | null;
  changedBy?: string | null;
};

export type PostClaimPaymentCommand = {
  claimId?: number;
  amount?: number;
  paymentDate?: string;
  referenceNumber?: string | null;
  postedBy?: string | null;
  sourceSystem?: string | null;
  sourcePaymentId?: string | null;
  externalReference?: string | null;
  allowOverpayment?: boolean;
};

export type PrepareFilingPackageCommand = {
  claimId?: number;
  requestedBy?: string | null;
  forceRegenerate?: boolean;
  generatePdf?: boolean;
};

export type ProcessBankruptcyEventCommand = {
  claimId?: number | null;
  bankruptcyCaseId?: number | null;
  bankruptcyEventType?: string | null;
  eventDateUtc?: string | null;
  source?: string | null;
  sourceReference?: string | null;
  processedBy?: string | null;
  notes?: string | null;
  force?: boolean;
};

export type ProcessReceiptCommand = {
  claimId?: number;
  filingRegistrationId?: number | null;
  receiptDocumentId?: number;
  courtReceiptNumber?: string | null;
  receiptDateUtc?: string | null;
  receivedBy?: string | null;
  notes?: string | null;
  validateImmediately?: boolean;
  force?: boolean;
};

export type RebuildAccountSearchIndexCommand = {
  accountId?: number | null;
  clientId?: number | null;
  portfolioId?: number | null;
  rebuildAll?: boolean;
};

export type RegisterFilingCommand = {
  claimId?: number;
  filingPackageId?: number | null;
  filedBy?: string | null;
  filedOnUtc?: string | null;
  trackingNumber?: string | null;
  courtClaimNumber?: string | null;
  notes?: string | null;
  registeredBy?: string | null;
  force?: boolean;
};

export type ResolveClaimObjectionCommand = {
  objectionId?: number;
  resolution?: string | null;
};

export type ResolvePlacementReviewFlagCommand = {
  placementReviewFlagId?: number;
  resolutionReason?: string | null;
  resolvedBy?: string | null;
};

export type ResolveReportedBankruptcyCommand = {
  reportedBankruptcyId?: number;
  resolvedBy?: string | null;
  notes?: string | null;
};

export type RunBankruptcyMonitoringCommand = {
  clientId?: number | null;
  portfolioId?: number | null;
  runType?: string | null;
  triggeredBy?: string | null;
};

export type RunPlacementBankruptcyMatchingRequest = {
  requestedBy?: string | null;
};

export type SelectBankruptcyMatchCommand = {
  placementAccountId?: number;
  placementBankruptcyMatchId?: number;
  selectedBy?: string | null;
};

export type SubmitFilingCommand = {
  placementAccountId?: number;
  courtClaimNumber?: string | null;
  pocDocumentId?: number;
  courtReceiptId?: number;
  submittedBy?: string | null;
};

export type UpdateAccountBankruptcyCommand = {
  accountId?: number;
  activeBankruptcyCaseId?: number | null;
  bankruptcyCaseNumber?: string | null;
  bankruptcyStatus?: number | null;
  filingDate?: string | null;
  courtId?: number | null;
  courtName?: string | null;
};

export type UpdateAccountCommand = {
  accountId?: number;
  clientId?: number;
  portfolioId?: number;
  primaryAccountNumber?: string | null;
  currentBalance?: number | null;
  placementDate?: string | null;
  status?: number;
  isActive?: boolean;
};

export type UpdateContactCommand = {
  contactId?: number;
  contactType?: number;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  companyName?: string | null;
  isActive?: boolean;
};

export type UpdateCourtFilingUrlsCommand = {
  courtId?: number;
  websiteUrl?: string | null;
  ecfFilingUrl?: string | null;
  pacerUrl?: string | null;
};

export type UpdateTaskCommand = {
  taskId?: number;
  title?: string | null;
  description?: string | null;
  priority?: number;
  dueUtc?: string | null;
  assignedToUserId?: string | null;
};

export type UpsertContactAddressCommand = {
  contactId?: number;
  addressId?: number | null;
  addressType?: number;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  stateCode?: string | null;
  postalCode?: string | null;
  postalCode4?: string | null;
  isPrimary?: boolean;
  isActive?: boolean;
};

export type UpsertContactEmailCommand = {
  contactId?: number;
  emailId?: number | null;
  emailType?: number;
  email?: string | null;
  isPrimary?: boolean;
  isActive?: boolean;
};

export type UpsertContactIdentifierCommand = {
  contactId?: number;
  identifierId?: number | null;
  identifierType?: number;
  identifierValue?: string | null;
  last4?: string | null;
  sourceSystem?: string | null;
  isActive?: boolean;
};

export type UpsertContactPhoneCommand = {
  contactId?: number;
  phoneId?: number | null;
  phoneType?: number;
  phoneNumber?: string | null;
  isPrimary?: boolean;
  isActive?: boolean;
};

export type UpsertSystemSettingCommand = {
  key?: string | null;
  value?: string | null;
  description?: string | null;
};

export type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

export type ApiOperation = { method: HttpMethod; path: string; query?: Record<string, unknown>; pathParams?: Record<string, string | number>; body?: unknown };

export type ApiPaths = {
  "/api/v1/accounts/search": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      clientId?: number;
      portfolioId?: number;
      status?: number;
      accountNumber?: string;
      contactName?: string;
      last4?: string;
      phone?: string;
      email?: string;
      bankruptcyCaseNumber?: string;
      stateCode?: string;
      courtId?: number;
      courtName?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/accounts/search-index/rebuild": {
    post: {
      query: never;
      pathParams: never;
      body: RebuildAccountSearchIndexCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts/{accountId}": {
    get: {
      query: never;
      pathParams: {
      accountId: number;
    };
      body: never;
      response: unknown;
    };
    put: {
      query: never;
      pathParams: {
      accountId: number;
    };
      body: UpdateAccountCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts/contacts": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      contactType?: number;
      last4?: string;
      phone?: string;
      email?: string;
      stateCode?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/accounts/contacts/{contactId}": {
    get: {
      query: never;
      pathParams: {
      contactId: number;
    };
      body: never;
      response: unknown;
    };
    put: {
      query: never;
      pathParams: {
      contactId: number;
    };
      body: UpdateContactCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts/contacts/{contactId}/address": {
    put: {
      query: never;
      pathParams: {
      contactId: number;
    };
      body: UpsertContactAddressCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts/contacts/{contactId}/phone": {
    put: {
      query: never;
      pathParams: {
      contactId: number;
    };
      body: UpsertContactPhoneCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts/contacts/{contactId}/email": {
    put: {
      query: never;
      pathParams: {
      contactId: number;
    };
      body: UpsertContactEmailCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts/contacts/{contactId}/identifier": {
    put: {
      query: never;
      pathParams: {
      contactId: number;
    };
      body: UpsertContactIdentifierCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts": {
    post: {
      query: never;
      pathParams: never;
      body: CreateAccountCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts/{accountId}/contacts": {
    put: {
      query: never;
      pathParams: {
      accountId: number;
    };
      body: AssignContactToAccountCommand;
      response: unknown;
    };
  };
  "/api/v1/accounts/{accountId}/contacts/{contactId}": {
    delete: {
      query: never;
      pathParams: {
      accountId: number;
      contactId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/accounts/{accountId}/bankruptcy": {
    put: {
      query: never;
      pathParams: {
      accountId: number;
    };
      body: UpdateAccountBankruptcyCommand;
      response: unknown;
    };
  };
  "/api/v1/admin/clients": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
    post: {
      query: never;
      pathParams: never;
      body: CreateClientCommand;
      response: unknown;
    };
  };
  "/api/v1/admin/portfolios": {
    get: {
      query: {
      clientId?: number;
      page?: number;
      pageSize?: number;
      search?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
    post: {
      query: never;
      pathParams: never;
      body: CreatePortfolioCommand;
      response: unknown;
    };
  };
  "/api/v1/admin/system-settings": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
    put: {
      query: never;
      pathParams: never;
      body: UpsertSystemSettingCommand;
      response: unknown;
    };
  };
  "/api/v1/admin/workflow-queues": {
    get: {
      query: {
      module?: string;
      page?: number;
      pageSize?: number;
      search?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
    post: {
      query: never;
      pathParams: never;
      body: CreateWorkflowQueueCommand;
      response: unknown;
    };
  };
  "/api/v1/auth/token": {
    post: {
      query: never;
      pathParams: never;
      body: AuthTokenRequest;
      response: unknown;
    };
  };
  "/api/v1/auth/me": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/cases": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      chapter?: string;
      filingDateFrom?: string;
      filingDateTo?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/courts": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      stateCode?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/courts/{courtId}/filing-urls": {
    put: {
      query: never;
      pathParams: {
      courtId: number;
    };
      body: UpdateCourtFilingUrlsCommand;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/trustees": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      stateCode?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/attorneys": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      stateCode?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/import-batches": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      sourceSystem?: string;
      status?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/import-errors": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      sourceSystem?: string;
      entityName?: string;
      fileName?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/import-runs": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      sourceSystem?: string;
      sourceMode?: string;
      status?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/import-runs/{importRunId}": {
    get: {
      query: never;
      pathParams: {
      importRunId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy/g2-import/dashboard": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/run": {
    post: {
      query: never;
      pathParams: never;
      body: RunBankruptcyMonitoringCommand;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/runs": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      status?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/runs/{runId}": {
    get: {
      query: never;
      pathParams: {
      runId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/runs/{runId}/reports": {
    post: {
      query: never;
      pathParams: {
      runId: number;
    };
      body: GenerateBankruptcyMonitorReportCommand;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/reports/{reportId}": {
    get: {
      query: never;
      pathParams: {
      reportId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/reports/{reportId}/export": {
    get: {
      query: never;
      pathParams: {
      reportId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/report-items/{reportItemId}/approve": {
    put: {
      query: never;
      pathParams: {
      reportItemId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/report-items/{reportItemId}/reject": {
    put: {
      query: never;
      pathParams: {
      reportItemId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/report-items/{reportItemId}/convert-to-placement": {
    post: {
      query: never;
      pathParams: {
      reportItemId: number;
    };
      body: ConvertMonitorReportItemToPlacementCommand;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/reports/{reportId}/delivered": {
    put: {
      query: never;
      pathParams: {
      reportId: number;
    };
      body: MarkBankruptcyMonitorReportDeliveredCommand;
      response: unknown;
    };
  };
  "/api/v1/bankruptcy-monitoring/dashboard": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/eligibility": {
    get: {
      query: {
      accountId: number;
      placementAccountId?: number;
      bankruptcyCaseId?: number;
      claimAmount?: number;
      barDate?: string;
      requestedBy?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims": {
    post: {
      query: never;
      pathParams: never;
      body: CreateClaimCommand;
      response: unknown;
    };
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      accountId?: number;
      bankruptcyCaseId?: number;
      status?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}": {
    get: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/payments": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: AddClaimPaymentCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/payments/post": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: PostClaimPaymentCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/status": {
    put: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: AdvanceClaimStatusCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/attorney-assignment": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: AssignAttorneyCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/filing-package": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: PrepareFilingPackageCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/register-filing": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: RegisterFilingCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/bankruptcy-events": {
    post: {
      query: never;
      pathParams: never;
      body: ProcessBankruptcyEventCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/receipt": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: ProcessReceiptCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/amendments": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: CreateClaimAmendmentCommand;
      response: unknown;
    };
    get: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/amendments/{amendmentId}/filed": {
    put: {
      query: never;
      pathParams: {
      amendmentId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/objections": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: CreateClaimObjectionCommand;
      response: unknown;
    };
    get: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/objections/{objectionId}/responded": {
    put: {
      query: never;
      pathParams: {
      objectionId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/objections/{objectionId}/resolve": {
    put: {
      query: never;
      pathParams: {
      objectionId: number;
    };
      body: ResolveClaimObjectionCommand;
      response: unknown;
    };
  };
  "/api/v1/claims/{claimId}/transfers": {
    post: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: CreateClaimTransferCommand;
      response: unknown;
    };
    get: {
      query: never;
      pathParams: {
      claimId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/transfers/{transferId}/filed": {
    put: {
      query: never;
      pathParams: {
      transferId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/claims/transfers/{transferId}/accepted": {
    put: {
      query: never;
      pathParams: {
      transferId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/dev/accounts-import/upload-demo-csv": {
    post: {
      query: never;
      pathParams: never;
      body: {
  accountFile: string;
  contactFile: string;
  activeBankruptcyFile: string;
  contactOIBankruptcyFile: string;
};
      response: unknown;
    };
  };
  "/api/v1/dev/bankruptcy-import/demo-csv": {
    post: {
      query: never;
      pathParams: never;
      body: DemoBankruptcyImportRequest;
      response: unknown;
    };
  };
  "/api/v1/dev/bankruptcy-import/upload-demo-csv": {
    post: {
      query: never;
      pathParams: never;
      body: {
  courtFile: string;
  trusteeFile: string;
  attorneyFile: string;
  bankruptcyFile: string;
  debtorFile: string;
  debtorAddressFile: string;
};
      response: unknown;
    };
  };
  "/api/v1/documents/generate": {
    post: {
      query: never;
      pathParams: never;
      body: GenerateDocumentRequest;
      response: unknown;
    };
  };
  "/api/v1/documents/upload": {
    post: {
      query: {
      documentType: string;
      referenceType: string;
      referenceId: number;
      uploadedBy: string;
    };
      pathParams: never;
      body: {
  file: string;
};
      response: unknown;
    };
  };
  "/api/v1/documents/{documentId}/versions": {
    post: {
      query: {
      uploadedBy: string;
    };
      pathParams: {
      documentId: number;
    };
      body: {
  file: string;
};
      response: unknown;
    };
    get: {
      query: never;
      pathParams: {
      documentId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/documents/{documentId}/status": {
    put: {
      query: never;
      pathParams: {
      documentId: number;
    };
      body: AdvanceDocumentStatusRequest;
      response: unknown;
    };
  };
  "/api/v1/documents/{documentId}/versions/{versionId}/download": {
    get: {
      query: never;
      pathParams: {
      documentId: number;
      versionId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/documents": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      referenceType?: string;
      referenceId?: number;
      documentType?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/file-ingestion/runs/{ingestionRunId}": {
    get: {
      query: never;
      pathParams: {
      ingestionRunId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/g2-import/run": {
    post: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/matching/placement-accounts/{placementAccountId}/bankruptcy-candidates": {
    post: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: RunPlacementBankruptcyMatchingRequest;
      response: unknown;
    };
  };
  "/api/v1/ndc/payments/import": {
    post: {
      query: never;
      pathParams: never;
      body: ImportNdcPaymentsCommand;
      response: unknown;
    };
  };
  "/api/v1/ndc/import-runs": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      trusteeId?: string;
      status?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/ndc/import-runs/{runId}": {
    get: {
      query: never;
      pathParams: {
      runId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/ndc/payments": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      importRunId?: number;
      trusteeId?: string;
      caseNumber?: string;
      claimNumber?: string;
      mappingStatus?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/ndc/schedules": {
    post: {
      query: never;
      pathParams: never;
      body: CreateNdcImportScheduleCommand;
      response: unknown;
    };
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      trusteeId?: string;
      isActive?: boolean;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/ndc/schedules/{scheduleId}/deactivate": {
    put: {
      query: never;
      pathParams: {
      scheduleId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/ndc/dashboard": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/placement/queue": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      queueStatus?: number;
      matchStatus?: number;
      clientId?: number;
      courtId?: number;
      filerUserId?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}": {
    get: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/queue": {
    put: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: MovePlacementQueueCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/flags/{placementReviewFlagId}/resolve": {
    put: {
      query: never;
      pathParams: {
      placementReviewFlagId: number;
    };
      body: ResolvePlacementReviewFlagCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/legal-review": {
    put: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: DecideLegalReviewCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/filing-assignment": {
    put: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: AssignFilingCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/matches/{placementBankruptcyMatchId}/select": {
    put: {
      query: never;
      pathParams: {
      placementAccountId: number;
      placementBankruptcyMatchId: number;
    };
      body: SelectBankruptcyMatchCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/flags": {
    post: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: AddPlacementReviewFlagCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/dashboard": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts": {
    post: {
      query: never;
      pathParams: never;
      body: CreateManualPlacementAccountCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/files": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      clientId?: number;
      status?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/placement/files/{placementFileId}": {
    get: {
      query: never;
      pathParams: {
      placementFileId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/filing-page": {
    get: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/court-receipts": {
    post: {
      query: {
      uploadedBy: string;
    };
      pathParams: {
      placementAccountId: number;
    };
      body: {
  file: string;
};
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/submit-filing": {
    post: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: SubmitFilingCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/poc-documents": {
    post: {
      query: {
      generatedBy: string;
    };
      pathParams: {
      placementAccountId: number;
    };
      body: {
  file: string;
};
      response: unknown;
    };
  };
  "/api/v1/placement/accounts/{placementAccountId}/documents/generate": {
    post: {
      query: never;
      pathParams: {
      placementAccountId: number;
    };
      body: GeneratePlacementDocumentCommand;
      response: unknown;
    };
  };
  "/api/v1/placement/import/upload": {
    post: {
      query: {
      clientId: number;
      uploadedBy: string;
    };
      pathParams: never;
      body: {
  file: string;
};
      response: unknown;
    };
  };
  "/api/v1/reports/snapshots": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      reportCode?: string;
      sourceModule?: string;
      status?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/snapshots/{snapshotId}": {
    get: {
      query: never;
      pathParams: {
      snapshotId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/snapshots/{snapshotId}/export": {
    get: {
      query: never;
      pathParams: {
      snapshotId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/snapshots/bankruptcy-monitoring/{reportId}": {
    post: {
      query: {
      createdBy: string;
    };
      pathParams: {
      reportId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/dashboard/operations": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/dashboard/placement": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/dashboard/claims": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/dashboard/ndc": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/dashboard/scrub": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/reports/dashboard/bankruptcy-monitoring": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/inventories": {
    post: {
      query: never;
      pathParams: never;
      body: CreateScrubInventoryCommand;
      response: unknown;
    };
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      clientId?: number;
      isActive?: boolean;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/inventories/{inventoryId}": {
    get: {
      query: never;
      pathParams: {
      inventoryId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/inventories/{inventoryId}/versions": {
    get: {
      query: never;
      pathParams: {
      inventoryId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/inventories/{inventoryId}/import": {
    post: {
      query: {
      uploadedBy: string;
    };
      pathParams: {
      inventoryId: number;
    };
      body: {
  file: string;
};
      response: unknown;
    };
  };
  "/api/v1/scrub/inventories/{inventoryId}/run": {
    post: {
      query: {
      triggeredBy: string;
    };
      pathParams: {
      inventoryId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/runs": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      inventoryId?: number;
      status?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/runs/{runId}": {
    get: {
      query: never;
      pathParams: {
      runId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/result-batches/{batchId}": {
    get: {
      query: never;
      pathParams: {
      batchId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/result-batches/{batchId}/export": {
    get: {
      query: {
      format?: string;
    };
      pathParams: {
      batchId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/result-batches/{batchId}/response": {
    post: {
      query: {
      generatedBy: string;
    };
      pathParams: {
      batchId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/reported-bankruptcies": {
    post: {
      query: never;
      pathParams: never;
      body: CreateReportedBankruptcyCommand;
      response: unknown;
    };
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      inventoryItemId?: number;
      bankruptcyCaseId?: number;
      status?: number;
      isOpen?: boolean;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/reported-bankruptcies/{reportedBankruptcyId}": {
    get: {
      query: never;
      pathParams: {
      reportedBankruptcyId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/reported-bankruptcies/{reportedBankruptcyId}/resolve": {
    put: {
      query: never;
      pathParams: {
      reportedBankruptcyId: number;
    };
      body: ResolveReportedBankruptcyCommand;
      response: unknown;
    };
  };
  "/api/v1/scrub/inventories/{inventoryId}/schedule": {
    post: {
      query: never;
      pathParams: {
      inventoryId: number;
    };
      body: CreateScrubScheduleCommand;
      response: unknown;
    };
  };
  "/api/v1/scrub/schedules": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      inventoryId?: number;
      isActive?: boolean;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/scrub/schedules/{scheduleId}/deactivate": {
    put: {
      query: never;
      pathParams: {
      scheduleId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/security/roles": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/security/permissions": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/security/users": {
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
    post: {
      query: never;
      pathParams: never;
      body: CreateUserCommand;
      response: unknown;
    };
  };
  "/api/v1/security/users/{userId}/roles/{roleId}": {
    post: {
      query: never;
      pathParams: {
      userId: number;
      roleId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/security/users/{userId}/clients/{clientId}": {
    post: {
      query: never;
      pathParams: {
      userId: number;
      clientId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/tasks": {
    post: {
      query: never;
      pathParams: never;
      body: CreateTaskCommand;
      response: unknown;
    };
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: number;
      priority?: number;
      assignedToUserId?: string;
      referenceType?: string;
      referenceId?: number;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/api/v1/tasks/{taskId}": {
    put: {
      query: never;
      pathParams: {
      taskId: number;
    };
      body: UpdateTaskCommand;
      response: unknown;
    };
  };
  "/api/v1/tasks/{taskId}/complete": {
    put: {
      query: never;
      pathParams: {
      taskId: number;
    };
      body: CompleteTaskCommand;
      response: unknown;
    };
  };
  "/api/v1/tasks/{taskId}/cancel": {
    put: {
      query: never;
      pathParams: {
      taskId: number;
    };
      body: never;
      response: unknown;
    };
  };
  "/api/v1/timeline": {
    post: {
      query: never;
      pathParams: never;
      body: CreateTimelineEventCommand;
      response: unknown;
    };
    get: {
      query: {
      page?: number;
      pageSize?: number;
      search?: string;
      referenceType?: string;
      referenceId?: number;
      eventType?: string;
    };
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
  "/health": {
    get: {
      query: never;
      pathParams: never;
      body: never;
      response: unknown;
    };
  };
};

export const ApiPath = {
  apiV1AccountsSearch: "/api/v1/accounts/search",
  apiV1AccountsSearchIndexRebuild: "/api/v1/accounts/search-index/rebuild",
  apiV1AccountsAccountId: "/api/v1/accounts/{accountId}",
  apiV1AccountsContacts: "/api/v1/accounts/contacts",
  apiV1AccountsContactsContactId: "/api/v1/accounts/contacts/{contactId}",
  apiV1AccountsContactsContactIdAddress: "/api/v1/accounts/contacts/{contactId}/address",
  apiV1AccountsContactsContactIdPhone: "/api/v1/accounts/contacts/{contactId}/phone",
  apiV1AccountsContactsContactIdEmail: "/api/v1/accounts/contacts/{contactId}/email",
  apiV1AccountsContactsContactIdIdentifier: "/api/v1/accounts/contacts/{contactId}/identifier",
  apiV1Accounts: "/api/v1/accounts",
  apiV1AccountsAccountIdContacts: "/api/v1/accounts/{accountId}/contacts",
  apiV1AccountsAccountIdContactsContactId: "/api/v1/accounts/{accountId}/contacts/{contactId}",
  apiV1AccountsAccountIdBankruptcy: "/api/v1/accounts/{accountId}/bankruptcy",
  apiV1AdminClients: "/api/v1/admin/clients",
  apiV1AdminPortfolios: "/api/v1/admin/portfolios",
  apiV1AdminSystemSettings: "/api/v1/admin/system-settings",
  apiV1AdminWorkflowQueues: "/api/v1/admin/workflow-queues",
  apiV1AuthToken: "/api/v1/auth/token",
  apiV1AuthMe: "/api/v1/auth/me",
  apiV1BankruptcyCases: "/api/v1/bankruptcy/cases",
  apiV1BankruptcyCourts: "/api/v1/bankruptcy/courts",
  apiV1BankruptcyCourtsCourtIdFilingUrls: "/api/v1/bankruptcy/courts/{courtId}/filing-urls",
  apiV1BankruptcyTrustees: "/api/v1/bankruptcy/trustees",
  apiV1BankruptcyAttorneys: "/api/v1/bankruptcy/attorneys",
  apiV1BankruptcyImportBatches: "/api/v1/bankruptcy/import-batches",
  apiV1BankruptcyImportErrors: "/api/v1/bankruptcy/import-errors",
  apiV1BankruptcyImportRuns: "/api/v1/bankruptcy/import-runs",
  apiV1BankruptcyImportRunsImportRunId: "/api/v1/bankruptcy/import-runs/{importRunId}",
  apiV1BankruptcyG2ImportDashboard: "/api/v1/bankruptcy/g2-import/dashboard",
  apiV1BankruptcyMonitoringRun: "/api/v1/bankruptcy-monitoring/run",
  apiV1BankruptcyMonitoringRuns: "/api/v1/bankruptcy-monitoring/runs",
  apiV1BankruptcyMonitoringRunsRunId: "/api/v1/bankruptcy-monitoring/runs/{runId}",
  apiV1BankruptcyMonitoringRunsRunIdReports: "/api/v1/bankruptcy-monitoring/runs/{runId}/reports",
  apiV1BankruptcyMonitoringReportsReportId: "/api/v1/bankruptcy-monitoring/reports/{reportId}",
  apiV1BankruptcyMonitoringReportsReportIdExport: "/api/v1/bankruptcy-monitoring/reports/{reportId}/export",
  apiV1BankruptcyMonitoringReportItemsReportItemIdApprove: "/api/v1/bankruptcy-monitoring/report-items/{reportItemId}/approve",
  apiV1BankruptcyMonitoringReportItemsReportItemIdReject: "/api/v1/bankruptcy-monitoring/report-items/{reportItemId}/reject",
  apiV1BankruptcyMonitoringReportItemsReportItemIdConvertToPlacement: "/api/v1/bankruptcy-monitoring/report-items/{reportItemId}/convert-to-placement",
  apiV1BankruptcyMonitoringReportsReportIdDelivered: "/api/v1/bankruptcy-monitoring/reports/{reportId}/delivered",
  apiV1BankruptcyMonitoringDashboard: "/api/v1/bankruptcy-monitoring/dashboard",
  apiV1ClaimsEligibility: "/api/v1/claims/eligibility",
  apiV1Claims: "/api/v1/claims",
  apiV1ClaimsClaimId: "/api/v1/claims/{claimId}",
  apiV1ClaimsClaimIdPayments: "/api/v1/claims/{claimId}/payments",
  apiV1ClaimsClaimIdPaymentsPost: "/api/v1/claims/{claimId}/payments/post",
  apiV1ClaimsClaimIdStatus: "/api/v1/claims/{claimId}/status",
  apiV1ClaimsClaimIdAttorneyAssignment: "/api/v1/claims/{claimId}/attorney-assignment",
  apiV1ClaimsClaimIdFilingPackage: "/api/v1/claims/{claimId}/filing-package",
  apiV1ClaimsClaimIdRegisterFiling: "/api/v1/claims/{claimId}/register-filing",
  apiV1ClaimsBankruptcyEvents: "/api/v1/claims/bankruptcy-events",
  apiV1ClaimsClaimIdReceipt: "/api/v1/claims/{claimId}/receipt",
  apiV1ClaimsClaimIdAmendments: "/api/v1/claims/{claimId}/amendments",
  apiV1ClaimsAmendmentsAmendmentIdFiled: "/api/v1/claims/amendments/{amendmentId}/filed",
  apiV1ClaimsClaimIdObjections: "/api/v1/claims/{claimId}/objections",
  apiV1ClaimsObjectionsObjectionIdResponded: "/api/v1/claims/objections/{objectionId}/responded",
  apiV1ClaimsObjectionsObjectionIdResolve: "/api/v1/claims/objections/{objectionId}/resolve",
  apiV1ClaimsClaimIdTransfers: "/api/v1/claims/{claimId}/transfers",
  apiV1ClaimsTransfersTransferIdFiled: "/api/v1/claims/transfers/{transferId}/filed",
  apiV1ClaimsTransfersTransferIdAccepted: "/api/v1/claims/transfers/{transferId}/accepted",
  apiV1DevAccountsImportUploadDemoCsv: "/api/v1/dev/accounts-import/upload-demo-csv",
  apiV1DevBankruptcyImportDemoCsv: "/api/v1/dev/bankruptcy-import/demo-csv",
  apiV1DevBankruptcyImportUploadDemoCsv: "/api/v1/dev/bankruptcy-import/upload-demo-csv",
  apiV1DocumentsGenerate: "/api/v1/documents/generate",
  apiV1DocumentsUpload: "/api/v1/documents/upload",
  apiV1DocumentsDocumentIdVersions: "/api/v1/documents/{documentId}/versions",
  apiV1DocumentsDocumentIdStatus: "/api/v1/documents/{documentId}/status",
  apiV1DocumentsDocumentIdVersionsVersionIdDownload: "/api/v1/documents/{documentId}/versions/{versionId}/download",
  apiV1Documents: "/api/v1/documents",
  apiV1FileIngestionRunsIngestionRunId: "/api/v1/file-ingestion/runs/{ingestionRunId}",
  apiV1G2ImportRun: "/api/v1/g2-import/run",
  apiV1MatchingPlacementAccountsPlacementAccountIdBankruptcyCandidates: "/api/v1/matching/placement-accounts/{placementAccountId}/bankruptcy-candidates",
  apiV1NdcPaymentsImport: "/api/v1/ndc/payments/import",
  apiV1NdcImportRuns: "/api/v1/ndc/import-runs",
  apiV1NdcImportRunsRunId: "/api/v1/ndc/import-runs/{runId}",
  apiV1NdcPayments: "/api/v1/ndc/payments",
  apiV1NdcSchedules: "/api/v1/ndc/schedules",
  apiV1NdcSchedulesScheduleIdDeactivate: "/api/v1/ndc/schedules/{scheduleId}/deactivate",
  apiV1NdcDashboard: "/api/v1/ndc/dashboard",
  apiV1PlacementQueue: "/api/v1/placement/queue",
  apiV1PlacementAccountsPlacementAccountId: "/api/v1/placement/accounts/{placementAccountId}",
  apiV1PlacementAccountsPlacementAccountIdQueue: "/api/v1/placement/accounts/{placementAccountId}/queue",
  apiV1PlacementFlagsPlacementReviewFlagIdResolve: "/api/v1/placement/flags/{placementReviewFlagId}/resolve",
  apiV1PlacementAccountsPlacementAccountIdLegalReview: "/api/v1/placement/accounts/{placementAccountId}/legal-review",
  apiV1PlacementAccountsPlacementAccountIdFilingAssignment: "/api/v1/placement/accounts/{placementAccountId}/filing-assignment",
  apiV1PlacementAccountsPlacementAccountIdMatchesPlacementBankruptcyMatchIdSelect: "/api/v1/placement/accounts/{placementAccountId}/matches/{placementBankruptcyMatchId}/select",
  apiV1PlacementAccountsPlacementAccountIdFlags: "/api/v1/placement/accounts/{placementAccountId}/flags",
  apiV1PlacementDashboard: "/api/v1/placement/dashboard",
  apiV1PlacementAccounts: "/api/v1/placement/accounts",
  apiV1PlacementFiles: "/api/v1/placement/files",
  apiV1PlacementFilesPlacementFileId: "/api/v1/placement/files/{placementFileId}",
  apiV1PlacementAccountsPlacementAccountIdFilingPage: "/api/v1/placement/accounts/{placementAccountId}/filing-page",
  apiV1PlacementAccountsPlacementAccountIdCourtReceipts: "/api/v1/placement/accounts/{placementAccountId}/court-receipts",
  apiV1PlacementAccountsPlacementAccountIdSubmitFiling: "/api/v1/placement/accounts/{placementAccountId}/submit-filing",
  apiV1PlacementAccountsPlacementAccountIdPocDocuments: "/api/v1/placement/accounts/{placementAccountId}/poc-documents",
  apiV1PlacementAccountsPlacementAccountIdDocumentsGenerate: "/api/v1/placement/accounts/{placementAccountId}/documents/generate",
  apiV1PlacementImportUpload: "/api/v1/placement/import/upload",
  apiV1ReportsSnapshots: "/api/v1/reports/snapshots",
  apiV1ReportsSnapshotsSnapshotId: "/api/v1/reports/snapshots/{snapshotId}",
  apiV1ReportsSnapshotsSnapshotIdExport: "/api/v1/reports/snapshots/{snapshotId}/export",
  apiV1ReportsSnapshotsBankruptcyMonitoringReportId: "/api/v1/reports/snapshots/bankruptcy-monitoring/{reportId}",
  apiV1ReportsDashboardOperations: "/api/v1/reports/dashboard/operations",
  apiV1ReportsDashboardPlacement: "/api/v1/reports/dashboard/placement",
  apiV1ReportsDashboardClaims: "/api/v1/reports/dashboard/claims",
  apiV1ReportsDashboardNdc: "/api/v1/reports/dashboard/ndc",
  apiV1ReportsDashboardScrub: "/api/v1/reports/dashboard/scrub",
  apiV1ReportsDashboardBankruptcyMonitoring: "/api/v1/reports/dashboard/bankruptcy-monitoring",
  apiV1ScrubInventories: "/api/v1/scrub/inventories",
  apiV1ScrubInventoriesInventoryId: "/api/v1/scrub/inventories/{inventoryId}",
  apiV1ScrubInventoriesInventoryIdVersions: "/api/v1/scrub/inventories/{inventoryId}/versions",
  apiV1ScrubInventoriesInventoryIdImport: "/api/v1/scrub/inventories/{inventoryId}/import",
  apiV1ScrubInventoriesInventoryIdRun: "/api/v1/scrub/inventories/{inventoryId}/run",
  apiV1ScrubRuns: "/api/v1/scrub/runs",
  apiV1ScrubRunsRunId: "/api/v1/scrub/runs/{runId}",
  apiV1ScrubResultBatchesBatchId: "/api/v1/scrub/result-batches/{batchId}",
  apiV1ScrubResultBatchesBatchIdExport: "/api/v1/scrub/result-batches/{batchId}/export",
  apiV1ScrubResultBatchesBatchIdResponse: "/api/v1/scrub/result-batches/{batchId}/response",
  apiV1ScrubReportedBankruptcies: "/api/v1/scrub/reported-bankruptcies",
  apiV1ScrubReportedBankruptciesReportedBankruptcyId: "/api/v1/scrub/reported-bankruptcies/{reportedBankruptcyId}",
  apiV1ScrubReportedBankruptciesReportedBankruptcyIdResolve: "/api/v1/scrub/reported-bankruptcies/{reportedBankruptcyId}/resolve",
  apiV1ScrubInventoriesInventoryIdSchedule: "/api/v1/scrub/inventories/{inventoryId}/schedule",
  apiV1ScrubSchedules: "/api/v1/scrub/schedules",
  apiV1ScrubSchedulesScheduleIdDeactivate: "/api/v1/scrub/schedules/{scheduleId}/deactivate",
  apiV1SecurityRoles: "/api/v1/security/roles",
  apiV1SecurityPermissions: "/api/v1/security/permissions",
  apiV1SecurityUsers: "/api/v1/security/users",
  apiV1SecurityUsersUserIdRolesRoleId: "/api/v1/security/users/{userId}/roles/{roleId}",
  apiV1SecurityUsersUserIdClientsClientId: "/api/v1/security/users/{userId}/clients/{clientId}",
  apiV1Tasks: "/api/v1/tasks",
  apiV1TasksTaskId: "/api/v1/tasks/{taskId}",
  apiV1TasksTaskIdComplete: "/api/v1/tasks/{taskId}/complete",
  apiV1TasksTaskIdCancel: "/api/v1/tasks/{taskId}/cancel",
  apiV1Timeline: "/api/v1/timeline",
  health: "/health",
} as const;
