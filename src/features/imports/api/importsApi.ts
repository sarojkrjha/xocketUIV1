import { apiClient } from '@/shared/api/apiClient';
import { ApiPath } from '@/shared/api/contracts/openapi.generated';
import { normalizePagedResult } from '@/shared/api/pagination';
import { apiGet, apiPost, buildPath } from '@/shared/api/request';
import { formatImportStatus } from './importStatusMaps';
import type {
  BankruptcyImportBatchItem,
  BankruptcyImportErrorItem,
  BankruptcyImportRunItem,
  ImportDashboard,
  ImportSearchRequest,
  PlacementFileItem,
  RunG2ImportRequest,
  UploadAccountDemoCsvRequest,
  UploadBankruptcyDemoCsvRequest,
  UploadPlacementFileRequest
} from '../types/imports';

export async function getImportDashboard(): Promise<ImportDashboard> {
  const [g2, placement] = await Promise.allSettled([
    apiGet<unknown>(ApiPath.apiV1BankruptcyG2ImportDashboard),
    apiGet<unknown>(ApiPath.apiV1ReportsDashboardPlacement)
  ]);
  const g2Source = objectOrEmpty(g2.status === 'fulfilled' ? g2.value : {});
  const placementSource = objectOrEmpty(placement.status === 'fulfilled' ? placement.value : {});
  return {
    g2PendingFiles: readNumber(g2Source, ['pendingFiles', 'filesPending', 'pendingFileCount'], 0),
    g2ProcessedToday: readNumber(g2Source, ['processedToday', 'processedFileCount', 'filesProcessedToday'], 0),
    bankruptcyRunsToday: readNumber(g2Source, ['runsToday', 'importRunsToday'], 0),
    importErrorsOpen: readNumber(g2Source, ['openErrors', 'errorCount', 'failedRows'], 0),
    placementFilesPending: readNumber(placementSource, ['placementFilesPending', 'pendingFiles', 'filesPending'], 0),
    ingestionRunsActive: readNumber(g2Source, ['activeIngestionRuns', 'activeRuns'], 0)
  };
}

export async function runG2Import(request: RunG2ImportRequest): Promise<unknown> {
  return apiPost<unknown, RunG2ImportRequest>(ApiPath.apiV1G2ImportRun, request);
}

export async function getBankruptcyImportRuns(request: ImportSearchRequest) {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyImportRuns, request);
  return normalizePagedResult(data, request, normalizeBankruptcyImportRun);
}

export async function getBankruptcyImportRunDetail(importRunId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1BankruptcyImportRunsImportRunId, { importRunId });
  return apiGet<unknown>(path);
}

export async function getBankruptcyImportBatches(request: ImportSearchRequest) {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyImportBatches, request);
  return normalizePagedResult(data, request, normalizeBankruptcyImportBatch);
}

export async function getBankruptcyImportErrors(request: ImportSearchRequest) {
  const data = await apiGet<unknown>(ApiPath.apiV1BankruptcyImportErrors, request);
  return normalizePagedResult(data, request, normalizeBankruptcyImportError);
}

export async function getPlacementFiles(request: ImportSearchRequest) {
  const data = await apiGet<unknown>(ApiPath.apiV1PlacementFiles, request);
  return normalizePagedResult(data, request, normalizePlacementFile);
}

export async function getPlacementFileDetail(placementFileId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1PlacementFilesPlacementFileId, { placementFileId });
  return apiGet<unknown>(path);
}

