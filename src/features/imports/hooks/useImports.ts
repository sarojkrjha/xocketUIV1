import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import {
  getBankruptcyImportBatches,
  getBankruptcyImportErrors,
  getBankruptcyImportRunDetail,
  getBankruptcyImportRuns,
  getFileIngestionRun,
  getImportDashboard,
  getPlacementFileDetail,
  getPlacementFiles,
  runG2Import,
  uploadAccountDemoCsv,
  uploadBankruptcyDemoCsv,
  uploadPlacementFile
} from '../api/importsApi';
import type { ImportSearchRequest } from '../types/imports';

const importKeys = {
  root: ['imports'] as const,
  dashboard: ['imports', 'dashboard'] as const,
  runs: (request: unknown) => ['imports', 'bankruptcy-runs', request] as const,
  batches: (request: unknown) => ['imports', 'bankruptcy-batches', request] as const,
  errors: (request: unknown) => ['imports', 'bankruptcy-errors', request] as const,
  placementFiles: (request: unknown) => ['imports', 'placement-files', request] as const,
  runDetail: (id: number) => ['imports', 'bankruptcy-runs', id] as const,
  placementFile: (id: number) => ['imports', 'placement-files', id] as const,
  ingestionRun: (id: number) => ['imports', 'file-ingestion', id] as const
};

export function useImportDashboard() {
  return useQuery({ queryKey: importKeys.dashboard, queryFn: getImportDashboard });
}

export function useBankruptcyImportRuns(request: ImportSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: importKeys.runs(request), queryFn: () => getBankruptcyImportRuns(request), enabled });
}

export function useBankruptcyImportBatches(request: ImportSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: importKeys.batches(request), queryFn: () => getBankruptcyImportBatches(request), enabled });
}

export function useBankruptcyImportErrors(request: ImportSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: importKeys.errors(request), queryFn: () => getBankruptcyImportErrors(request), enabled });
}

export function usePlacementFiles(request: ImportSearchRequest, enabled: boolean) {
  return useQuery({ queryKey: importKeys.placementFiles(request), queryFn: () => getPlacementFiles(request), enabled });
}

export function useBankruptcyImportRunDetail(importRunId?: number) {
  return useQuery({ queryKey: importKeys.runDetail(importRunId ?? 0), queryFn: () => getBankruptcyImportRunDetail(importRunId!), enabled: Boolean(importRunId) });
}

export function usePlacementFileDetail(placementFileId?: number) {
  return useQuery({ queryKey: importKeys.placementFile(placementFileId ?? 0), queryFn: () => getPlacementFileDetail(placementFileId!), enabled: Boolean(placementFileId) });
}

export function useFileIngestionRun(ingestionRunId?: number) {
  return useQuery({ queryKey: importKeys.ingestionRun(ingestionRunId ?? 0), queryFn: () => getFileIngestionRun(ingestionRunId!), enabled: Boolean(ingestionRunId) });
}

export function useRunG2Import() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runG2Import,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: importKeys.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reporting.root })
      ]);
    }
  });
}

export function useUploadPlacementFile() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: uploadPlacementFile, onSuccess: () => queryClient.invalidateQueries({ queryKey: importKeys.root }) });
}

export function useUploadBankruptcyDemoCsv() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: uploadBankruptcyDemoCsv, onSuccess: () => queryClient.invalidateQueries({ queryKey: importKeys.root }) });
}

export function useUploadAccountDemoCsv() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: uploadAccountDemoCsv, onSuccess: () => queryClient.invalidateQueries({ queryKey: importKeys.root }) });
}
