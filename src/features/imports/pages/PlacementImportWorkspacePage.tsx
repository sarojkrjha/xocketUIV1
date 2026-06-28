import { useMemo, useState } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { AlertTriangle, CheckCircle2, ClipboardList, FileInput, FileSearch, ListChecks, Search, UploadCloud } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { usePlacementFileDetail, usePlacementFiles, useUploadPlacementFile } from '../hooks/useImports';
import type { ImportSearchRequest, PlacementFileItem } from '../types/imports';
import { importStatusTone } from '../api/importStatusMaps';

type FilterState = {
  search: string;
  clientId: string;
  status: string;
};

type WizardStep = 'client' | 'upload' | 'validate' | 'preview' | 'complete';

const initialFilters: FilterState = { search: '', clientId: '', status: '' };
const wizardSteps: Array<{ key: WizardStep; label: string; helper: string }> = [
  { key: 'client', label: 'Client', helper: 'Choose owning client' },
  { key: 'upload', label: 'Upload', helper: 'Attach placement file' },
  { key: 'validate', label: 'Validate', helper: 'Pre-submit checks' },
  { key: 'preview', label: 'Preview', helper: 'Review import summary' },
  { key: 'complete', label: 'Complete', helper: 'Backend upload result' }
];

function toNumberOrUndefined(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : undefined;
}

function pickFile(files: FileList | null) {
  return files?.[0] ?? null;
}

const numberFormatter = ({ value }: ValueFormatterParams<PlacementFileItem, number | null | undefined>) => value === null || value === undefined ? '-' : String(value);
const dateFormatter = ({ value }: ValueFormatterParams<PlacementFileItem, string | null | undefined>) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function arrayFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const source = objectOrEmpty(value);
  for (const key of ['items', 'rows', 'errors', 'validationErrors', 'accounts', 'placementAccounts']) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
  }
  return [];
}

