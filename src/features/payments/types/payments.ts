export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type PaymentSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  importRunId?: number;
  trusteeId?: string;
  caseNumber?: string;
  claimNumber?: string;
  mappingStatus?: number;
};

export type PaymentQueueItem = {
  id: number;
  paymentId: number;
  importRunId: number | null;
  trusteeId: string | null;
  trusteeName: string | null;
  caseNumber: string | null;
  claimNumber: string | null;
  debtorName: string | null;
  accountNumber: string | null;
  amount: number | null;
  paymentDate: string | null;
  referenceNumber: string | null;
  mappingStatus: string | null;
  mappingStatusCode: number | null;
  sourceSystem: string | null;
};

export type NdcImportRunSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  trusteeId?: string;
  status?: number;
};

export type NdcImportRunItem = {
  id: number;
  runId: number;
  trusteeId: string | null;
  checkNumber: string | null;
  paymentDate: string | null;
  status: string | null;
  statusCode: number | null;
  totalRecords: number | null;
  matchedRecords: number | null;
  exceptionRecords: number | null;
  startedUtc: string | null;
  completedUtc: string | null;
  triggeredBy: string | null;
};

export type NdcScheduleSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  trusteeId?: string;
  isActive?: boolean;
};

export type NdcScheduleItem = {
  id: number;
  scheduleId: number;
  trusteeId: string | null;
  checkNumber: string | null;
  paymentDate: string | null;
  frequency: string | null;
  isActive: boolean | null;
  nextRunUtc: string | null;
};

export type ImportNdcPaymentsRequest = {
  trusteeId?: string | null;
  checkNumber?: string | null;
  paymentDate?: string | null;
  searchAllTime: boolean;
  triggeredBy?: string | null;
};

export type CreateNdcScheduleRequest = {
  trusteeId?: string | null;
  checkNumber?: string | null;
  paymentDate?: string | null;
  searchAllTime: boolean;
  frequency?: string | null;
};

export type NdcDashboard = {
  totalPayments: number | null;
  matchedPayments: number | null;
  exceptionPayments: number | null;
  importedToday: number | null;
  pendingSchedules: number | null;
  lastRunStatus: string | null;
};


export type NdcImportRunDetail = NdcImportRunItem & {
  raw: Record<string, unknown>;
  payments: PaymentQueueItem[];
  errors: NdcImportRunError[];
};

export type NdcImportRunError = {
  id: number;
  lineNumber: number | null;
  accountNumber: string | null;
  message: string | null;
  severity: string | null;
};

export type PostNdcPaymentToClaimRequest = {
  claimId: number;
  paymentId?: number | null;
  amount: number;
  paymentDate: string;
  referenceNumber?: string | null;
  postedBy?: string | null;
  sourceSystem?: string | null;
  sourcePaymentId?: string | null;
  externalReference?: string | null;
  allowOverpayment: boolean;
};
