import { useMemo, useState } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
  BadgeCheck,
  ClipboardList,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Gavel,
  RefreshCcw,
  Search,
  Send,
  UploadCloud,
  UserCheck
} from 'lucide-react';

import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { Button } from '@/shared/components/Button';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { usePlacementAccounts } from '../hooks/usePlacementAccounts';
import { usePlacementDashboard } from '../hooks/usePlacementDashboard';
import { placementQueueStatusOptions } from '../api/placementStatusMaps';
import type { PlacementAccount, PlacementQueueRequest } from '../types/placement';

type FilingOperationsQueuePageProps = {
  onOpenPlacementAccount?: (placementAccountId: number) => void;
};

type FilingQueuePreset = 'ready-poc' | 'filed' | 'exceptions' | 'all';

type FilterState = {
  search: string;
  queueStatus: number | '';
  filerUserId: string;
  courtId: string;
};

const pageSize = 25;
const readyForPocStatus = 4;
const filedStatus = 5;
const exceptionStatus = 7;

const initialFilters: FilterState = {
  search: '',
  queueStatus: readyForPocStatus,
  filerUserId: '',
  courtId: ''
};

function numberOrUndefined(value: string | number | '') {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const currencyFormatter = (params: ValueFormatterParams<PlacementAccount, number | null | undefined>) => {
  if (params.value === null || params.value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(params.value);
};

const dateFormatter = (params: ValueFormatterParams<PlacementAccount, string | null | undefined>) => {
  if (!params.value) return '-';
  const date = new Date(params.value);
  if (Number.isNaN(date.getTime())) return params.value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
};

function getQueuePresetFilter(preset: FilingQueuePreset): number | '' {
  switch (preset) {
    case 'ready-poc':
      return readyForPocStatus;
    case 'filed':
      return filedStatus;
    case 'exceptions':
      return exceptionStatus;
    default:
      return '';
  }
}

function openPlacement(onOpenPlacementAccount: FilingOperationsQueuePageProps['onOpenPlacementAccount'], row?: PlacementAccount) {
  const placementAccountId = row?.placementAccountId ?? row?.id ?? 0;
  if (placementAccountId > 0) {
    onOpenPlacementAccount?.(placementAccountId);
  }
}

export function FilingOperationsQueuePage({ onOpenPlacementAccount }: FilingOperationsQueuePageProps) {
  const [page, setPage] = useState(1);
  const [preset, setPreset] = useState<FilingQueuePreset>('ready-poc');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<FilterState>(initialFilters);
  const [hasLoaded, setHasLoaded] = useState(true);

  const request = useMemo<PlacementQueueRequest>(() => ({
    page,
    pageSize,
    search: submittedFilters.search.trim() || undefined,
    queueStatus: numberOrUndefined(submittedFilters.queueStatus),
    courtId: numberOrUndefined(submittedFilters.courtId),
    filerUserId: submittedFilters.filerUserId.trim() || undefined
  }), [page, submittedFilters]);

  const queueQuery = usePlacementAccounts(request, hasLoaded);
  const dashboardQuery = usePlacementDashboard();
  const rows = queueQuery.data?.items ?? [];
  const totalCount = queueQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const dashboard = dashboardQuery.data;

  const applyPreset = (nextPreset: FilingQueuePreset) => {
    const queueStatus = getQueuePresetFilter(nextPreset);
    const nextFilters: FilterState = { ...initialFilters, queueStatus };
    setPreset(nextPreset);
    setFilters(nextFilters);
    setSubmittedFilters(nextFilters);
    setPage(1);
    setHasLoaded(true);
  };

  const submitSearch = () => {
    setSubmittedFilters(filters);
    setPage(1);
    setHasLoaded(true);
  };

  const columns = useMemo<ColDef<PlacementAccount>[]>(() => [
    {
      headerName: 'Placement / Account',
      field: 'accountNumber',
      pinned: 'left',
      minWidth: 210,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => (
        <button className="grid-link-cell" type="button" onClick={() => openPlacement(onOpenPlacementAccount, data)}>
          <strong>{data?.accountNumber ?? `Placement #${data?.placementAccountId ?? data?.id ?? '-'}`}</strong>
          <span>{data?.clientName ?? 'Client not returned'}</span>
        </button>
      )
    },
    {
      headerName: 'Debtor',
      field: 'debtorName',
      minWidth: 220,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Court / Case',
      field: 'bankruptcyCourt',
      minWidth: 260,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => (
        <div className="grid-primary-cell">
          <strong>{data?.bankruptcyCourt ?? '-'}</strong>
          <span>{data?.bankruptcyCaseNumber ?? 'Case not returned'}</span>
        </div>
      )
    },
    {
      headerName: 'Queue',
      field: 'queueStatus',
      minWidth: 165,
      cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Open'} />
    },
    {
      headerName: 'Filer',
      field: 'filerUserId',
      minWidth: 190,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Claim Amount',
      field: 'claimAmount',
      type: 'numericColumn',
      minWidth: 150,
      valueFormatter: currencyFormatter
    },
    {
      headerName: 'Placed',
      field: 'placedOnUtc',
      minWidth: 145,
      valueFormatter: dateFormatter
    },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 250,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => (
        <div className="table-actions filing-queue-actions">
          <button className="xocket-btn-icon btn-view" type="button" onClick={() => openPlacement(onOpenPlacementAccount, data)}>Open</button>
          <button className="xocket-btn-icon btn-edit" type="button" onClick={() => openPlacement(onOpenPlacementAccount, data)}>Filing</button>
          <button className="xocket-btn-icon btn-export" type="button" onClick={() => openPlacement(onOpenPlacementAccount, data)}>Receipt</button>
        </div>
      )
    }
  ], [onOpenPlacementAccount]);

  return (
    <div className="placement-page filing-operations-page">
      <section className="placement-hero xocket-card">
        <div>
          <span className="xocket-pill xocket-pill-primary">LP-03</span>
          <h1>Filing Operations</h1>
          <p>
            Legacy filing queue for accounts that are ready for POC generation, external court filing, receipt capture, and completion.
          </p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => void queueQuery.refetch()}><RefreshCcw size={16} /> Refresh</Button>
          <Button variant="secondary" disabled><Download size={16} /> Export</Button>
          <Button disabled><Send size={16} /> Bulk Submit</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<FileCheck2 size={22} />} value={dashboard?.readyForPoc ?? 0} label="Ready for POC" helper="queueStatus 4" tone="success" />
        <StatCard icon={<Gavel size={22} />} value={dashboard?.readyToFile ?? 0} label="Ready to File" helper="dashboard value if returned" tone="primary" />
        <StatCard icon={<UploadCloud size={22} />} value="Needs API" label="Receipt Pending" helper="No explicit receipt-pending endpoint/status" tone="warning" />
        <StatCard icon={<BadgeCheck size={22} />} value={dashboard?.completedToday ?? 0} label="Completed Today" helper="dashboard aggregate" tone="info" />
        <StatCard icon={<ClipboardList size={22} />} value={totalCount} label="Current Queue" helper="server-side result count" tone="primary" />
        <StatCard icon={<UserCheck size={22} />} value={submittedFilters.filerUserId || 'All'} label="Filer Filter" helper="uses filerUserId query" tone="info" />
      </div>

      <section className="xocket-card filing-queue-board">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Filing Queue Switcher</h2>
            <p className="xocket-card-subtitle">Only uses queueStatus values exposed by the placement queue API. Receipt Pending is documented as a backend gap.</p>
          </div>
          <span className="xocket-pill">{totalCount} records</span>
        </div>
        <div className="filing-queue-tabs">
          <button className={`filing-queue-tab ${preset === 'ready-poc' ? 'active' : ''}`} type="button" onClick={() => applyPreset('ready-poc')}>
            <FileText size={18} />
            <strong>Ready for POC</strong>
            <span>Generate package / upload documents</span>
          </button>
          <button className={`filing-queue-tab ${preset === 'filed' ? 'active' : ''}`} type="button" onClick={() => applyPreset('filed')}>
            <ExternalLink size={18} />
            <strong>Filed / Receipt Work</strong>
            <span>Uses Filed queue until receipt status exists</span>
          </button>
          <button className={`filing-queue-tab ${preset === 'exceptions' ? 'active' : ''}`} type="button" onClick={() => applyPreset('exceptions')}>
            <Gavel size={18} />
            <strong>Filing Exceptions</strong>
            <span>Operational blockers</span>
          </button>
          <button className={`filing-queue-tab ${preset === 'all' ? 'active' : ''}`} type="button" onClick={() => applyPreset('all')}>
            <ClipboardList size={18} />
            <strong>All Filing-Related</strong>
            <span>Manual status filter below</span>
          </button>
        </div>
      </section>

      <section className="xocket-card placement-toolbar-card">
        <div className="placement-toolbar placement-toolbar-advanced">
          <div className="placement-search-box">
            <Search size={18} />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }}
              placeholder="Search filing queue by account, debtor, case, court"
            />
          </div>
          <select
            className="placement-select"
            value={filters.queueStatus}
            onChange={(event) => setFilters((current) => ({ ...current, queueStatus: event.target.value === '' ? '' : Number(event.target.value) }))}
            aria-label="Queue status"
          >
            <option value="">All queue statuses</option>
            {placementQueueStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input
            className="placement-select"
            value={filters.filerUserId}
            onChange={(event) => setFilters((current) => ({ ...current, filerUserId: event.target.value }))}
            placeholder="Filer user id"
          />
          <input
            className="placement-select"
            value={filters.courtId}
            onChange={(event) => setFilters((current) => ({ ...current, courtId: event.target.value }))}
            placeholder="Court id"
          />
          <Button onClick={submitSearch}>Search Filing Queue</Button>
        </div>
      </section>

      {queueQuery.isError ? (
        <div className="xocket-alert xocket-alert-danger">
          {(queueQuery.error as Error).message || 'Unable to load filing queue.'}
        </div>
      ) : null}

      <section className="xocket-card placement-grid-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Filing Worklist</h2>
            <p className="xocket-card-subtitle">Open a placement to assign filing, generate POC, upload POC documents, capture receipt, and submit filing.</p>
          </div>
          <span className="xocket-pill">Page {page} of {totalPages}</span>
        </div>
        <div className="xocket-card-body">
          <EnterpriseGrid<PlacementAccount>
            rows={rows}
            columns={columns}
            isLoading={queueQuery.isFetching || dashboardQuery.isFetching}
            emptyMessage="No placements were returned for this filing queue filter."
            height={590}
            onRowDoubleClicked={(row) => openPlacement(onOpenPlacementAccount, row)}
          />
          <div className="placement-pagination">
            <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong> · page size <strong>{pageSize}</strong></span>
            <div>
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="xocket-card filing-backend-gap-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">LP-03 Backend Gaps Not Invented</h2>
            <p className="xocket-card-subtitle">The UI exposes only available filing APIs and documents missing legacy parity endpoints explicitly.</p>
          </div>
        </div>
        <ul className="filing-gap-list">
          <li>No dedicated receipt-pending queue status or endpoint was present in Swagger.</li>
          <li>No bulk filing assignment, bulk document generation, or bulk submit filing endpoint was present.</li>
          <li>No dedicated filing history endpoint was present; placement detail and filing-page payloads are used where available.</li>
          <li>No court login/credential API was present; UI only shows court URLs returned by filing-page.</li>
        </ul>
      </section>
    </div>
  );
}