function readNumber(source: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function readString(source: Record<string, unknown>, keys: string[], fallback = '-') {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  return fallback;
}

export function PlacementImportWorkspacePage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<FilterState>(initialFilters);
  const [selectedPlacementFileId, setSelectedPlacementFileId] = useState<number | undefined>();
  const [wizardStep, setWizardStep] = useState<WizardStep>('client');
  const [uploadForm, setUploadForm] = useState({ clientId: '', uploadedBy: 'UI User', file: null as File | null });
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const request = useMemo<ImportSearchRequest>(() => ({
    page,
    pageSize,
    search: submittedFilters.search.trim() || undefined,
    clientId: toNumberOrUndefined(submittedFilters.clientId),
    status: toNumberOrUndefined(submittedFilters.status)
  }), [page, submittedFilters]);

  const placementFilesQuery = usePlacementFiles(request, true);
  const placementFileDetailQuery = usePlacementFileDetail(selectedPlacementFileId);
  const uploadPlacementFile = useUploadPlacementFile();

  const rows = placementFilesQuery.data?.items ?? [];
  const totalCount = placementFilesQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clientId = toNumberOrUndefined(uploadForm.clientId);
  const canUpload = Boolean(clientId && uploadForm.file && uploadForm.uploadedBy.trim());

  const detailSource = objectOrEmpty(placementFileDetailQuery.data);
  const detailErrors = arrayFrom(detailSource.validationErrors ?? detailSource.errors ?? detailSource.errorRows);
  const detailAccounts = arrayFrom(detailSource.placementAccounts ?? detailSource.accounts ?? detailSource.importedAccounts ?? detailSource.rows);
  const detailStats = {
    totalRows: readNumber(detailSource, ['totalRows', 'rowCount'], 0),
    acceptedRows: readNumber(detailSource, ['acceptedRows', 'successRows', 'importedRows'], 0),
    rejectedRows: readNumber(detailSource, ['rejectedRows', 'failedRows', 'errorRows'], 0),
    duplicateRows: readNumber(detailSource, ['duplicateRows', 'duplicates'], 0)
  };

  const stats = useMemo(() => {
    const accepted = rows.reduce((sum, row) => sum + (row.acceptedRows ?? 0), 0);
    const rejected = rows.reduce((sum, row) => sum + (row.rejectedRows ?? 0), 0);
    const total = rows.reduce((sum, row) => sum + (row.totalRows ?? 0), 0);
    const processing = rows.filter((row) => String(row.statusLabel).toLowerCase().includes('process')).length;
    return { files: totalCount, visibleRows: rows.length, total, accepted, rejected, processing };
  }, [rows, totalCount]);

  const columns = useMemo<ColDef<PlacementFileItem>[]>(() => [
    {
      headerName: 'File', field: 'fileName', pinned: 'left', minWidth: 260,
      cellRenderer: ({ data }: { data?: PlacementFileItem }) => (
        <button className="grid-link-cell" type="button" onClick={() => data && setSelectedPlacementFileId(data.placementFileId)}>
          <strong>{data?.fileName ?? `Placement File #${data?.placementFileId ?? '-'}`}</strong>
          <span>File ID {data?.placementFileId ?? '-'}</span>
        </button>
      )
    },
    { headerName: 'Client', field: 'clientName', minWidth: 180, valueFormatter: ({ value, data }) => value || data?.clientId || '-' },
    { headerName: 'Status', field: 'statusLabel', minWidth: 160, cellRenderer: ({ data }: { data?: PlacementFileItem }) => <StatusBadge label={data?.statusLabel ?? 'Unknown'} tone={importStatusTone(data?.status)} /> },
    { headerName: 'Rows', field: 'totalRows', minWidth: 110, valueFormatter: numberFormatter },
    { headerName: 'Accepted', field: 'acceptedRows', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Rejected', field: 'rejectedRows', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Uploaded By', field: 'uploadedBy', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Uploaded', field: 'uploadedOnUtc', minWidth: 180, valueFormatter: dateFormatter },
    { headerName: 'Actions', pinned: 'right', width: 130, sortable: false, filter: false, cellRenderer: ({ data }: { data?: PlacementFileItem }) => <Button variant="secondary" onClick={() => data && setSelectedPlacementFileId(data.placementFileId)}>Review</Button> }
  ], []);

  const validationColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { headerName: 'Line', valueGetter: ({ data }) => readNumber(objectOrEmpty(data), ['lineNumber', 'rowNumber', 'line'], 0), width: 100 },
    { headerName: 'Severity', valueGetter: ({ data }) => readString(objectOrEmpty(data), ['severity', 'level', 'type']) },
    { headerName: 'Account', valueGetter: ({ data }) => readString(objectOrEmpty(data), ['accountNumber', 'accountNo', 'account']) },
    { headerName: 'Message', valueGetter: ({ data }) => readString(objectOrEmpty(data), ['message', 'errorMessage', 'description']) }
  ], []);

  const accountColumns = useMemo<ColDef<Record<string, unknown>>[]>(() => [
    { headerName: 'Account', valueGetter: ({ data }) => readString(objectOrEmpty(data), ['accountNumber', 'primaryAccountNumber', 'accountNo']) },
    { headerName: 'Debtor', valueGetter: ({ data }) => readString(objectOrEmpty(data), ['debtorName', 'contactName', 'fullName']) },
    { headerName: 'Balance', valueGetter: ({ data }) => readNumber(objectOrEmpty(data), ['balance', 'currentBalance', 'claimAmount'], 0) },
    { headerName: 'Status', valueGetter: ({ data }) => readString(objectOrEmpty(data), ['statusLabel', 'status', 'queueStatus']) }
  ], []);

  const runSearch = () => {
    setPage(1);
    setSubmittedFilters(filters);
  };

  const advanceWizard = () => {
    if (wizardStep === 'client') {
      setValidationMessage(clientId ? null : 'Client ID is required before uploading a placement file.');
      if (clientId) setWizardStep('upload');
      return;
    }
    if (wizardStep === 'upload') {
      setValidationMessage(uploadForm.file ? null : 'Select the placement file first.');
      if (uploadForm.file) setWizardStep('validate');
      return;
    }
    if (wizardStep === 'validate') {
      setWizardStep('preview');
    }
  };

  const submitUpload = async () => {
    setValidationMessage(null);
    if (!canUpload || !clientId || !uploadForm.file) {
      setValidationMessage('Client ID, uploaded by, and file are required for placement import.');
      return;
    }
    await uploadPlacementFile.mutateAsync({ clientId, uploadedBy: uploadForm.uploadedBy || 'UI User', file: uploadForm.file });
    setWizardStep('complete');
    setUploadForm({ clientId: '', uploadedBy: 'UI User', file: null });
    void placementFilesQuery.refetch();
  };

  return (
    <div className="workspace-page lp01-page">
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">LP-01 · Placement Import & Queue Management</p>
          <h1>Placement Import Dashboard</h1>
          <p>Legacy-style placement intake: select client, upload file, validate, preview, import, review file history, and push accepted rows into queue processing.</p>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<FileInput size={20} />} label="Files" value={stats.files} helper="Server-side total" />
        <StatCard icon={<ClipboardList size={20} />} label="Rows" value={stats.total} helper="Visible page total" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Accepted" value={stats.accepted} helper="Ready for queue" tone="success" />
        <StatCard icon={<AlertTriangle size={20} />} label="Rejected" value={stats.rejected} helper="Needs correction" tone="danger" />
        <StatCard icon={<ListChecks size={20} />} label="Processing" value={stats.processing} helper="Visible files" tone="info" />
      </div>

      <section className="workspace-card lp01-wizard-card">
        <div className="workspace-card-header">
          <div>
            <h2>Placement Import Wizard</h2>
            <p>Uses the real placement import endpoint. Validation and preview are UI pre-submit checkpoints because Swagger exposes upload, file list, and file detail, but not separate validate/preview APIs.</p>
          </div>
          <StatusBadge label={wizardStep.toUpperCase()} tone="info" />
        </div>
        <div className="workflow-track lp01-workflow-track">
          {wizardSteps.map((step, index) => {
            const currentIndex = wizardSteps.findIndex((item) => item.key === wizardStep);
            const done = index < currentIndex || wizardStep === 'complete';
            const active = step.key === wizardStep;
            return (
              <div className={`workflow-step ${done ? 'done' : ''} ${active ? 'active' : ''}`} key={step.key}>
                <span className="workflow-node">{done ? '✓' : index + 1}</span>
                <strong>{step.label}</strong>
                <small>{step.helper}</small>
              </div>
            );
          })}
        </div>

        <div className="form-grid form-grid--compact">
          <label>
            Client ID <span className="required-marker">*</span>
            <input value={uploadForm.clientId} onChange={(event) => setUploadForm((current) => ({ ...current, clientId: event.target.value }))} placeholder="Required" />
          </label>
          <label>
            Uploaded By <span className="required-marker">*</span>
            <input value={uploadForm.uploadedBy} onChange={(event) => setUploadForm((current) => ({ ...current, uploadedBy: event.target.value }))} />
          </label>
          <label>
            Placement File <span className="required-marker">*</span>
            <input type="file" onChange={(event) => setUploadForm((current) => ({ ...current, file: pickFile(event.target.files) }))} />
          </label>
          <div className="form-actions-inline">
            {wizardStep !== 'preview' && wizardStep !== 'complete' ? <Button variant="secondary" onClick={advanceWizard}>Next Step</Button> : null}
            {wizardStep === 'preview' ? <Button disabled={uploadPlacementFile.isPending || !canUpload} onClick={submitUpload}><UploadCloud size={16} /> {uploadPlacementFile.isPending ? 'Importing...' : 'Import Placement File'}</Button> : null}
          </div>
        </div>

        {wizardStep === 'validate' ? <div className="xocket-alert xocket-alert-info">UI validation passed for required client, uploader, and file. Detailed row-level validation is returned after backend processing through file detail.</div> : null}
        {wizardStep === 'preview' ? <div className="xocket-alert xocket-alert-warning">Preview: {uploadForm.file?.name ?? 'No file'} will be uploaded for Client #{uploadForm.clientId}. Confirm to submit to backend import processing.</div> : null}
        {validationMessage ? <div className="xocket-alert xocket-alert-warning">{validationMessage}</div> : null}
        {uploadPlacementFile.isError ? <div className="xocket-alert xocket-alert-danger">{(uploadPlacementFile.error as Error).message || 'Placement import failed.'}</div> : null}
        {uploadPlacementFile.isSuccess ? <div className="xocket-alert xocket-alert-success">Placement file uploaded. Review imported files below for processing status and validation detail.</div> : null}
      </section>

      <section className="workspace-card">
        <div className="workspace-card-header">
          <div>
            <h2>Imported Files</h2>
            <p>File history from GET /api/v1/placement/files. Open a file to review validation, accepted rows, rejected rows, and server-returned details.</p>
          </div>
        </div>
        <div className="filter-bar filter-bar--dense">
          <div className="filter-input"><Search size={16} /><input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search file" /></div>
          <input value={filters.clientId} onChange={(event) => setFilters((current) => ({ ...current, clientId: event.target.value }))} placeholder="Client ID" />
          <input value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} placeholder="Status code" />
          <Button onClick={runSearch}>Search Files</Button>
        </div>

        {placementFilesQuery.isError ? <div className="xocket-alert xocket-alert-danger">{(placementFilesQuery.error as Error).message || 'Unable to load placement files.'}</div> : null}
        <EnterpriseGrid rows={rows} columns={columns} isLoading={placementFilesQuery.isFetching} height={430} emptyMessage="No placement import files found." onRowDoubleClicked={(row) => setSelectedPlacementFileId(row.placementFileId)} />
        <div className="pagination-bar">
          <Button variant="secondary" disabled={page <= 1 || placementFilesQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="secondary" disabled={page >= totalPages || placementFilesQuery.isFetching} onClick={() => setPage((current) => current + 1)}>Next</Button>
        </div>
      </section>

      {selectedPlacementFileId ? (
        <section className="workspace-card lp01-detail-card">
          <div className="workspace-card-header">
            <div>
              <h2>Import Detail · File #{selectedPlacementFileId}</h2>
              <p>Uses GET /api/v1/placement/files/{'{placementFileId}'}. Tabs are rendered from server-provided properties when available.</p>
            </div>
            <Button variant="secondary" onClick={() => setSelectedPlacementFileId(undefined)}>Close Detail</Button>
          </div>
          {placementFileDetailQuery.isFetching ? <div className="placement-empty-business">Loading placement file detail...</div> : null}
          {placementFileDetailQuery.isError ? <div className="xocket-alert xocket-alert-danger">{(placementFileDetailQuery.error as Error).message || 'Unable to load placement file detail.'}</div> : null}

          <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
            <StatCard icon={<FileSearch size={20} />} label="Total Rows" value={detailStats.totalRows} helper="From detail payload" />
            <StatCard icon={<CheckCircle2 size={20} />} label="Accepted" value={detailStats.acceptedRows} helper="Imported/ready" tone="success" />
            <StatCard icon={<AlertTriangle size={20} />} label="Rejected" value={detailStats.rejectedRows} helper="Validation errors" tone="danger" />
            <StatCard icon={<ClipboardList size={20} />} label="Duplicates" value={detailStats.duplicateRows} helper="Server reported" tone="warning" />
          </div>

          <div className="lp01-detail-grid">
            <div className="lp01-panel">
              <h3>Validation / Errors</h3>
              <EnterpriseGrid rows={detailErrors.map((item) => objectOrEmpty(item))} columns={validationColumns} height={260} emptyMessage="No validation errors returned by the backend." rowHeight={48} />
            </div>
            <div className="lp01-panel">
              <h3>Imported Accounts Preview</h3>
              <EnterpriseGrid rows={detailAccounts.map((item) => objectOrEmpty(item))} columns={accountColumns} height={260} emptyMessage="No imported account rows returned by the backend." rowHeight={48} />
            </div>
          </div>

          <details className="json-details">
            <summary>Raw backend detail payload</summary>
            <pre className="json-preview">{placementFileDetailQuery.data ? JSON.stringify(placementFileDetailQuery.data, null, 2) : 'No detail loaded.'}</pre>
          </details>
        </section>
      ) : null}
    </div>
  );
}
