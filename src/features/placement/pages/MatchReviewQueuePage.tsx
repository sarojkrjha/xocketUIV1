import { useMemo, useState } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { Filter, Search, ShieldCheck } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { usePlacementAccounts } from '../hooks/usePlacementAccounts';
import type { PlacementAccount, PlacementAccountSearchRequest } from '../types/placement';

type MatchReviewQueuePageProps = {
  onOpenPlacementAccount: (placementAccountId: number) => void;
};

type FilterState = {
  search: string;
  clientId: string;
  courtId: string;
  queueStatus: string;
  matchStatus: string;
};

const initialFilters: FilterState = {
  search: '',
  clientId: '',
  courtId: '',
  queueStatus: '',
  matchStatus: ''
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

export function MatchReviewQueuePage({ onOpenPlacementAccount }: MatchReviewQueuePageProps) {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<FilterState>(initialFilters);
  const [hasSearched, setHasSearched] = useState(false);

  const request = useMemo<PlacementAccountSearchRequest>(() => ({
    page,
    pageSize,
    search: submittedFilters.search.trim() || undefined,
    clientId: toNumberOrUndefined(submittedFilters.clientId),
    courtId: toNumberOrUndefined(submittedFilters.courtId),
    queueStatus: toNumberOrUndefined(submittedFilters.queueStatus),
    matchStatus: toNumberOrUndefined(submittedFilters.matchStatus)
  }), [page, submittedFilters]);

  const query = usePlacementAccounts(request, hasSearched);
  const rows = query.data?.items ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const stats = useMemo(() => ({
    visible: rows.length,
    multiple: rows.filter((row) => `${row.matchStatus ?? ''}`.toLowerCase().includes('multiple')).length,
    unmatched: rows.filter((row) => `${row.matchStatus ?? ''}`.toLowerCase().includes('unmatched')).length,
    selected: rows.filter((row) => `${row.matchStatus ?? ''}`.toLowerCase().includes('selected') || `${row.matchStatus ?? ''}`.toLowerCase().includes('accepted')).length
  }), [rows]);

  const columns = useMemo<ColDef<PlacementAccount>[]>(() => [
    {
      headerName: 'Placement',
      field: 'placementAccountId',
      pinned: 'left',
      minWidth: 180,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => (
        <button className="grid-link-cell" type="button" onClick={() => data && onOpenPlacementAccount(data.placementAccountId ?? data.id)}>
          <strong>{data?.accountNumber ?? `Placement #${data?.placementAccountId ?? data?.id ?? '-'}`}</strong>
          <span>Placement ID {data?.placementAccountId ?? data?.id ?? '-'}</span>
        </button>
      )
    },
    { headerName: 'Debtor', field: 'debtorName', minWidth: 220, valueFormatter: ({ value, data }) => value || data?.contactName || '-' },
    { headerName: 'Last 4', field: 'last4Ssn', minWidth: 110, valueFormatter: ({ value }) => value ? `XXX-XX-${value}` : '-' },
    { headerName: 'Case #', field: 'bankruptcyCaseNumber', minWidth: 180, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Court', field: 'bankruptcyCourt', minWidth: 240, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Match Status', field: 'matchStatus', minWidth: 160, cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Unknown'} /> },
    { headerName: 'Queue', field: 'queueStatus', minWidth: 160, cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Unknown'} /> },
    { headerName: 'Claim Amount', field: 'claimAmount', minWidth: 150, valueFormatter: moneyFormatter },
    { headerName: 'Placed', field: 'placedOnUtc', minWidth: 150, valueFormatter: dateFormatter },
    {
      headerName: 'Review',
      pinned: 'right',
      width: 140,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: PlacementAccount }) => <Button variant="secondary" onClick={() => data && onOpenPlacementAccount(data.placementAccountId ?? data.id)}>Open</Button>
    }
  ], [onOpenPlacementAccount]);

  const runSearch = () => {
    setPage(1);
    setSubmittedFilters(filters);
    setHasSearched(true);
  };

  const clear = () => {
    setFilters(initialFilters);
    setSubmittedFilters(initialFilters);
    setPage(1);
    setHasSearched(false);
  };

  return (
    <div className="workspace-page">
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">Legacy Workflow Parity</p>
          <h1>Matching Review Queue</h1>
          <p>Dedicated queue for bankruptcy match review. This does not reuse the general placement page; it opens the evidence comparison workspace for the selected placement account.</p>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<ShieldCheck size={20} />} label="Visible" value={stats.visible} helper="Current result page" />
        <StatCard icon={<ShieldCheck size={20} />} label="Multiple" value={stats.multiple} helper="Visible page" tone="warning" />
        <StatCard icon={<ShieldCheck size={20} />} label="Unmatched" value={stats.unmatched} helper="Visible page" tone="danger" />
        <StatCard icon={<ShieldCheck size={20} />} label="Selected" value={stats.selected} helper="Visible page" tone="success" />
      </div>

      <section className="workspace-card">
        <div className="workspace-card-header">
          <div>
            <h2>Queue Filters</h2>
            <p>Uses GET /api/v1/placement/queue. Match and queue status codes are backend-defined, so the UI exposes them as filters instead of inventing status mappings.</p>
          </div>
        </div>
        <div className="filter-bar filter-bar--dense">
          <div className="filter-input">
            <Search size={16} />
            <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Account, debtor, case" />
          </div>
          <input value={filters.clientId} onChange={(event) => setFilters((current) => ({ ...current, clientId: event.target.value }))} placeholder="Client ID" />
          <input value={filters.courtId} onChange={(event) => setFilters((current) => ({ ...current, courtId: event.target.value }))} placeholder="Court ID" />
          <input value={filters.matchStatus} onChange={(event) => setFilters((current) => ({ ...current, matchStatus: event.target.value }))} placeholder="Match status code" />
          <input value={filters.queueStatus} onChange={(event) => setFilters((current) => ({ ...current, queueStatus: event.target.value }))} placeholder="Queue status code" />
          <Button onClick={runSearch}><Filter size={16} /> Load Review Queue</Button>
          <Button variant="secondary" onClick={clear}>Clear</Button>
        </div>
      </section>

      <section className="workspace-card">
        {!hasSearched ? (
          <div className="placement-empty-business">Enter review filters and load the queue. This avoids loading the full placement inventory by default.</div>
        ) : query.isError ? (
          <div className="xocket-alert xocket-alert-danger">{(query.error as Error).message || 'Unable to load matching review queue.'}</div>
        ) : (
          <>
            <EnterpriseGrid rows={rows} columns={columns} isLoading={query.isFetching} height={560} emptyMessage="No placement accounts matched the review filters." onRowDoubleClicked={(row) => onOpenPlacementAccount(row.placementAccountId ?? row.id)} />
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
