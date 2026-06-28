import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { DatabaseZap, FileInput, FileWarning, FolderSync, PlayCircle, Search, UploadCloud } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { importStatusTone } from '../api/importStatusMaps';
import {
  useBankruptcyImportBatches,
  useBankruptcyImportErrors,
  useBankruptcyImportRuns,
  useFileIngestionRun,
  useImportDashboard,
  usePlacementFiles,
  useRunG2Import,
  useUploadAccountDemoCsv,
  useUploadBankruptcyDemoCsv,
  useUploadPlacementFile
} from '../hooks/useImports';
import type { BankruptcyImportBatchItem, BankruptcyImportErrorItem, BankruptcyImportRunItem, PlacementFileItem } from '../types/imports';

type TabKey = 'g2' | 'runs' | 'batches' | 'errors' | 'placement' | 'dev';

type SearchState = {
  search: string;
  sourceSystem: string;
  sourceMode: string;
  status: number | '';
  entityName: string;
  fileName: string;
  clientId: string;
};

const defaultSearch: SearchState = {
  search: '',
  sourceSystem: '',
  sourceMode: '',
  status: '',
  entityName: '',
  fileName: '',
  clientId: ''
};

function toNumberOrUndefined(value: string | number | '') {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

function numberFormatter(params: { value?: number | null }) {
  if (params.value === null || params.value === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(params.value);
}

function dateFormatter(params: { value?: string | null }) {
  return formatDate(params.value);
}

function pickFile(files: FileList | null) {
  return files && files.length > 0 ? files[0] : null;
}

type ImportOperationsCenterPageProps = {
  initialTab?: TabKey;
};

export function ImportOperationsCenterPage({ initialTab = 'g2' }: ImportOperationsCenterPageProps) {
  const pageSize = 25;
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchState>(defaultSearch);
  const [submittedFilters, setSubmittedFilters] = useState<SearchState>(defaultSearch);
  const [hasSearch, setHasSearch] = useState(false);
  const [placementUpload, setPlacementUpload] = useState<{ clientId: string; uploadedBy: string; file: File | null }>({ clientId: '', uploadedBy: 'UI User', file: null });
  const [bankruptcyFiles, setBankruptcyFiles] = useState<Record<string, File | null>>({});
  const [accountFiles, setAccountFiles] = useState<Record<string, File | null>>({});
  const [ingestionRunId, setIngestionRunId] = useState('');
  const [submittedIngestionRunId, setSubmittedIngestionRunId] = useState<number | undefined>();

  const dashboardQuery = useImportDashboard();
  const runG2 = useRunG2Import();
  const uploadPlacement = useUploadPlacementFile();
  const uploadBankruptcyDemo = useUploadBankruptcyDemoCsv();
  const uploadAccountDemo = useUploadAccountDemoCsv();

  const request = useMemo(() => ({
    page,
    pageSize,
    search: submittedFilters.search.trim() || undefined,
    sourceSystem: submittedFilters.sourceSystem.trim() || undefined,
    sourceMode: submittedFilters.sourceMode.trim() || undefined,
    status: toNumberOrUndefined(submittedFilters.status),
    entityName: submittedFilters.entityName.trim() || undefined,
    fileName: submittedFilters.fileName.trim() || undefined,
    clientId: toNumberOrUndefined(submittedFilters.clientId)
  }), [page, submittedFilters]);

  const runsQuery = useBankruptcyImportRuns(request, hasSearch && activeTab === 'runs');
  const batchesQuery = useBankruptcyImportBatches(request, hasSearch && activeTab === 'batches');
  const errorsQuery = useBankruptcyImportErrors(request, hasSearch && activeTab === 'errors');
  const placementFilesQuery = usePlacementFiles(request, hasSearch && activeTab === 'placement');
  const ingestionQuery = useFileIngestionRun(submittedIngestionRunId);
  const dashboard = dashboardQuery.data;

  const runColumns = useMemo<ColDef<BankruptcyImportRunItem>[]>(() => [
    { headerName: 'Run', field: 'importRunId', pinned: 'left', minWidth: 120 },
    { headerName: 'Source', field: 'sourceSystem', minWidth: 160, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Mode', field: 'sourceMode', minWidth: 130, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Status', field: 'statusLabel', minWidth: 170, cellRenderer: ({ data }: { data?: BankruptcyImportRunItem }) => <StatusBadge label={data?.statusLabel ?? 'Unknown'} tone={importStatusTone(data?.status)} /> },
    { headerName: 'Files', field: 'fileCount', minWidth: 100, valueFormatter: numberFormatter },
    { headerName: 'Rows', field: 'totalRows', minWidth: 110, valueFormatter: numberFormatter },
    { headerName: 'Success', field: 'successRows', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Failed', field: 'failedRows', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Started', field: 'startedUtc', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Completed', field: 'completedUtc', minWidth: 150, valueFormatter: dateFormatter }
  ], []);

  const batchColumns = useMemo<ColDef<BankruptcyImportBatchItem>[]>(() => [
    { headerName: 'Batch', field: 'importBatchId', pinned: 'left', minWidth: 120 },
    { headerName: 'Run', field: 'importRunId', minWidth: 100, valueFormatter: numberFormatter },
    { headerName: 'Entity', field: 'entityName', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'File', field: 'fileName', minWidth: 230, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Status', field: 'statusLabel', minWidth: 170, cellRenderer: ({ data }: { data?: BankruptcyImportBatchItem }) => <StatusBadge label={data?.statusLabel ?? 'Unknown'} tone={importStatusTone(data?.status)} /> },
    { headerName: 'Rows', field: 'totalRows', minWidth: 110, valueFormatter: numberFormatter },
    { headerName: 'Success', field: 'successRows', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Failed', field: 'failedRows', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Processed', field: 'processedUtc', minWidth: 150, valueFormatter: dateFormatter }
  ], []);

  const errorColumns = useMemo<ColDef<BankruptcyImportErrorItem>[]>(() => [
    { headerName: 'Error', field: 'importErrorId', pinned: 'left', minWidth: 110 },
    { headerName: 'Entity', field: 'entityName', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'File', field: 'fileName', minWidth: 220, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Row', field: 'rowNumber', minWidth: 100, valueFormatter: numberFormatter },
    { headerName: 'Code', field: 'errorCode', minWidth: 140, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Message', field: 'errorMessage', minWidth: 360, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Created', field: 'createdUtc', minWidth: 150, valueFormatter: dateFormatter }
  ], []);

  const placementColumns = useMemo<ColDef<PlacementFileItem>[]>(() => [
    { headerName: 'File', field: 'fileName', pinned: 'left', minWidth: 250, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Client', field: 'clientName', minWidth: 180, valueFormatter: ({ value, data }) => value || data?.clientId || '-' },
    { headerName: 'Status', field: 'statusLabel', minWidth: 170, cellRenderer: ({ data }: { data?: PlacementFileItem }) => <StatusBadge label={data?.statusLabel ?? 'Unknown'} tone={importStatusTone(data?.status)} /> },
    { headerName: 'Rows', field: 'totalRows', minWidth: 110, valueFormatter: numberFormatter },
    { headerName: 'Accepted', field: 'acceptedRows', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Rejected', field: 'rejectedRows', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Uploaded By', field: 'uploadedBy', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Uploaded', field: 'uploadedOnUtc', minWidth: 150, valueFormatter: dateFormatter }
  ], []);

  const activeQuery = activeTab === 'runs' ? runsQuery : activeTab === 'batches' ? batchesQuery : activeTab === 'errors' ? errorsQuery : placementFilesQuery;
  const totalPages = Math.max(1, Math.ceil((activeQuery.data?.totalCount ?? 0) / pageSize));

  const submitSearch = () => {
    setPage(1);
    setSubmittedFilters(filters);
    setHasSearch(true);
  };

  const uploadPlacementFile = () => {
    const clientId = Number(placementUpload.clientId);
    if (!Number.isFinite(clientId) || !placementUpload.file) return;
    uploadPlacement.mutate({ clientId, uploadedBy: placementUpload.uploadedBy || 'UI User', file: placementUpload.file });
  };

  const uploadBankruptcyBundle = () => {
    const { courtFile, trusteeFile, attorneyFile, bankruptcyFile, debtorFile, debtorAddressFile } = bankruptcyFiles;
    if (!courtFile || !trusteeFile || !attorneyFile || !bankruptcyFile || !debtorFile || !debtorAddressFile) return;
    uploadBankruptcyDemo.mutate({ courtFile, trusteeFile, attorneyFile, bankruptcyFile, debtorFile, debtorAddressFile });
  };

  const uploadAccountBundle = () => {
    const { accountFile, contactFile, activeBankruptcyFile, contactOIBankruptcyFile } = accountFiles;
    if (!accountFile || !contactFile || !activeBankruptcyFile || !contactOIBankruptcyFile) return;
    uploadAccountDemo.mutate({ accountFile, contactFile, activeBankruptcyFile, contactOIBankruptcyFile });
  };

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div> 
          <h1>Enterprise Import & File Operations</h1>
          <p>Operate G2, bankruptcy reference imports, placement files, ingestion run lookup, and demo CSV upload bundles from one governed workspace.</p>
        </div>
        <div className="hero-actions">
          <Button onClick={() => runG2.mutate({ triggeredBy: 'UI User' })} disabled={runG2.isPending}>
            <PlayCircle size={16} /> Run G2 Import
          </Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<FolderSync size={20} />} label="G2 Pending Files" value={dashboard?.g2PendingFiles ?? 0} helper="Awaiting processing" />
        <StatCard icon={<DatabaseZap size={20} />} label="G2 Processed Today" value={dashboard?.g2ProcessedToday ?? 0} helper="Daily import throughput" />
        <StatCard icon={<FileInput size={20} />} label="BK Runs Today" value={dashboard?.bankruptcyRunsToday ?? 0} helper="Reference data movement" />
        <StatCard icon={<FileWarning size={20} />} label="Open Import Errors" value={dashboard?.importErrorsOpen ?? 0} helper="Needs remediation" />
        <StatCard icon={<UploadCloud size={20} />} label="Placement Files Pending" value={dashboard?.placementFilesPending ?? 0} helper="Client upload queue" />
        <StatCard icon={<FolderSync size={20} />} label="Active Ingestion Runs" value={dashboard?.ingestionRunsActive ?? 0} helper="File processing" />
      </div>

      <section className="workspace-card">
        <div className="workspace-tabs">
          {([
            ['g2', 'G2 Control'],
            ['runs', 'Import Runs'],
            ['batches', 'Import Batches'],
            ['errors', 'Import Errors'],
            ['placement', 'Placement Files'],
            ['dev', 'Demo CSV Uploads']
          ] as [TabKey, string][]).map(([key, label]) => (
            <button key={key} className={activeTab === key ? 'active' : ''} type="button" onClick={() => { setActiveTab(key); setPage(1); }}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'g2' && (
          <div className="workspace-two-column">
            <div className="workspace-panel">
              <h3>G2 Daily Import</h3>
              <p className="workspace-muted">Runs the backend G2 source ingestion endpoint. The provider can deliver partial file sets, so the operation should process whatever has arrived and leave missing files for the next run.</p>
              <Button onClick={() => runG2.mutate({ triggeredBy: 'UI User' })} disabled={runG2.isPending}>Run Import Now</Button>
            </div>
            <div className="workspace-panel">
              <h3>File Ingestion Run Lookup</h3>
              <div className="form-grid form-grid--compact">
                <label>
                  Ingestion Run ID
                  <input value={ingestionRunId} onChange={(event) => setIngestionRunId(event.target.value)} placeholder="Example: 1024" />
                </label>
                <div className="form-actions-inline">
                  <Button variant="secondary" onClick={() => setSubmittedIngestionRunId(toNumberOrUndefined(ingestionRunId))}>Lookup</Button>
                </div>
              </div>
              <pre className="json-preview">{ingestionQuery.data ? JSON.stringify(ingestionQuery.data, null, 2) : 'No ingestion run loaded.'}</pre>
            </div>
          </div>
        )}

        {activeTab !== 'g2' && activeTab !== 'dev' && (
          <>
            <div className="filter-bar filter-bar--dense">
              <div className="filter-input">
                <Search size={16} />
                <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search" />
              </div>
              <input value={filters.sourceSystem} onChange={(event) => setFilters((current) => ({ ...current, sourceSystem: event.target.value }))} placeholder="Source system" />
              {activeTab === 'runs' && <input value={filters.sourceMode} onChange={(event) => setFilters((current) => ({ ...current, sourceMode: event.target.value }))} placeholder="Source mode" />}
              {activeTab === 'errors' && <input value={filters.entityName} onChange={(event) => setFilters((current) => ({ ...current, entityName: event.target.value }))} placeholder="Entity" />}
              {activeTab === 'errors' && <input value={filters.fileName} onChange={(event) => setFilters((current) => ({ ...current, fileName: event.target.value }))} placeholder="File name" />}
              {activeTab === 'placement' && <input value={filters.clientId} onChange={(event) => setFilters((current) => ({ ...current, clientId: event.target.value }))} placeholder="Client ID" />}
              <input value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value === '' ? '' : Number(event.target.value) }))} placeholder="Status" />
              <Button onClick={submitSearch}>Search</Button>
            </div>

            {activeTab === 'runs' && <EnterpriseGrid rows={runsQuery.data?.items ?? []} columns={runColumns} isLoading={runsQuery.isFetching} height={520} />}
            {activeTab === 'batches' && <EnterpriseGrid rows={batchesQuery.data?.items ?? []} columns={batchColumns} isLoading={batchesQuery.isFetching} height={520} />}
            {activeTab === 'errors' && <EnterpriseGrid rows={errorsQuery.data?.items ?? []} columns={errorColumns} isLoading={errorsQuery.isFetching} height={520} />}
            {activeTab === 'placement' && (
              <>
                <div className="workspace-panel workspace-panel--inline">
                  <h3>Placement Import</h3>
                  <p className="workspace-muted">Upload client placement inventory using POST /api/v1/placement/import/upload. This is the business placement import, not a demo upload.</p>
                  <input value={placementUpload.clientId} onChange={(event) => setPlacementUpload((current) => ({ ...current, clientId: event.target.value }))} placeholder="Client ID" />
                  <input value={placementUpload.uploadedBy} onChange={(event) => setPlacementUpload((current) => ({ ...current, uploadedBy: event.target.value }))} placeholder="Uploaded by" />
                  <input type="file" onChange={(event) => setPlacementUpload((current) => ({ ...current, file: pickFile(event.target.files) }))} />
                  <Button disabled={uploadPlacement.isPending || !placementUpload.file || !placementUpload.clientId} onClick={uploadPlacementFile}>Upload</Button>
                </div>
                <EnterpriseGrid rows={placementFilesQuery.data?.items ?? []} columns={placementColumns} isLoading={placementFilesQuery.isFetching} height={480} />
              </>
            )}

            <div className="pagination-bar">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
              <span>Page {page} of {totalPages}</span>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </>
        )}

        {/* {activeTab === 'dev' && (
          <div className="workspace-two-column">
            <div className="workspace-panel">
              <h3>Bankruptcy Demo CSV Bundle</h3>
              {['courtFile', 'trusteeFile', 'attorneyFile', 'bankruptcyFile', 'debtorFile', 'debtorAddressFile'].map((key) => (
                <label key={key}>
                  {key}
                  <input type="file" onChange={(event) => setBankruptcyFiles((current) => ({ ...current, [key]: pickFile(event.target.files) }))} />
                </label>
              ))}
              <Button disabled={uploadBankruptcyDemo.isPending} onClick={uploadBankruptcyBundle}>Upload Bankruptcy Bundle</Button>
            </div>
            <div className="workspace-panel">
              <h3>Accounts Demo CSV Bundle</h3>
              {['accountFile', 'contactFile', 'activeBankruptcyFile', 'contactOIBankruptcyFile'].map((key) => (
                <label key={key}>
                  {key}
                  <input type="file" onChange={(event) => setAccountFiles((current) => ({ ...current, [key]: pickFile(event.target.files) }))} />
                </label>
              ))}
              <Button disabled={uploadAccountDemo.isPending} onClick={uploadAccountBundle}>Upload Account Bundle</Button>
            </div>
          </div>
        )} */}
      </section>
    </div>
  );
}
