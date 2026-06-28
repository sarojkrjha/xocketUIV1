import { useMemo, useState } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Download,
  FileCheck2,
  Filter,
  RefreshCcw,
  Scale,
  Search,
  ShieldAlert,
  Upload,
  Users
} from 'lucide-react';

import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { StatCard } from '@/shared/components/StatCard';
import { Button } from '@/shared/components/Button';
import { useMovePlacementQueue, usePlacementAccounts } from '../hooks/usePlacementAccounts';
import { usePlacementDashboard } from '../hooks/usePlacementDashboard';
import { placementMatchStatusOptions, placementQueueStatusOptions } from '../api/placementStatusMaps';
import type { PlacementAccount, PlacementQueueRequest } from '../types/placement';

type PlacementWorkCenterPageProps = {
  onOpenPlacementAccount?: (placementAccountId: number) => void;
};

type FilterState = {
  search: string;
  queueStatus: number | '';
  matchStatus: number | '';
  clientId: string;
  courtId: string;
  filerUserId: string;
};

const initialFilters: FilterState = {
  search: '',
  queueStatus: '',
  matchStatus: '',
  clientId: '',
  courtId: '',
  filerUserId: ''
};

const currencyFormatter = (params: ValueFormatterParams<PlacementAccount, number | null | undefined>) => {
  const value = params.value;

  if (value === null || value === undefined) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
};

