import { useMemo, useState } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { AlertTriangle, ClipboardCheck, Filter, Gavel, Search, ShieldCheck } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { placementQueueStatusOptions } from '../api/placementStatusMaps';
import { usePlacementAccounts } from '../hooks/usePlacementAccounts';
import type { PlacementAccount, PlacementAccountSearchRequest } from '../types/placement';

type LegalReviewQueuePageProps = {
  onOpenPlacementAccount: (placementAccountId: number) => void;
};

type FilterState = {
  search: string;
  clientId: string;
  courtId: string;
  queueStatus: string;
  filerUserId: string;
};

const legalReviewStatusCode = placementQueueStatusOptions.find((option) => option.label.toLowerCase().includes('legal'))?.value ?? 3;

const initialFilters: FilterState = {
  search: '',
  clientId: '',
  courtId: '',
  queueStatus: String(legalReviewStatusCode),
  filerUserId: ''
};

function toNumberOrUndefined(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : undefined;
}

const moneyFormatter = ({ value }: ValueFormatterParams<PlacementAccount, number | null | undefined>) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
};

const dateFormatter = ({ value }: ValueFormatterParams<PlacementAccount, string | null | undefined>) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
};

export function LegalReviewQueuePage({ onOpenPlacementAccount }: LegalReviewQueuePageProps) {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<FilterState>(initialFilters);
  const [hasLoaded, setHasLoaded] = useState(true);

  const request = useMemo<PlacementAccountSearchRequest>(() => ({
    page,
    pageSize,
    search: submittedFilters.search.trim() || undefined,
    clientId: toNumberOrUndefined(submittedFilters.clientId),
    courtId: toNumberOrUndefined(submittedFilters.courtId),
    queueStatus: toNumberOrUndefined(submittedFilters.queueStatus),
    filerUserId: submittedFilters.filerUserId.trim() || undefined
  }), [page, submittedFilters]);

  const query = usePlacementAccounts(request, hasLoaded);
  const rows = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const stats = useMemo(() => ({
    visible: rows.length,
    missingCase: rows.filter((row) => !row.bankruptcyCaseNumber).length,
    missingCourt: rows.filter((row) => !row.bankruptcyCourt).length,
    highValue: rows.filter((row) => (row.claimAmount ?? row.balance ?? 0) >= 10000).length
  }), [rows]);

  const columns = useMemo<ColDef<PlacementAccount>[]>(() => [
    {
      headerName: 'Placement',
      field: 'placementAccountId',
      pinned: 'left',
      minWidth: 190,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => (
        <button className="grid-link-cell" type="button" onClick={() => data && onOpenPlacementAccount(data.placementAccountId ?? data.id)}>
          <strong>{data?.accountNumber ?? `Placement #${data?.placementAccountId ?? data?.id ?? '-'}`}</strong>
          <span>Placement ID {data?.placementAccountId ?? data?.id ?? '-'}</span>
        </button>
      )
    },
    { headerName: 'Debtor', field: 'debtorName', minWidth: 220, valueFormatter: ({ value, data }) => value || data?.contactName || '-' },
    { headerName: 'Case #', field: 'bankruptcyCaseNumber', minWidth: 170, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Court', field: 'bankruptcyCourt', minWidth: 240, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Match', field: 'matchStatus', minWidth: 160, cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Unknown'} /> },
    { headerName: 'Queue', field: 'queueStatus', minWidth: 170, cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Legal Review'} /> },
    { headerName: 'Claim Amount', field: 'claimAmount', minWidth: 150, valueFormatter: moneyFormatter },
    { headerName: 'Placed', field: 'placedOnUtc', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Reviewer', field: 'reviewerUserId', minWidth: 180, valueFormatter: ({ value }) => value || '-' },
    {
      headerName: 'Legal Review',
      pinned: 'right',
      width: 160,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => <Button variant="secondary" onClick={() => data && onOpenPlacementAccount(data.placementAccountId ?? data.id)}>Review</Button>
    }
  ], [onOpenPlacementAccount]);

  const runSearch = () => {
    setPage(1);
    setSubmittedFilters(filters);
    setHasLoaded(true);
  };

  const reset = () => {
    setFilters(initialFilters);
    setSubmittedFilters(initialFilters);
    setPage(1);
    setHasLoaded(true);
  };

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">LP-02 · Legal Review</p>
          <h1>Legal Review Queue</h1>
          <p>Dedicated queue for placements that need legal approval, rejection, escalation, or return before POC work continues.</p>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<Gavel size={20} />} label="Visible" value={stats.visible} helper="Current result page" />
        <StatCard icon={<AlertTriangle size={20} />} label="Missing Case" value={stats.missingCase} helper="Needs evidence review" tone="warning" />
        <StatCard icon={<ShieldCheck size={20} />} label="Missing Court" value={stats.missingCourt} helper="Court context required" tone="danger" />
        <StatCard icon={<ClipboardCheck size={20} />} label="High Value" value={stats.highValue} helper="Visible page" tone="success" />
      </div>

      <section className="workspace-card">
        <div className="workspace-card-header">
          <div>
            <h2>Legal Queue Filters</h2>
            <p>Uses GET /api/v1/placement/queue. The default queue status is Legal Review from the local status map; status codes remain backend-defined.</p>
          </div>
        </div>
        <div className="filter-bar filter-bar--dense">
          <div className="filter-input">
            <Search size={16} />
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Account, debtor, case" />
          </div>
          <input value={filters.clientId} onChange={(event) => setFilters((current) => ({ ...current, clientId: event.target.value }))} placeholder="Client ID" />
          <input value={filters.courtId} onChange={(event) => setFilters((current) => ({ ...current, courtId: event.target.value }))} placeholder="Court ID" />
          <input value={filters.queueStatus} onChange={(event) => setFilters((current) => ({ ...current, queueStatus: event.target.value }))} placeholder="Queue status code" />
          <input value={filters.filerUserId} onChange={(event) => setFilters((current) => ({ ...current, filerUserId: event.target.value }))} placeholder="Reviewer/Filer user" />
          <Button onClick={runSearch}><Filter size={16} /> Load Legal Queue</Button>
          <Button variant="secondary" onClick={reset}>Reset</Button>
        </div>
      </section>

      <section className="workspace-card">
        {query.isError ? (
          <div className="xocket-alert xocket-alert-danger">{(query.error as Error).message || 'Unable to load legal review queue.'}</div>
        ) : (
          <>
            <EnterpriseGrid rows={rows} columns={columns} isLoading={query.isFetching} height={560} emptyMessage="No placement accounts are currently in this legal review filter." onRowDoubleClicked={(row) => onOpenPlacementAccount(row.placementAccountId ?? row.id)} />
            <div className="pagination-bar">
              <Button variant="secondary" disabled={page <= 1 || query.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
              <span>Page {page} of {totalPages}</span>
              <Button variant="secondary" disabled={page >= totalPages || query.isFetching} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
