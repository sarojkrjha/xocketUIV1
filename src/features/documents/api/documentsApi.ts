import { apiClient } from '@/shared/api/apiClient';
import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { apiGet, apiPost, apiPut, buildPath } from '@/shared/api/request';
import { normalizePagedResult } from '@/shared/api/pagination';
import type {
  AdvanceDocumentStatusRequest,
  DocumentQueueItem,
  DocumentSearchRequest,
  DocumentVersion,
  GenerateDocumentRequest,
  PagedResult,
  UploadDocumentRequest,
  UploadDocumentVersionRequest
} from '../types/documents';
import { formatDocumentStatus } from './documentStatusMaps';

export async function getDocuments(request: DocumentSearchRequest): Promise<PagedResult<DocumentQueueItem>> {
  const data = await apiGet<unknown>(ApiPath.apiV1Documents, {
    page: request.page,
    pageSize: request.pageSize,
    search: request.search,
    referenceType: request.referenceType,
    referenceId: request.referenceId,
    documentType: request.documentType
  });

  return normalizePagedResult(data, request, normalizeDocumentQueueItem);
}

export async function generateDocument(request: GenerateDocumentRequest): Promise<unknown> {
  return apiPost<unknown, GenerateDocumentRequest>(ApiPath.apiV1DocumentsGenerate, request);
}

export async function uploadDocument(request: UploadDocumentRequest): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', request.file);

  const response = await apiClient.post(ApiPath.apiV1DocumentsUpload, formData, {
    params: {
      documentType: request.documentType,
      referenceType: request.referenceType,
      referenceId: request.referenceId,
      uploadedBy: request.uploadedBy
    },
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
}

export async function getDocumentVersions(documentId: number): Promise<DocumentVersion[]> {
  const path = buildPath(ApiPath.apiV1DocumentsDocumentIdVersions, { documentId });
  const data = await apiGet<unknown>(path);
  const values = extractArray(data);
  return values.map(normalizeDocumentVersion);
}

export async function uploadDocumentVersion(request: UploadDocumentVersionRequest): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', request.file);

  const path = buildPath(ApiPath.apiV1DocumentsDocumentIdVersions, { documentId: request.documentId });
  const response = await apiClient.post(path, formData, {
    params: { uploadedBy: request.uploadedBy },
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data;
}

export async function advanceDocumentStatus(request: AdvanceDocumentStatusRequest): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1DocumentsDocumentIdStatus, { documentId: request.documentId });
  return apiPut<unknown, Omit<AdvanceDocumentStatusRequest, 'documentId'>>(path, {
    toStatus: request.toStatus,
    reason: request.reason,
    changedBy: request.changedBy,
    description: request.description
  });
}

export async function downloadDocumentVersion(documentId: number, versionId: number): Promise<Blob> {
  const path = buildPath(ApiPath.apiV1DocumentsDocumentIdVersionsVersionIdDownload, { documentId, versionId });
  const response = await apiClient.get(path, { responseType: 'blob' });
  return response.data;
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function readNumber(source: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function readString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return null;
}

function readStatus(source: Record<string, unknown>, keys: string[]): string | number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' || typeof value === 'number') return value;
  }
  return null;
}

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const source = objectOrEmpty(data);
  const candidates = [source.items, source.data, source.results, source.versions];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function normalizeDocumentQueueItem(value: unknown): DocumentQueueItem {
  const source = objectOrEmpty(value);
  const documentId = readNumber(source, ['documentId', 'id']);
  const status = readStatus(source, ['status', 'documentStatus']);
  const currentVersionId = readNumber(source, ['currentVersionId', 'versionId', 'documentVersionId'], 0) || null;

  return {
    id: documentId,
    documentId,
    fileName: readString(source, ['fileName', 'name', 'documentName', 'title']) ?? `Document ${documentId}`,
    documentType: readString(source, ['documentType', 'type', 'templateType']),
    referenceType: readString(source, ['referenceType']),
    referenceId: readNumber(source, ['referenceId'], 0) || null,
    status,
    statusLabel: formatDocumentStatus(status),
    currentVersionId,
    versionNumber: readNumber(source, ['versionNumber', 'currentVersionNumber'], 0) || null,
    generatedBy: readString(source, ['generatedBy']),
    uploadedBy: readString(source, ['uploadedBy']),
    createdBy: readString(source, ['createdBy']),
    createdOnUtc: readString(source, ['createdOnUtc', 'createdUtc']),
    generatedOnUtc: readString(source, ['generatedOnUtc', 'generatedUtc']),
    uploadedOnUtc: readString(source, ['uploadedOnUtc', 'uploadedUtc']),
    fileSizeBytes: readNumber(source, ['fileSizeBytes', 'sizeBytes'], 0) || null
  };
}

function normalizeDocumentVersion(value: unknown): DocumentVersion {
  const source = objectOrEmpty(value);
  const documentVersionId = readNumber(source, ['documentVersionId', 'versionId', 'id']);

  return {
    id: documentVersionId,
    documentVersionId,
    versionNumber: readNumber(source, ['versionNumber'], 0) || null,
    fileName: readString(source, ['fileName', 'name']),
    fileSizeBytes: readNumber(source, ['fileSizeBytes', 'sizeBytes'], 0) || null,
    contentType: readString(source, ['contentType', 'mimeType']),
    uploadedBy: readString(source, ['uploadedBy', 'createdBy']),
    uploadedOnUtc: readString(source, ['uploadedOnUtc', 'uploadedUtc', 'createdOnUtc', 'createdUtc']),
    createdOnUtc: readString(source, ['createdOnUtc', 'createdUtc']),
    status: readStatus(source, ['status'])
  };
}