export async function uploadPlacementFile(request: UploadPlacementFileRequest): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', request.file);
  const response = await apiClient.post(ApiPath.apiV1PlacementImportUpload, formData, {
    params: { clientId: request.clientId, uploadedBy: request.uploadedBy },
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function uploadBankruptcyDemoCsv(request: UploadBankruptcyDemoCsvRequest): Promise<unknown> {
  const formData = new FormData();
  formData.append('courtFile', request.courtFile);
  formData.append('trusteeFile', request.trusteeFile);
  formData.append('attorneyFile', request.attorneyFile);
  formData.append('bankruptcyFile', request.bankruptcyFile);
  formData.append('debtorFile', request.debtorFile);
  formData.append('debtorAddressFile', request.debtorAddressFile);
  const response = await apiClient.post(ApiPath.apiV1DevBankruptcyImportUploadDemoCsv, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function uploadAccountDemoCsv(request: UploadAccountDemoCsvRequest): Promise<unknown> {
  const formData = new FormData();
  formData.append('accountFile', request.accountFile);
  formData.append('contactFile', request.contactFile);
  formData.append('activeBankruptcyFile', request.activeBankruptcyFile);
  formData.append('contactOIBankruptcyFile', request.contactOIBankruptcyFile);
  const response = await apiClient.post(ApiPath.apiV1DevAccountsImportUploadDemoCsv, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

export async function getFileIngestionRun(ingestionRunId: number): Promise<unknown> {
  const path = buildPath(ApiPath.apiV1FileIngestionRunsIngestionRunId, { ingestionRunId });
  return apiGet<unknown>(path);
}

function normalizeBankruptcyImportRun(value: unknown): BankruptcyImportRunItem {
  const source = objectOrEmpty(value);
  const importRunId = readNumber(source, ['importRunId', 'runId', 'id']);
  const status = readStatus(source, ['status', 'runStatus']);
  return {
    id: importRunId,
    importRunId,
    sourceSystem: readString(source, ['sourceSystem']),
    sourceMode: readString(source, ['sourceMode']),
    status,
    statusLabel: formatImportStatus(status),
    startedUtc: readString(source, ['startedUtc', 'startedOnUtc', 'createdOnUtc']),
    completedUtc: readString(source, ['completedUtc', 'completedOnUtc']),
    fileCount: readNumberOrNull(source, ['fileCount', 'totalFiles']),
    totalRows: readNumberOrNull(source, ['totalRows', 'rowCount']),
    successRows: readNumberOrNull(source, ['successRows', 'successfulRows']),
    failedRows: readNumberOrNull(source, ['failedRows', 'errorRows'])
  };
}

function normalizeBankruptcyImportBatch(value: unknown): BankruptcyImportBatchItem {
  const source = objectOrEmpty(value);
  const importBatchId = readNumber(source, ['importBatchId', 'batchId', 'id']);
  const status = readStatus(source, ['status', 'batchStatus']);
  return {
    id: importBatchId,
    importBatchId,
    importRunId: readNumberOrNull(source, ['importRunId', 'runId']),
    sourceSystem: readString(source, ['sourceSystem']),
    entityName: readString(source, ['entityName']),
    fileName: readString(source, ['fileName']),
    status,
    statusLabel: formatImportStatus(status),
    totalRows: readNumberOrNull(source, ['totalRows', 'rowCount']),
    successRows: readNumberOrNull(source, ['successRows', 'successfulRows']),
    failedRows: readNumberOrNull(source, ['failedRows', 'errorRows']),
    processedUtc: readString(source, ['processedUtc', 'completedOnUtc', 'createdOnUtc'])
  };
}

function normalizeBankruptcyImportError(value: unknown): BankruptcyImportErrorItem {
  const source = objectOrEmpty(value);
  const importErrorId = readNumber(source, ['importErrorId', 'errorId', 'id']);
  return {
    id: importErrorId,
    importErrorId,
    importRunId: readNumberOrNull(source, ['importRunId', 'runId']),
    importBatchId: readNumberOrNull(source, ['importBatchId', 'batchId']),
    sourceSystem: readString(source, ['sourceSystem']),
    entityName: readString(source, ['entityName']),
    fileName: readString(source, ['fileName']),
    rowNumber: readNumberOrNull(source, ['rowNumber', 'lineNumber']),
    errorCode: readString(source, ['errorCode', 'code']),
    errorMessage: readString(source, ['errorMessage', 'message', 'description']),
    createdUtc: readString(source, ['createdUtc', 'createdOnUtc'])
  };
}

function normalizePlacementFile(value: unknown): PlacementFileItem {
  const source = objectOrEmpty(value);
  const placementFileId = readNumber(source, ['placementFileId', 'fileId', 'id']);
  const status = readStatus(source, ['status', 'fileStatus']);
  return {
    id: placementFileId,
    placementFileId,
    clientId: readNumberOrNull(source, ['clientId']),
    clientName: readString(source, ['clientName']),
    fileName: readString(source, ['fileName', 'name']),
    status,
    statusLabel: formatImportStatus(status),
    totalRows: readNumberOrNull(source, ['totalRows', 'rowCount']),
    acceptedRows: readNumberOrNull(source, ['acceptedRows', 'successRows']),
    rejectedRows: readNumberOrNull(source, ['rejectedRows', 'failedRows']),
    uploadedBy: readString(source, ['uploadedBy', 'createdBy']),
    uploadedOnUtc: readString(source, ['uploadedOnUtc', 'createdOnUtc'])
  };
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function readNumber(source: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function readNumberOrNull(source: Record<string, unknown>, keys: string[]): number | null {
  const value = readNumber(source, keys, Number.NaN);
  return Number.isFinite(value) ? value : null;
}

function readString(source: Record<string, unknown>, keys: string[]): string | null {
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