const dateFormatter = (params: ValueFormatterParams<PlacementAccount, string | null | undefined>) => {
  if (!params.value) {
    return '-';
  }

  const date = new Date(params.value);

  if (Number.isNaN(date.getTime())) {
    return params.value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
};

function maskSsn(last4?: string | null) {
  if (!last4) {
    return '-';
  }

  return `XXX-XX-${last4.padStart(4, '0')}`;
}

function toNumberOrUndefined(value: string | number | '') {
  if (value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function PlacementWorkCenterPage({ onOpenPlacementAccount }: PlacementWorkCenterPageProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<FilterState>(initialFilters);
  const [hasSubmittedQuery, setHasSubmittedQuery] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<PlacementAccount[]>([]);
  const [bulkMoveQueueStatus, setBulkMoveQueueStatus] = useState<number | ''>('');
  const [bulkMoveReason, setBulkMoveReason] = useState('LP-01 queue movement');
  const pageSize = 25;

  const request = useMemo<PlacementQueueRequest>(() => ({
    page,
    pageSize,
    search: submittedFilters.search.trim() || undefined,
    matchStatus: toNumberOrUndefined(submittedFilters.matchStatus),
    queueStatus: toNumberOrUndefined(submittedFilters.queueStatus),
    clientId: toNumberOrUndefined(submittedFilters.clientId),
    courtId: toNumberOrUndefined(submittedFilters.courtId),
    filerUserId: submittedFilters.filerUserId.trim() || undefined
  }), [page, pageSize, submittedFilters]);

  const dashboardQuery = usePlacementDashboard();
  const accountsQuery = usePlacementAccounts(request, hasSubmittedQuery);
  const moveQueueMutation = useMovePlacementQueue();

  const dashboard = dashboardQuery.data;
  const rows = accountsQuery.data?.items ?? [];
  const totalCount = accountsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));


  const queueTabs = placementQueueStatusOptions.map((option) => ({
    ...option,
    active: submittedFilters.queueStatus === option.value
  }));

  const loadQueueTab = (queueStatus: number | '') => {
    const nextFilters: FilterState = { ...filters, queueStatus };
    setFilters(nextFilters);
    setSubmittedFilters(nextFilters);
    setPage(1);
    setSelectedRows([]);
    setHasSubmittedQuery(true);
  };

  const bulkMoveSelected = async () => {
    if (bulkMoveQueueStatus === '' || selectedRows.length === 0) {
      return;
    }

    const targets = selectedRows
      .map((row) => row.placementAccountId ?? row.id)
      .filter((id) => id > 0);

    for (const placementAccountId of targets) {
      await moveQueueMutation.mutateAsync({
        placementAccountId,
        toQueueStatus: Number(bulkMoveQueueStatus),
        reason: bulkMoveReason || 'LP-01 queue movement',
        changedBy: 'UI User'
      });
    }

    setSelectedRows([]);
    void accountsQuery.refetch();
    void dashboardQuery.refetch();
  };

  const openPlacementAccount = (row: PlacementAccount) => {
    const placementAccountId = row.placementAccountId ?? row.id;
    if (placementAccountId > 0) {
      onOpenPlacementAccount?.(placementAccountId);
    }
  };

  const columns = useMemo<ColDef<PlacementAccount>[]>(() => [
    {
      headerName: 'Account',
      field: 'accountNumber',
      pinned: 'left',
      minWidth: 170,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => (
        <button className="grid-link-cell" type="button" onClick={() => data && openPlacementAccount(data)}>
          <strong>{data?.accountNumber ?? `#${data?.id ?? '-'}`}</strong>
          <span>{data?.clientName ?? 'Client not assigned'}</span>
        </button>
      )
    },
    {
      headerName: 'Debtor / Contact',
      field: 'debtorName',
      minWidth: 220,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => (
        <div className="grid-primary-cell">
          <strong>{data?.debtorName ?? data?.contactName ?? '-'}</strong>
          <span>{maskSsn(data?.last4Ssn)}</span>
        </div>
      )
    },
    {
      headerName: 'Queue Status',
      field: 'queueStatus',
      minWidth: 170,
      cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Open'} />
    },
    {
      headerName: 'Match Status',
      field: 'matchStatus',
      minWidth: 170,
      cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Unmatched'} />
    },
    {
      headerName: 'Court',
      field: 'bankruptcyCourt',
      minWidth: 220,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Case #',
      field: 'bankruptcyCaseNumber',
      minWidth: 165,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Chapter',
      field: 'bankruptcyChapter',
      width: 120,
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
      headerName: 'Balance',
      field: 'balance',
      type: 'numericColumn',
      minWidth: 140,
      valueFormatter: currencyFormatter
    },
    {
      headerName: 'Filer',
      field: 'filerUserId',
      minWidth: 150,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Placed',
      field: 'placedOnUtc',
      minWidth: 150,
      valueFormatter: dateFormatter
    },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 190,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => (
        <div className="table-actions">
          <button className="xocket-btn-icon btn-view" type="button" title="Open workspace" onClick={() => data && openPlacementAccount(data)}>Open</button>
          <button className="xocket-btn-icon btn-edit" type="button" title="Review match" onClick={() => data && openPlacementAccount(data)}>Review</button>
        </div>
      )
    }
  ], [onOpenPlacementAccount]);

  const submitSearch = () => {
    setPage(1);
    setSelectedRows([]);
    setSubmittedFilters(filters);
    setHasSubmittedQuery(true);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSubmittedFilters(initialFilters);
    setPage(1);
    setSelectedRows([]);
    setHasSubmittedQuery(false);
  };

  const loadDashboardQueue = (queueStatus: number) => {
    const nextFilters: FilterState = {
      ...initialFilters,
      queueStatus
    };
    setFilters(nextFilters);
    setSubmittedFilters(nextFilters);
    setPage(1);
    setSelectedRows([]);
    setHasSubmittedQuery(true);
  };

  return (
    <div className="placement-page">
      <section className="placement-hero xocket-card">
        <div>
          <span className="xocket-pill xocket-pill-primary">Placement Operations</span>
          <h1>Placement Operations Workspace</h1>
          <p>
            Manage the legacy placement queue from imported accounts through matching, legal review, ready-for-POC, filing, exception, and closure states.
          </p>
        </div>

        <div className="placement-hero-actions">
          <Button variant="secondary" disabled={selectedRows.length === 0}><Upload size={16} /> Bulk Move</Button>
          <Button variant="secondary" disabled={!hasSubmittedQuery}><Download size={16} /> Export</Button>
          <Button onClick={() => { setHasSubmittedQuery(true); void accountsQuery.refetch(); void dashboardQuery.refetch(); }}><RefreshCcw size={16} /> Refresh</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <button className="placement-stat-button" type="button" onClick={() => loadDashboardQueue(2)}>
          <StatCard icon={<ShieldAlert size={22} />} value={dashboard?.pendingMatchReview ?? 0} label="Pending Match Review" helper="Requires operator decision" tone="warning" />
        </button>
        <button className="placement-stat-button" type="button" onClick={() => loadDashboardQueue(3)}>
          <StatCard icon={<Scale size={22} />} value={dashboard?.legalReview ?? 0} label="Legal Review" helper="Attorney / compliance workflow" tone="info" />
        </button>
        <button className="placement-stat-button" type="button" onClick={() => loadDashboardQueue(4)}>
          <StatCard icon={<FileCheck2 size={22} />} value={dashboard?.readyForPoc ?? 0} label="Ready For POC" helper="Eligible downstream work" tone="success" />
        </button>
        <button className="placement-stat-button" type="button" onClick={() => loadDashboardQueue(7)}>
          <StatCard icon={<AlertTriangle size={22} />} value={dashboard?.exceptions ?? 0} label="Exceptions" helper="Needs operational attention" tone="danger" />
        </button>
        <StatCard icon={<CheckCircle2 size={22} />} value={dashboard?.completedToday ?? 0} label="Completed Today" helper="Filed or closed today" tone="primary" />
        <StatCard icon={<Users size={22} />} value={hasSubmittedQuery ? totalCount : dashboard?.totalOpen ?? 0} label={hasSubmittedQuery ? 'Current Result Set' : 'Total Open'} helper="Server-side count" tone="info" />
      </div>


      <section className="xocket-card lp01-queue-tabs-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Legacy Queue Switcher</h2>
            <p className="xocket-card-subtitle">Queue tabs map to the backend queueStatus filter from Swagger. Counts still come from dashboard where available.</p>
          </div>
        </div>
        <div className="lp01-queue-tabs">
          <button className={`lp01-queue-tab ${submittedFilters.queueStatus === '' ? 'active' : ''}`} type="button" onClick={() => loadQueueTab('')}>
            <strong>All Open</strong>
            <span>Any queue status</span>
          </button>
          {queueTabs.map((tab) => (
            <button className={`lp01-queue-tab ${tab.active ? 'active' : ''}`} type="button" key={tab.value} onClick={() => loadQueueTab(tab.value)}>
              <strong>{tab.label}</strong>
              <span>queueStatus {tab.value}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="xocket-card placement-toolbar-card">
        <div className="placement-toolbar placement-toolbar-advanced">
          <div className="placement-search-box">
            <Search size={18} />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  submitSearch();
                }
              }}
              placeholder="Search account, debtor, client, case number, or SSN last 4"
            />
          </div>

          <select
            className="placement-select"
            value={filters.queueStatus}
            onChange={(event) => setFilters((current) => ({ ...current, queueStatus: event.target.value === '' ? '' : Number(event.target.value) }))}
            aria-label="Queue status"
          >
            <option value="">All queue statuses</option>
            {placementQueueStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            className="placement-select"
            value={filters.matchStatus}
            onChange={(event) => setFilters((current) => ({ ...current, matchStatus: event.target.value === '' ? '' : Number(event.target.value) }))}
            aria-label="Match status"
          >
            <option value="">All match statuses</option>
            {placementMatchStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <Button variant="secondary" onClick={() => setShowAdvancedFilters((value) => !value)}><Filter size={16} /> Filters</Button>
          <Button onClick={submitSearch}>{hasSubmittedQuery ? 'Search Queue' : 'Load Queue'}</Button>
        </div>

        {showAdvancedFilters ? (
          <div className="placement-advanced-filters">
            <label>
              <span>Client ID</span>
              <input value={filters.clientId} onChange={(event) => setFilters((current) => ({ ...current, clientId: event.target.value }))} placeholder="clientId" />
            </label>
            <label>
              <span>Court ID</span>
              <input value={filters.courtId} onChange={(event) => setFilters((current) => ({ ...current, courtId: event.target.value }))} placeholder="courtId" />
            </label>
            <label>
              <span>Filer User ID</span>
              <input value={filters.filerUserId} onChange={(event) => setFilters((current) => ({ ...current, filerUserId: event.target.value }))} placeholder="filerUserId" />
            </label>
            <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : null}
      </section>

      {selectedRows.length > 0 ? (
        <section className="placement-bulk-bar lp01-bulk-bar">
          <div>
            <strong>{selectedRows.length} selected</strong>
            <span>Bulk queue movement uses PUT /api/v1/placement/accounts/{'{placementAccountId}'}/queue once per selected account.</span>
          </div>
          <select className="placement-select" value={bulkMoveQueueStatus} onChange={(event) => setBulkMoveQueueStatus(event.target.value === '' ? '' : Number(event.target.value))}>
            <option value="">Move to queue...</option>
            {placementQueueStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input value={bulkMoveReason} onChange={(event) => setBulkMoveReason(event.target.value)} placeholder="Queue movement reason" />
          <Button disabled={bulkMoveQueueStatus === '' || moveQueueMutation.isPending} onClick={bulkMoveSelected}>
            {moveQueueMutation.isPending ? 'Moving...' : 'Move Queue'}
          </Button>
        </section>
      ) : null}

      {moveQueueMutation.isError ? (
        <div className="xocket-alert xocket-alert-danger">{(moveQueueMutation.error as Error).message || 'Unable to move selected placement account(s).'}</div>
      ) : null}

      {accountsQuery.isError && (
        <div className="xocket-alert xocket-alert-danger">
          {(accountsQuery.error as Error).message || 'Unable to load placement accounts.'}
        </div>
      )}

      {dashboardQuery.isError && (
        <div className="xocket-alert xocket-alert-danger">
          {(dashboardQuery.error as Error).message || 'Unable to load placement dashboard.'}
        </div>
      )}

      <section className="xocket-card placement-grid-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Placement Queue</h2>
            <p className="xocket-card-subtitle">Server-side search and pagination over placed accounts. Double-click any row to open the placement workspace.</p>
          </div>
          <span className="xocket-pill">{hasSubmittedQuery ? `${totalCount} records` : 'No data loaded'}</span>
        </div>

        <div className="xocket-card-body">
          <EnterpriseGrid<PlacementAccount>
            rows={rows}
            columns={columns}
            isLoading={accountsQuery.isFetching || dashboardQuery.isFetching}
            emptyMessage={hasSubmittedQuery ? 'Search returned no placement accounts.' : 'Use Search or Load Queue to retrieve the first page. No data is loaded automatically.'}
            height={590}
            onRowDoubleClicked={openPlacementAccount}
            onSelectionChanged={setSelectedRows}
          />

          <div className="placement-pagination">
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> · page size <strong>{pageSize}</strong>
            </span>
            <div>
              <Button variant="secondary" disabled={!hasSubmittedQuery || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
              <Button variant="secondary" disabled={!hasSubmittedQuery || page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
