import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { AlertTriangle, Archive, CalendarClock, FileDown, FileSpreadsheet, Filter, PlayCircle, RefreshCcw, Search, ShieldCheck, UploadCloud } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { queryKeys } from '@/shared/api/queryKeys';
import { reportedBankruptcyStatusOptions, scrubRunStatusOptions, scrubStatusTone } from '../api/scrubStatusMaps';
import {
  createScrubInventory,
  exportScrubResultBatch,
  createScrubSchedule,
  deactivateScrubSchedule,
  generateScrubResponse,
  importScrubInventory,
  resolveReportedBankruptcy,
  runScrubInventory
} from '../api/scrubbingApi';
import { useReportedBankruptcies, useScrubDashboard, useScrubInventories, useScrubRuns, useScrubSchedules } from '../hooks/useScrubbing';
import type { ReportedBankruptcyItem, ScrubInventoryItem, ScrubRunItem, ScrubScheduleItem } from '../types/scrubbing';

type InventoryFilterState = {
  search: string;
  clientId: string;
  isActive: '' | 'true' | 'false';
};

type RunFilterState = {
  search: string;
  inventoryId: string;
  status: number | '';
};

type ReportedFilterState = {
  search: string;
  status: number | '';
  isOpen: '' | 'true' | 'false';
};

type ScheduleFilterState = {
  search: string;
  inventoryId: string;
  isActive: '' | 'true' | 'false';
};

const initialInventoryFilters: InventoryFilterState = { search: '', clientId: '', isActive: '' };
const initialRunFilters: RunFilterState = { search: '', inventoryId: '', status: '' };
const initialReportedFilters: ReportedFilterState = { search: '', status: '', isOpen: 'true' };
const initialScheduleFilters: ScheduleFilterState = { search: '', inventoryId: '', isActive: 'true' };

