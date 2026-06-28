export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ImportDashboard = {
  g2PendingFiles: number;
  g2ProcessedToday: number;
  bankruptcyRunsToday: number;
  importErrorsOpen: number;
  placementFilesPending: number;
  ingestionRunsActive: number;
};

export type ImportSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  sourceSystem?: string;
  sourceMode?: string;
  status?: number;
  entityName?: string;
  fileName?: string;
  clientId?: number;
};

export type BankruptcyImportRunItem = {
  id: number;
  importRunId: number;
  sourceSystem: string | null;
  sourceMode: string | null;
  status: string | number | null;
  statusLabel: string;
  startedUtc: string | null;
  completedUtc: string | null;
  fileCount: number | null;
  totalRows: number | null;
  successRows: number | null;
  failedRows: number | null;
};

export type BankruptcyImportBatchItem = {
  id: number;
  importBatchId: number;
  importRunId: number | null;
  sourceSystem: string | null;
  entityName: string | null;
  fileName: string | null;
  status: string | number | null;
  statusLabel: string;
  totalRows: number | null;
  successRows: number | null;
  failedRows: number | null;
  processedUtc: string | null;
};

export type BankruptcyImportErrorItem = {
  id: number;
  importErrorId: number;
  importRunId: number | null;
  importBatchId: number | null;
  sourceSystem: string | null;
  entityName: string | null;
  fileName: string | null;
  rowNumber: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdUtc: string | null;
};

export type PlacementFileItem = {
  id: number;
  placementFileId: number;
  clientId: number | null;
  clientName: string | null;
  fileName: string | null;
  status: string | number | null;
  statusLabel: string;
  totalRows: number | null;
  acceptedRows: number | null;
  rejectedRows: number | null;
  uploadedBy: string | null;
  uploadedOnUtc: string | null;
};

export type RunG2ImportRequest = {
  triggeredBy?: string;
};

export type UploadPlacementFileRequest = {
  clientId: number;
  uploadedBy: string;
  file: File;
};

export type UploadBankruptcyDemoCsvRequest = {
  courtFile: File;
  trusteeFile: File;
  attorneyFile: File;
  bankruptcyFile: File;
  debtorFile: File;
  debtorAddressFile: File;
};

export type UploadAccountDemoCsvRequest = {
  accountFile: File;
  contactFile: File;
  activeBankruptcyFile: File;
  contactOIBankruptcyFile: File;
};
