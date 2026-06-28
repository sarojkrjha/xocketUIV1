import { useMemo, useState } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { BriefcaseBusiness, FileSearch, Landmark, Search, ShieldCheck } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useAccountSearch } from '../hooks/useAccountSearch';
import { AccountSearchFilters, type AccountSearchFilterState } from '../components/AccountSearchFilters';
import type { AccountSearchRequest, AccountSearchRow } from '../types/account';

const PAGE_SIZE = 25;

const currencyFormatter = (params: ValueFormatterParams<AccountSearchRow, number | null | undefined>) => {
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

function maskSsn(last4?: string | null) {
  if (!last4) {
    return '-';
  }

  return `XXX-XX-${last4.padStart(4, '0')}`;
}

function hasAnyFilter(filters: AccountSearchFilterState) {
  return Object.values(filters).some((value) => value !== undefined && value !== null && value !== '');
}

type AccountSearchPageProps = {
  onViewAccount?: (accountId: number) => void;
};

export function AccountSearchPage({ onViewAccount }: AccountSearchPageProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AccountSearchFilterState>({});
  const [submittedFilters, setSubmittedFilters] = useState<AccountSearchFilterState>({});
  const [hasSearched, setHasSearched] = useState(false);

  const request = useMemo<AccountSearchRequest>(() => ({
    page,
    pageSize: PAGE_SIZE,
    ...submittedFilters
  }), [page, submittedFilters]);

  const accountsQuery = useAccountSearch(request, hasSearched);
  const rows = accountsQuery.data?.items ?? [];
  const totalCount = accountsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const activeFilterCount = Object.values(submittedFilters).filter((value) => value !== undefined && value !== null && value !== '').length;

  const columns = useMemo<ColDef<AccountSearchRow>[]>(() => [
    {
      headerName: 'Account',
      field: 'accountNumber',
      pinned: 'left',
      minWidth: 170,
      cellRenderer: ({ data }: { data?: AccountSearchRow }) => (
        <div className="grid-primary-cell">
          <strong>{data?.accountNumber ?? `#${data?.id ?? '-'}`}</strong>
          <span>{data?.clientName ?? 'Client not assigned'}</span>
        </div>
      )
    },
    {
      headerName: 'Contact / Debtor',
      field: 'contactName',
      minWidth: 230,
      cellRenderer: ({ data }: { data?: AccountSearchRow }) => (
        <div className="grid-primary-cell">
          <strong>{data?.contactName ?? '-'}</strong>
          <span>{maskSsn(data?.last4)}</span>
        </div>
      )
    },
    {
      headerName: 'Status',
      field: 'status',
      minWidth: 145,
      cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Unknown'} />
    },
    {
      headerName: 'Portfolio',
      field: 'portfolioName',
      minWidth: 180,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'BK Case #',
      field: 'bankruptcyCaseNumber',
      minWidth: 170,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Court',
      field: 'courtName',
      minWidth: 240,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'State',
      field: 'stateCode',
      width: 110,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Phone',
      field: 'phone',
      minWidth: 150,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Email',
      field: 'email',
      minWidth: 220,
      valueFormatter: ({ value }) => value || '-'
    },
    {
      headerName: 'Balance',
      field: 'currentBalance',
      type: 'numericColumn',
      valueFormatter: currencyFormatter
    },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 150,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: AccountSearchRow }) => (
        <div className="table-actions">
          <button className="xocket-btn-icon btn-view" type="button" title="View account" onClick={() => data?.id && onViewAccount?.(data.id)}>View</button>
        </div>
      )
    }
  ], [onViewAccount]);

  const submitSearch = () => {
    setPage(1);
    setSubmittedFilters(filters);
    setHasSearched(true);
  };

  const resetSearch = () => {
    setPage(1);
    setFilters({});
    setSubmittedFilters({});
    setHasSearched(false);
  };

  const loadFirstPage = () => {
    setPage(1);
    setSubmittedFilters({});
    setHasSearched(true);
  };

  return (
    <div className="placement-page account-search-page">
      <section className="placement-hero xocket-card">
        <div>
          <span className="xocket-pill xocket-pill-primary">Accounts</span>
          <h1>Account Search</h1>
          <p>
            Search first against the backend account search index. The page uses server-side pagination and does not load the full account population.
          </p>
        </div>

        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={loadFirstPage}><FileSearch size={16} /> Load First Page</Button>
          <Button onClick={submitSearch}><Search size={16} /> Search</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid">
        <StatCard icon={<BriefcaseBusiness size={22} />} value={hasSearched ? String(totalCount) : '-'} label="Matching Accounts" helper="Returned by /accounts/search" tone="primary" />
        <StatCard icon={<Search size={22} />} value={String(PAGE_SIZE)} label="Page Size" helper="Server-side pagination" tone="info" />
        <StatCard icon={<ShieldCheck size={22} />} value={String(activeFilterCount)} label="Active Filters" helper="Submitted search filters" tone="success" />
        <StatCard icon={<Landmark size={22} />} value={hasAnyFilter(submittedFilters) ? 'Filtered' : 'Open'} label="Search Mode" helper="No automatic full load" tone="warning" />
      </div>

      <AccountSearchFilters
        filters={filters}
        onChange={setFilters}
        onSearch={submitSearch}
        onReset={resetSearch}
        hasSearched={hasSearched}
      />

      {accountsQuery.isError && (
        <div className="xocket-alert xocket-alert-danger">
          {(accountsQuery.error as Error).message || 'Unable to search accounts.'}
        </div>
      )}

      <section className="xocket-card placement-grid-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Search Results</h2>
            <p className="xocket-card-subtitle">Backed by GET /api/v1/accounts/search.</p>
          </div>
          <span className="xocket-pill">{hasSearched ? `${totalCount} records` : 'Not loaded'}</span>
        </div>

        <div className="xocket-card-body">
          <EnterpriseGrid<AccountSearchRow>
            rows={rows}
            columns={columns}
            isLoading={accountsQuery.isFetching}
            emptyMessage={hasSearched ? 'No accounts matched the submitted search.' : 'Enter search criteria or click Load First Page. No account data is loaded automatically.'}
            height={570}
            onRowDoubleClicked={(row) => row.id && onViewAccount?.(row.id)}
          />

          <div className="placement-pagination">
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div>
              <Button variant="secondary" disabled={!hasSearched || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
              <Button variant="secondary" disabled={!hasSearched || page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