function toNumberOrUndefined(value: string | number | '') {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBooleanOrUndefined(value: '' | 'true' | 'false') {
  if (value === '') return undefined;
  return value === 'true';
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

function dateFormatter(params: { value?: string | null }) {
  return formatDate(params.value);
}

function numberFormatter(params: { value?: number | null }) {
  if (params.value === null || params.value === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(params.value);
}

export function ScrubbingOperationsWorkspacePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'inventories' | 'runs' | 'reported' | 'schedules'>('inventories');
  const [inventoryPage, setInventoryPage] = useState(1);
  const [runPage, setRunPage] = useState(1);
  const [reportedPage, setReportedPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const [inventoryFilters, setInventoryFilters] = useState<InventoryFilterState>(initialInventoryFilters);
  const [submittedInventoryFilters, setSubmittedInventoryFilters] = useState<InventoryFilterState>(initialInventoryFilters);
  const [runFilters, setRunFilters] = useState<RunFilterState>(initialRunFilters);
  const [submittedRunFilters, setSubmittedRunFilters] = useState<RunFilterState>(initialRunFilters);
  const [reportedFilters, setReportedFilters] = useState<ReportedFilterState>(initialReportedFilters);
  const [submittedReportedFilters, setSubmittedReportedFilters] = useState<ReportedFilterState>(initialReportedFilters);
  const [scheduleFilters, setScheduleFilters] = useState<ScheduleFilterState>(initialScheduleFilters);
  const [submittedScheduleFilters, setSubmittedScheduleFilters] = useState<ScheduleFilterState>(initialScheduleFilters);
  const [hasInventorySearch, setHasInventorySearch] = useState(false);
  const [hasRunSearch, setHasRunSearch] = useState(false);
  const [hasReportedSearch, setHasReportedSearch] = useState(false);
  const [hasScheduleSearch, setHasScheduleSearch] = useState(false);
  const [createForm, setCreateForm] = useState({ clientId: '', inventoryName: '', sourceSystem: 'ClientUpload' });
  const [importForm, setImportForm] = useState({ inventoryId: '', uploadedBy: 'UI User' });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [responseBatchId, setResponseBatchId] = useState('');
  const [scheduleForm, setScheduleForm] = useState({ inventoryId: '', frequency: 'Daily', nextRunUtc: '' });
  const pageSize = 25;

  const dashboardQuery = useScrubDashboard();

  const inventoryRequest = useMemo(() => ({
    page: inventoryPage,
    pageSize,
    search: submittedInventoryFilters.search.trim() || undefined,
    clientId: toNumberOrUndefined(submittedInventoryFilters.clientId),
    isActive: toBooleanOrUndefined(submittedInventoryFilters.isActive)
  }), [inventoryPage, submittedInventoryFilters]);

  const runRequest = useMemo(() => ({
    page: runPage,
    pageSize,
    search: submittedRunFilters.search.trim() || undefined,
    inventoryId: toNumberOrUndefined(submittedRunFilters.inventoryId),
    status: toNumberOrUndefined(submittedRunFilters.status)
  }), [runPage, submittedRunFilters]);

  const reportedRequest = useMemo(() => ({
    page: reportedPage,
    pageSize,
    search: submittedReportedFilters.search.trim() || undefined,
    status: toNumberOrUndefined(submittedReportedFilters.status),
    isOpen: toBooleanOrUndefined(submittedReportedFilters.isOpen)
  }), [reportedPage, submittedReportedFilters]);

  const scheduleRequest = useMemo(() => ({
    page: schedulePage,
    pageSize,
    search: submittedScheduleFilters.search.trim() || undefined,
    inventoryId: toNumberOrUndefined(submittedScheduleFilters.inventoryId),
    isActive: toBooleanOrUndefined(submittedScheduleFilters.isActive)
  }), [schedulePage, submittedScheduleFilters]);

  const inventoriesQuery = useScrubInventories(inventoryRequest, hasInventorySearch);
  const runsQuery = useScrubRuns(runRequest, hasRunSearch);
  const reportedQuery = useReportedBankruptcies(reportedRequest, hasReportedSearch);
  const schedulesQuery = useScrubSchedules(scheduleRequest, hasScheduleSearch);

  const invalidateScrub = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.scrubbing.root });
  };

  const createInventoryMutation = useMutation({ mutationFn: createScrubInventory, onSuccess: invalidateScrub });
  const importInventoryMutation = useMutation({ mutationFn: importScrubInventory, onSuccess: invalidateScrub });
  const runInventoryMutation = useMutation({ mutationFn: runScrubInventory, onSuccess: invalidateScrub });
  const generateResponseMutation = useMutation({ mutationFn: generateScrubResponse, onSuccess: invalidateScrub });
  const resolveReportedMutation = useMutation({ mutationFn: resolveReportedBankruptcy, onSuccess: invalidateScrub });
  const createScheduleMutation = useMutation({ mutationFn: createScrubSchedule, onSuccess: invalidateScrub });
  const deactivateScheduleMutation = useMutation({ mutationFn: deactivateScrubSchedule, onSuccess: invalidateScrub });

  const inventoryRows = inventoriesQuery.data?.items ?? [];
  const runRows = runsQuery.data?.items ?? [];
  const reportedRows = reportedQuery.data?.items ?? [];
  const scheduleRows = schedulesQuery.data?.items ?? [];
  const inventoryTotalPages = Math.max(1, Math.ceil((inventoriesQuery.data?.totalCount ?? 0) / pageSize));
  const runTotalPages = Math.max(1, Math.ceil((runsQuery.data?.totalCount ?? 0) / pageSize));
  const reportedTotalPages = Math.max(1, Math.ceil((reportedQuery.data?.totalCount ?? 0) / pageSize));
  const scheduleTotalPages = Math.max(1, Math.ceil((schedulesQuery.data?.totalCount ?? 0) / pageSize));
  const dashboard = dashboardQuery.data;

  const inventoryColumns = useMemo<ColDef<ScrubInventoryItem>[]>(() => [
    {
      headerName: 'Inventory',
      field: 'inventoryName',
      pinned: 'left',
      minWidth: 240,
      cellRenderer: ({ data }: { data?: ScrubInventoryItem }) => (
        <div className="grid-primary-cell">
          <strong>{data?.inventoryName ?? '-'}</strong>
          <span>{data?.sourceSystem ?? 'Source not specified'}</span>
        </div>
      )
    },
    { headerName: 'Client', field: 'clientName', minWidth: 170, valueFormatter: ({ value, data }) => value || data?.clientId || '-' },
    { headerName: 'Status', field: 'statusLabel', minWidth: 150, cellRenderer: ({ data }: { data?: ScrubInventoryItem }) => <StatusBadge label={data?.statusLabel ?? 'Unknown'} tone={scrubStatusTone(data?.status)} /> },
    { headerName: 'Version', field: 'currentVersionNumber', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Total Items', field: 'totalItems', minWidth: 130, valueFormatter: numberFormatter },
    { headerName: 'Last Run', field: 'lastRunUtc', minWidth: 150, valueFormatter: dateFormatter },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 210,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: ScrubInventoryItem }) => (
        <div className="grid-actions-cell">
          <Button variant="secondary" disabled={!data?.inventoryId || runInventoryMutation.isPending} onClick={() => data && runInventoryMutation.mutate({ inventoryId: data.inventoryId, triggeredBy: 'UI User' })}>
            Run
          </Button>
        </div>
      )
    }
  ], [runInventoryMutation]);

  const runColumns = useMemo<ColDef<ScrubRunItem>[]>(() => [
    { headerName: 'Run', field: 'runId', pinned: 'left', minWidth: 120 },
    { headerName: 'Inventory', field: 'inventoryName', minWidth: 220, valueFormatter: ({ value, data }) => value || data?.inventoryId || '-' },
    { headerName: 'Version', field: 'versionNumber', minWidth: 110, valueFormatter: numberFormatter },
    { headerName: 'Status', field: 'statusLabel', minWidth: 160, cellRenderer: ({ data }: { data?: ScrubRunItem }) => <StatusBadge label={data?.statusLabel ?? 'Unknown'} tone={scrubStatusTone(data?.status)} /> },
    { headerName: 'Items', field: 'totalItems', minWidth: 110, valueFormatter: numberFormatter },
    { headerName: 'Matched', field: 'matchedItems', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Reported', field: 'reportedItems', minWidth: 120, valueFormatter: numberFormatter },
    { headerName: 'Started', field: 'startedOnUtc', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Completed', field: 'completedOnUtc', minWidth: 150, valueFormatter: dateFormatter },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 260,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: ScrubRunItem }) => (
        <div className="grid-actions-cell">
          <Button variant="secondary" disabled={!data?.resultBatchId || generateResponseMutation.isPending} onClick={() => data?.resultBatchId && generateResponseMutation.mutate({ batchId: data.resultBatchId, generatedBy: 'UI User' })}>
            Response
          </Button>
          <Button variant="secondary" disabled={!data?.resultBatchId} onClick={() => data?.resultBatchId && downloadBatch(data.resultBatchId)}>
            Export
          </Button>
        </div>
      )
    }
  ], [generateResponseMutation]);

  const reportedColumns = useMemo<ColDef<ReportedBankruptcyItem>[]>(() => [
    { headerName: 'Reported #', field: 'reportedBankruptcyId', pinned: 'left', minWidth: 130 },
    {
      headerName: 'Debtor / Account',
      field: 'debtorName',
      minWidth: 240,
      cellRenderer: ({ data }: { data?: ReportedBankruptcyItem }) => (
        <div className="grid-primary-cell">
          <strong>{data?.debtorName ?? '-'}</strong>
          <span>{data?.accountNumber ?? 'Account not available'}</span>
        </div>
      )
    },
    { headerName: 'Case #', field: 'bankruptcyCaseNumber', minWidth: 170, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Court', field: 'courtName', minWidth: 220, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Status', field: 'statusLabel', minWidth: 160, cellRenderer: ({ data }: { data?: ReportedBankruptcyItem }) => <StatusBadge label={data?.statusLabel ?? 'Unknown'} tone={scrubStatusTone(data?.status)} /> },
    { headerName: 'Report Count', field: 'reportCount', minWidth: 130, valueFormatter: numberFormatter },
    { headerName: 'First Reported', field: 'firstReportedUtc', minWidth: 160, valueFormatter: dateFormatter },
    { headerName: 'Last Reported', field: 'lastReportedUtc', minWidth: 160, valueFormatter: dateFormatter },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 170,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: ReportedBankruptcyItem }) => (
        <div className="grid-actions-cell">
          <Button variant="secondary" disabled={!data?.reportedBankruptcyId || resolveReportedMutation.isPending} onClick={() => data && resolveReportedMutation.mutate({ reportedBankruptcyId: data.reportedBankruptcyId, resolvedBy: 'UI User', notes: 'Resolved from Scrubbing Workspace' })}>
            Resolve
          </Button>
        </div>
      )
    }
  ], [resolveReportedMutation]);



  const scheduleColumns = useMemo<ColDef<ScrubScheduleItem>[]>(() => [
    { headerName: 'Schedule #', field: 'scheduleId', pinned: 'left', minWidth: 130 },
    { headerName: 'Inventory', field: 'inventoryName', minWidth: 220, valueFormatter: ({ value, data }) => value || data?.inventoryId || '-' },
    { headerName: 'Frequency', field: 'frequency', minWidth: 140, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Next Run', field: 'nextRunUtc', minWidth: 170, valueFormatter: dateFormatter },
    { headerName: 'Active', field: 'isActive', minWidth: 120, cellRenderer: ({ data }: { data?: ScrubScheduleItem }) => <StatusBadge label={data?.isActive === false ? 'Inactive' : 'Active'} tone={data?.isActive === false ? 'neutral' : 'success'} /> },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 170,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: ScrubScheduleItem }) => (
        <div className="grid-actions-cell">
          <Button variant="secondary" disabled={!data?.scheduleId || data?.isActive === false || deactivateScheduleMutation.isPending} onClick={() => data?.scheduleId && deactivateScheduleMutation.mutate(data.scheduleId)}>
            Deactivate
          </Button>
        </div>
      )
    }
  ], [deactivateScheduleMutation]);

  async function downloadBatch(batchId: number) {
    const blob = await exportScrubResultBatch(batchId, 'csv');
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scrub-result-batch-${batchId}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="enterprise-page scrubbing-page">
      <section className="placement-hero xocket-card scrubbing-hero">
        <div> 
          <h1>Scrubbing Operations Workspace</h1>
          <p>Manage inventory versions, run bankruptcy scrubs, generate responses, and review reported bankruptcies.</p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => invalidateScrub()}><RefreshCcw size={16} /> Refresh</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<Archive size={22} />} value={dashboard?.inventoryCount ?? 0} label="Inventories" helper="Total available" tone="primary" />
        <StatCard icon={<PlayCircle size={22} />} value={dashboard?.runningRuns ?? 0} label="Running" helper="Active scrub runs" tone="info" />
        <StatCard icon={<ShieldCheck size={22} />} value={dashboard?.completedRuns ?? 0} label="Completed" helper="Completed runs" tone="success" />
        <StatCard icon={<AlertTriangle size={22} />} value={dashboard?.reportedOpen ?? 0} label="Reported Open" helper="Needs review" tone="warning" />
        <StatCard icon={<FileDown size={22} />} value={dashboard?.responseReady ?? 0} label="Responses" helper="Ready/exportable" tone="primary" />
      </div>

      <section className="document-workspace-panel scrubbing-production-panel">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Today's Work</span>
            <h2>Inventory Production</h2>
            <p>Create inventory, import a versioned file, run scrub, and generate response output from one aligned workspace.</p>
          </div>
        </div>
        <div className="document-actions-layout document-actions-layout-polished">
          <section className="enterprise-card document-action-tile">
            <div className="document-action-tile-header">
              <div className="document-action-icon"><FileSpreadsheet size={20} /></div>
              <div><h3>Create Inventory</h3><p>Register a new client inventory before importing file versions.</p></div>
            </div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Client Id</span><input className="evictsure-form-input" value={createForm.clientId} onChange={(e) => setCreateForm((c) => ({ ...c, clientId: e.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Inventory Name</span><input className="evictsure-form-input" value={createForm.inventoryName} onChange={(e) => setCreateForm((c) => ({ ...c, inventoryName: e.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Source System</span><input className="evictsure-form-input" value={createForm.sourceSystem} onChange={(e) => setCreateForm((c) => ({ ...c, sourceSystem: e.target.value }))} /></label>
            </div>
            <div className="document-action-footer">
              <span className="workspace-muted">Inventory creation is metadata-only.</span>
              <Button disabled={!toNumberOrUndefined(createForm.clientId) || !createForm.inventoryName.trim() || createInventoryMutation.isPending} onClick={() => createInventoryMutation.mutate({ clientId: toNumberOrUndefined(createForm.clientId) ?? 0, inventoryName: createForm.inventoryName, sourceSystem: createForm.sourceSystem })}>Create</Button>
            </div>
          </section>

          <section className="enterprise-card document-action-tile">
            <div className="document-action-tile-header">
              <div className="document-action-icon"><UploadCloud size={20} /></div>
              <div><h3>Import Version</h3><p>Upload a file into an existing inventory as a new immutable version.</p></div>
            </div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Inventory Id</span><input className="evictsure-form-input" value={importForm.inventoryId} onChange={(e) => setImportForm((c) => ({ ...c, inventoryId: e.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Uploaded By</span><input className="evictsure-form-input" value={importForm.uploadedBy} onChange={(e) => setImportForm((c) => ({ ...c, uploadedBy: e.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">File</span><input className="evictsure-form-input" type="file" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} /></label>
            </div>
            <div className="document-action-footer">
              <span className="workspace-muted">{importFile?.name ?? 'No file selected'}</span>
              <Button disabled={!importFile || !toNumberOrUndefined(importForm.inventoryId) || !importForm.uploadedBy.trim() || importInventoryMutation.isPending} onClick={() => importFile && importInventoryMutation.mutate({ inventoryId: toNumberOrUndefined(importForm.inventoryId) ?? 0, uploadedBy: importForm.uploadedBy, file: importFile })}>Import</Button>
            </div>
          </section>
        </div>
      </section>

      <section className="enterprise-card scrubbing-tabs-card">
        <div className="account-workspace-tabs">
          <button className={activeTab === 'inventories' ? 'active' : ''} onClick={() => setActiveTab('inventories')}>Inventories</button>
          <button className={activeTab === 'runs' ? 'active' : ''} onClick={() => setActiveTab('runs')}>Runs & Responses</button>
          <button className={activeTab === 'reported' ? 'active' : ''} onClick={() => setActiveTab('reported')}>Reported Bankruptcies</button>
          <button className={activeTab === 'schedules' ? 'active' : ''} onClick={() => setActiveTab('schedules')}>Schedules</button>
        </div>
      </section>

      {activeTab === 'inventories' ? (
        <section className="xocket-card placement-filter-card">
          <div className="placement-filter-row">
            <div className="placement-search-box"><Search size={18} /><input value={inventoryFilters.search} onChange={(event) => setInventoryFilters((current) => ({ ...current, search: event.target.value }))} onKeyDown={(event) => event.key === 'Enter' && submitInventorySearch()} placeholder="Search inventory name or source..." /></div>
            <input className="placement-select" value={inventoryFilters.clientId} onChange={(event) => setInventoryFilters((current) => ({ ...current, clientId: event.target.value }))} placeholder="Client Id" />
            <select className="placement-select" value={inventoryFilters.isActive} onChange={(event) => setInventoryFilters((current) => ({ ...current, isActive: event.target.value as InventoryFilterState['isActive'] }))}><option value="">All</option><option value="true">Active</option><option value="false">Inactive</option></select>
            <Button onClick={submitInventorySearch}><Search size={16} /> Search</Button>
            <Button variant="secondary" onClick={() => { setInventoryFilters(initialInventoryFilters); setSubmittedInventoryFilters(initialInventoryFilters); setHasInventorySearch(false); setInventoryPage(1); }}><Filter size={16} /> Clear</Button>
          </div>
          {renderGrid('Inventory Library', hasInventorySearch, inventoriesQuery.isError, inventoriesQuery.isFetching, inventoryRows, inventoryColumns, inventoriesQuery.data?.totalCount ?? 0, inventoryPage, inventoryTotalPages, setInventoryPage, 'Search before loading inventories.')}
        </section>
      ) : null}

      {activeTab === 'runs' ? (
        <section className="xocket-card placement-filter-card">
          <div className="placement-filter-row">
            <div className="placement-search-box"><Search size={18} /><input value={runFilters.search} onChange={(event) => setRunFilters((current) => ({ ...current, search: event.target.value }))} onKeyDown={(event) => event.key === 'Enter' && submitRunSearch()} placeholder="Search scrub runs..." /></div>
            <input className="placement-select" value={runFilters.inventoryId} onChange={(event) => setRunFilters((current) => ({ ...current, inventoryId: event.target.value }))} placeholder="Inventory Id" />
            <select className="placement-select" value={runFilters.status} onChange={(event) => setRunFilters((current) => ({ ...current, status: event.target.value === '' ? '' : Number(event.target.value) }))}><option value="">All statuses</option>{scrubRunStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            <Button onClick={submitRunSearch}><Search size={16} /> Search</Button>
            <Button variant="secondary" onClick={() => { setRunFilters(initialRunFilters); setSubmittedRunFilters(initialRunFilters); setHasRunSearch(false); setRunPage(1); }}><Filter size={16} /> Clear</Button>
            <input className="placement-select" value={responseBatchId} onChange={(event) => setResponseBatchId(event.target.value)} placeholder="Batch Id" />
            <Button variant="secondary" disabled={!toNumberOrUndefined(responseBatchId) || generateResponseMutation.isPending} onClick={() => generateResponseMutation.mutate({ batchId: toNumberOrUndefined(responseBatchId) ?? 0, generatedBy: 'UI User' })}>Generate Response</Button>
          </div>
          {renderGrid('Scrub Runs', hasRunSearch, runsQuery.isError, runsQuery.isFetching, runRows, runColumns, runsQuery.data?.totalCount ?? 0, runPage, runTotalPages, setRunPage, 'Search before loading scrub runs.')}
        </section>
      ) : null}

      {activeTab === 'reported' ? (
        <section className="xocket-card placement-filter-card">
          <div className="placement-filter-row">
            <div className="placement-search-box"><Search size={18} /><input value={reportedFilters.search} onChange={(event) => setReportedFilters((current) => ({ ...current, search: event.target.value }))} onKeyDown={(event) => event.key === 'Enter' && submitReportedSearch()} placeholder="Search debtor, account, case..." /></div>
            <select className="placement-select" value={reportedFilters.status} onChange={(event) => setReportedFilters((current) => ({ ...current, status: event.target.value === '' ? '' : Number(event.target.value) }))}><option value="">All statuses</option>{reportedBankruptcyStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            <select className="placement-select" value={reportedFilters.isOpen} onChange={(event) => setReportedFilters((current) => ({ ...current, isOpen: event.target.value as ReportedFilterState['isOpen'] }))}><option value="">All</option><option value="true">Open</option><option value="false">Closed</option></select>
            <Button onClick={submitReportedSearch}><Search size={16} /> Search</Button>
            <Button variant="secondary" onClick={() => { setReportedFilters(initialReportedFilters); setSubmittedReportedFilters(initialReportedFilters); setHasReportedSearch(false); setReportedPage(1); }}><Filter size={16} /> Clear</Button>
          </div>
          {renderGrid('Reported Bankruptcies', hasReportedSearch, reportedQuery.isError, reportedQuery.isFetching, reportedRows, reportedColumns, reportedQuery.data?.totalCount ?? 0, reportedPage, reportedTotalPages, setReportedPage, 'Search before loading reported bankruptcies.')}
        </section>
      ) : null}

      {activeTab === 'schedules' ? (
        <section className="xocket-card placement-filter-card">
          <div className="placement-filter-row">
            <div className="placement-search-box"><Search size={18} /><input value={scheduleFilters.search} onChange={(event) => setScheduleFilters((current) => ({ ...current, search: event.target.value }))} onKeyDown={(event) => event.key === 'Enter' && submitScheduleSearch()} placeholder="Search schedules..." /></div>
            <input className="placement-select" value={scheduleFilters.inventoryId} onChange={(event) => setScheduleFilters((current) => ({ ...current, inventoryId: event.target.value }))} placeholder="Inventory Id" />
            <select className="placement-select" value={scheduleFilters.isActive} onChange={(event) => setScheduleFilters((current) => ({ ...current, isActive: event.target.value as ScheduleFilterState['isActive'] }))}><option value="">All</option><option value="true">Active</option><option value="false">Inactive</option></select>
            <Button onClick={submitScheduleSearch}><Search size={16} /> Search</Button>
            <Button variant="secondary" onClick={() => { setScheduleFilters(initialScheduleFilters); setSubmittedScheduleFilters(initialScheduleFilters); setHasScheduleSearch(false); setSchedulePage(1); }}><Filter size={16} /> Clear</Button>
          </div>
          <div className="placement-filter-row">
            <CalendarClock size={18} />
            <input className="placement-select" value={scheduleForm.inventoryId} onChange={(event) => setScheduleForm((current) => ({ ...current, inventoryId: event.target.value }))} placeholder="Inventory Id" />
            <select className="placement-select" value={scheduleForm.frequency} onChange={(event) => setScheduleForm((current) => ({ ...current, frequency: event.target.value }))}><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
            <input className="placement-select" type="datetime-local" value={scheduleForm.nextRunUtc} onChange={(event) => setScheduleForm((current) => ({ ...current, nextRunUtc: event.target.value }))} />
            <Button disabled={!toNumberOrUndefined(scheduleForm.inventoryId) || !scheduleForm.nextRunUtc || createScheduleMutation.isPending} onClick={() => createScheduleMutation.mutate({ inventoryId: toNumberOrUndefined(scheduleForm.inventoryId) ?? 0, frequency: scheduleForm.frequency, nextRunUtc: new Date(scheduleForm.nextRunUtc).toISOString() })}>Create Schedule</Button>
          </div>
          {renderGrid('Scrub Schedules', hasScheduleSearch, schedulesQuery.isError, schedulesQuery.isFetching, scheduleRows, scheduleColumns, schedulesQuery.data?.totalCount ?? 0, schedulePage, scheduleTotalPages, setSchedulePage, 'Search before loading scrub schedules.')}
        </section>
      ) : null}
    </div>
  );

  function submitInventorySearch() {
    setInventoryPage(1);
    setSubmittedInventoryFilters(inventoryFilters);
    setHasInventorySearch(true);
  }

  function submitRunSearch() {
    setRunPage(1);
    setSubmittedRunFilters(runFilters);
    setHasRunSearch(true);
  }

  function submitReportedSearch() {
    setReportedPage(1);
    setSubmittedReportedFilters(reportedFilters);
    setHasReportedSearch(true);
  }

  function submitScheduleSearch() {
    setSchedulePage(1);
    setSubmittedScheduleFilters(scheduleFilters);
    setHasScheduleSearch(true);
  }
}

function renderGrid<T extends object>(
  title: string,
  hasSearch: boolean,
  isError: boolean,
  isFetching: boolean,
  rows: T[],
  columns: ColDef<T>[],
  totalCount: number,
  page: number,
  totalPages: number,
  setPage: (updater: (current: number) => number) => void,
  emptyPrompt: string
) {
  return (
    <section className="placement-grid-card scrubbing-grid-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">{title}</h2>
          <p className="xocket-card-subtitle">Server-side search and pagination only.</p>
        </div>
        <span className="xocket-pill">{totalCount} records</span>
      </div>

      {!hasSearch ? (
        <div className="placement-empty-business">{emptyPrompt} Large datasets are never loaded automatically.</div>
      ) : isError ? (
        <div className="xocket-alert xocket-alert-danger">Unable to load {title.toLowerCase()}.</div>
      ) : (
        <>
          <EnterpriseGrid rows={rows} columns={columns} isLoading={isFetching} height={520} emptyMessage={`No ${title.toLowerCase()} matched the current filters.`} />
          <div className="placement-pagination-bar">
            <span>Page {page} of {totalPages}</span>
            <div>
              <Button variant="secondary" disabled={page <= 1 || isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
              <Button variant="secondary" disabled={page >= totalPages || isFetching} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
