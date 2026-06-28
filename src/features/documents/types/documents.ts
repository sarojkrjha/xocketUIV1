export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type DocumentSearchRequest = {
  page: number;
  pageSize: number;
  search?: string;
  referenceType?: string;
  referenceId?: number;
  documentType?: string;
};

export type DocumentQueueItem = {
  id: number;
  documentId: number;
  fileName: string;
  documentType?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
  status?: number | string | null;
  statusLabel?: string | null;
  currentVersionId?: number | null;
  versionNumber?: number | null;
  generatedBy?: string | null;
  uploadedBy?: string | null;
  createdBy?: string | null;
  createdOnUtc?: string | null;
  generatedOnUtc?: string | null;
  uploadedOnUtc?: string | null;
  fileSizeBytes?: number | null;
};

export type DocumentVersion = {
  id: number;
  documentVersionId: number;
  versionNumber?: number | null;
  fileName?: string | null;
  fileSizeBytes?: number | null;
  contentType?: string | null;
  uploadedBy?: string | null;
  uploadedOnUtc?: string | null;
  createdOnUtc?: string | null;
  status?: number | string | null;
};

export type GenerateDocumentRequest = {
  documentType: string;
  referenceType: string;
  referenceId: number;
  generatedBy?: string;
  templateType?: string;
  fileName?: string;
  generatePdf: boolean;
  additionalFields?: Record<string, string>;
  requiredFields?: string[];
};

export type AdvanceDocumentStatusRequest = {
  documentId: number;
  toStatus: number;
  reason?: string;
  changedBy?: string;
  description?: string;
};

export type UploadDocumentRequest = {
  file: File;
  documentType: string;
  referenceType: string;
  referenceId: number;
  uploadedBy: string;
};

export type UploadDocumentVersionRequest = {
  documentId: number;
  file: File;
  uploadedBy: string;
};
