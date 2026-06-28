import { useMemo, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { Building2, Eye, FileSearch, Gavel, Landmark, RefreshCcw, Scale, Search, UserRound } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useAttorneys, useBankruptcyCases, useCourts, useTrustees } from '../hooks/useBankruptcy';
import type { BankruptcyCaseRow, ReferenceLookupRow } from '../types/bankruptcy';

const PAGE_SIZE = 25;

type CaseFilterState = {
  search: string;
  status: string;
  chapter: string;
  filingDateFrom: string;
  filingDateTo: string;
};

type ReferenceTab = 'courts' | 'trustees' | 'attorneys';

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

function statusTone(status?: string | null) {
  const normalized = (status ?? '').toLowerCase();
  if (normalized.includes('open') || normalized.includes('active')) return 'success';
  if (normalized.includes('dismiss')) return 'warning';
  if (normalized.includes('closed') || normalized.includes('discharge')) return 'info';
  return 'neutral';
}

function ChapterCard({ chapter, rows }: { chapter: string; rows: BankruptcyCaseRow[] }) {
  const count = rows.filter((row) => String(row.chapter ?? '').toLowerCase().includes(chapter.toLowerCase())).length;
  return <StatCard icon={<Scale size={22} />} value={count} label={`Chapter ${chapter}`} helper="Current result set" tone="info" />;
}

export function BankruptcyCasesWorkspacePage() {
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState<CaseFilterState>({ search: '', status: '', chapter: '', filingDateFrom: '', filingDateTo: '' });
  const [submittedFilters, setSubmittedFilters] = useState<CaseFilterState>({ search: '', status: '', chapter: '', filingDateFrom: '', filingDateTo: '' });
  const [selectedCase, setSelectedCase] = useState<BankruptcyCaseRow | null>(null);
  const [referenceTab, setReferenceTab] = useState<ReferenceTab>('courts');
  const [referenceSearch, setReferenceSearch] = useState('');
  const [submittedReferenceSearch, setSubmittedReferenceSearch] = useState('');
  const [hasLoadedReferences, setHasLoadedReferences] = useState(false);

  const request = useMemo(() => ({
    page,
    pageSize: PAGE_SIZE,
    search: submittedFilters.search,
    status: submittedFilters.status,
    chapter: submittedFilters.chapter,
    filingDateFrom: submittedFilters.filingDateFrom,
    filingDateTo: submittedFilters.filingDateTo
  }), [page, submittedFilters]);

  const casesQuery = useBankruptcyCases(request, hasSearched);
  const cases = casesQuery.data?.items ?? [];
  const totalCount = casesQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const referenceRequest = { page: 1, pageSize: 25, search: submittedReferenceSearch };
  const courtsQuery = useCourts(referenceRequest, hasLoadedReferences && referenceTab === 'courts');
  const trusteesQuery = useTrustees(referenceRequest, hasLoadedReferences && referenceTab === 'trustees');
  const attorneysQuery = useAttorneys(referenceRequest, hasLoadedReferences && referenceTab === 'attorneys');

  const selectedCourtRequest = useMemo(() => ({ page: 1, pageSize: 5, id: selectedCase?.courtId ?? null, courtId: selectedCase?.courtId ?? null, search: selectedCase?.courtId ? String(selectedCase.courtId) : '' }), [selectedCase?.courtId]);
  const selectedTrusteeRequest = useMemo(() => ({ page: 1, pageSize: 5, id: selectedCase?.trusteeId ?? null, trusteeId: selectedCase?.trusteeId ?? null, search: selectedCase?.trusteeId ? String(selectedCase.trusteeId) : '' }), [selectedCase?.trusteeId]);
  const selectedAttorneyRequest = useMemo(() => ({ page: 1, pageSize: 5, id: selectedCase?.attorneyId ?? null, attorneyId: selectedCase?.attorneyId ?? null, search: selectedCase?.attorneyId ? String(selectedCase.attorneyId) : '' }), [selectedCase?.attorneyId]);

  const selectedCourtQuery = useCourts(selectedCourtRequest, Boolean(selectedCase?.courtId));
  const selectedTrusteeQuery = useTrustees(selectedTrusteeRequest, Boolean(selectedCase?.trusteeId));
  const selectedAttorneyQuery = useAttorneys(selectedAttorneyRequest, Boolean(selectedCase?.attorneyId));

  const selectedCourt = (selectedCourtQuery.data?.items ?? []).find((row) => row.id === selectedCase?.courtId) ?? selectedCourtQuery.data?.items?.[0];
  const selectedTrustee = (selectedTrusteeQuery.data?.items ?? []).find((row) => row.id === selectedCase?.trusteeId) ?? selectedTrusteeQuery.data?.items?.[0];
  const selectedAttorney = (selectedAttorneyQuery.data?.items ?? []).find((row) => row.id === selectedCase?.attorneyId) ?? selectedAttorneyQuery.data?.items?.[0];

  const referenceRows = referenceTab === 'courts' ? (courtsQuery.data?.items ?? []) : referenceTab === 'trustees' ? (trusteesQuery.data?.items ?? []) : (attorneysQuery.data?.items ?? []);
  const referenceLoading = referenceTab === 'courts' ? courtsQuery.isFetching : referenceTab === 'trustees' ? trusteesQuery.isFetching : attorneysQuery.isFetching;

  const columns = useMemo<ColDef<BankruptcyCaseRow>[]>(() => [
    {
      headerName: 'Case',
      field: 'bankruptcyCaseNumber',
      pinned: 'left',
      minWidth: 210,
      cellRenderer: ({ data }: { data?: BankruptcyCaseRow }) => (
        <div className="grid-primary-cell">
          <strong>{data?.bankruptcyCaseNumber ?? data?.caseNumber ?? `#${data?.id ?? '-'}`}</strong>
          <span>{data?.debtorName ?? 'Debtor not available'}</span>
        </div>
      )
    },
    { headerName: 'Chapter', field: 'chapter', minWidth: 120, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Status', field: 'status', minWidth: 150, cellRenderer: ({ data }: { data?: BankruptcyCaseRow }) => <StatusBadge label={data?.status ?? 'Unknown'} tone={statusTone(data?.status)} /> },
    { headerName: 'Filing Date', field: 'filingDate', minWidth: 150, valueFormatter: ({ value }) => formatDate(value) },
    { headerName: 'Source', field: 'sourceSystem', minWidth: 130, valueFormatter: ({ value }) => value || '-' },
    {
      headerName: 'Action',
      minWidth: 130,
      pinned: 'right',
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: BankruptcyCaseRow }) => (
        <Button variant="secondary" onClick={() => data && setSelectedCase(data)}>
          <Eye size={15} /> View
        </Button>
      )
    }
  ], [setSelectedCase]);

  const referenceColumns = useMemo<ColDef<ReferenceLookupRow>[]>(() => [
    {
      headerName: 'Name',
      field: 'name',
      pinned: 'left',
      minWidth: 260,
      cellRenderer: ({ data }: { data?: ReferenceLookupRow }) => (
        <div className="grid-primary-cell">
          <strong>{data?.name ?? `#${data?.id ?? '-'}`}</strong>
          <span>{data?.code ?? data?.stateCode ?? 'Reference record'}</span>
        </div>
      )
    },
    { headerName: 'State', field: 'stateCode', minWidth: 120, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'City', field: 'city', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Phone', field: 'phone', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Email', field: 'email', minWidth: 220, valueFormatter: ({ value }) => value || '-' }
  ], []);

  function submitSearch() {
    setPage(1);
    setSubmittedFilters(filters);
    setHasSearched(true);
  }

  function clearSearch() {
    const empty = { search: '', status: '', chapter: '', filingDateFrom: '', filingDateTo: '' };
    setFilters(empty);
    setSubmittedFilters(empty);
    setSelectedCase(null);
    setHasSearched(false);
    setPage(1);
  }

  return (
    <div className="enterprise-page monitoring-page">
      <section className="placement-hero xocket-card monitoring-hero">
        <div> 
          <h1>Bankruptcy Operations Workspace</h1>
          <p>Search bankruptcy cases, review court context, and access trustee and attorney master data without loading the full dataset.</p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => casesQuery.refetch()}><RefreshCcw size={16} /> Refresh</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<Gavel size={22} />} value={totalCount} label="Cases Found" helper="Server-side result count" tone="primary" />
        <ChapterCard chapter="7" rows={cases} />
        <ChapterCard chapter="11" rows={cases} />
        <ChapterCard chapter="13" rows={cases} />
        <StatCard icon={<Landmark size={22} />} value={cases.filter((row) => row.courtName).length} label="Court Linked" helper="Current result set" tone="success" />
        <StatCard icon={<UserRound size={22} />} value={cases.filter((row) => row.trusteeName || row.attorneyName).length} label="Professionals" helper="Trustee or attorney linked" tone="info" />
      </div>

      <section className="document-workspace-panel monitoring-production-panel">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Bankruptcy Search</span>
            <h2>Case Library</h2>
            <p>Search by case number, debtor, chapter, status, or filing date range.</p>
          </div>
        </div>

        <div className="account-search-form account-advanced-grid">
          <label className="evictsure-form-group"><span className="evictsure-form-label">Search</span><input className="evictsure-form-input" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Case number, debtor, court..." /></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Status</span><input className="evictsure-form-input" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} placeholder="Open, Closed, Dismissed" /></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Chapter</span><select className="evictsure-form-input" value={filters.chapter} onChange={(event) => setFilters((current) => ({ ...current, chapter: event.target.value }))}><option value="">Any</option><option value="7">Chapter 7</option><option value="11">Chapter 11</option><option value="13">Chapter 13</option></select></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Filing From</span><input type="date" className="evictsure-form-input" value={filters.filingDateFrom} onChange={(event) => setFilters((current) => ({ ...current, filingDateFrom: event.target.value }))} /></label>
          <label className="evictsure-form-group"><span className="evictsure-form-label">Filing To</span><input type="date" className="evictsure-form-input" value={filters.filingDateTo} onChange={(event) => setFilters((current) => ({ ...current, filingDateTo: event.target.value }))} /></label>
        </div>

        <div className="account-search-toolbar">
          <div className="workspace-muted">Search-first loading is enforced for bankruptcy cases.</div>
          <div className="account-header-actions">
            <Button variant="secondary" onClick={clearSearch}>Clear</Button>
            <Button onClick={submitSearch}><Search size={16} /> Search Cases</Button>
          </div>
        </div>
      </section>

      <section className="document-library-card">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Current Work</span>
            <h2>Cases</h2>
            <p>{hasSearched ? `${totalCount.toLocaleString()} matching case records. Court, trustee, and attorney details are available from View.` : 'Search to load bankruptcy cases.'}</p>
          </div>
        </div>
        <EnterpriseGrid rows={cases} columns={columns} isLoading={casesQuery.isFetching} height={520} emptyMessage={hasSearched ? 'No bankruptcy cases matched your criteria.' : 'Search to load bankruptcy cases.'} onRowDoubleClicked={setSelectedCase} />
        {hasSearched && (
          <div className="account-search-toolbar">
            <span className="workspace-muted">Page {page} of {totalPages}</span>
            <div className="account-header-actions"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button><Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div>
          </div>
        )}
      </section>

      {selectedCase && (
        <section className="account-info-panel">
          <div className="account-info-panel-header"><div><span className="enterprise-eyebrow">Case Workspace</span><h2>{selectedCase.bankruptcyCaseNumber ?? selectedCase.caseNumber}</h2></div><Button variant="secondary" onClick={() => setSelectedCase(null)}>Close</Button></div>
          <div className="account-key-value-grid">
            <div className="account-key-value"><span>Debtor</span><strong>{selectedCase.debtorName ?? '-'}</strong></div>
            <div className="account-key-value"><span>Chapter</span><strong>{selectedCase.chapter ?? '-'}</strong></div>
            <div className="account-key-value"><span>Status</span><strong>{selectedCase.status ?? '-'}</strong></div>
            <div className="account-key-value"><span>Filing Date</span><strong>{formatDate(selectedCase.filingDate)}</strong></div>
            <div className="account-key-value"><span>Source</span><strong>{selectedCase.sourceSystem ?? '-'}</strong></div>
          </div>

          <div className="account-related-grid">
            <article className="xocket-card account-related-card">
              <span className="enterprise-eyebrow">Court</span>
              <h3>{selectedCourtQuery.isFetching ? 'Loading court...' : selectedCourt?.name ?? 'Court not resolved'}</h3>
              <p>{selectedCourt?.stateCode ?? '-'} {selectedCourt?.city ? `• ${selectedCourt.city}` : ''}</p>
              <p className="workspace-muted">Court details are resolved only after opening the case workspace.</p>
            </article>
            <article className="xocket-card account-related-card">
              <span className="enterprise-eyebrow">Trustee</span>
              <h3>{selectedTrusteeQuery.isFetching ? 'Loading trustee...' : selectedTrustee?.name ?? 'Trustee not resolved'}</h3>
              <p>{selectedTrustee?.phone ?? selectedTrustee?.email ?? 'Contact details not available'}</p>
              <p className="workspace-muted">Trustee data is not shown in the cases grid.</p>
            </article>
            <article className="xocket-card account-related-card">
              <span className="enterprise-eyebrow">Attorney</span>
              <h3>{selectedAttorneyQuery.isFetching ? 'Loading attorney...' : selectedAttorney?.name ?? 'Attorney not resolved'}</h3>
              <p>{selectedAttorney?.phone ?? selectedAttorney?.email ?? 'Contact details not available'}</p>
              <p className="workspace-muted">Attorney data is loaded on demand from the workspace.</p>
            </article>
          </div>
        </section>
      )}

      <section className="document-library-card">
        <div className="document-workspace-section-title">
          <div>
            <span className="enterprise-eyebrow">Reference Data</span>
            <h2>Court, Trustee, and Attorney Lookups</h2>
            <p>Load master records on demand for bankruptcy operations.</p>
          </div>
        </div>
        <div className="account-tabs">
          {(['courts', 'trustees', 'attorneys'] as ReferenceTab[]).map((tab) => <button key={tab} className={`account-tab ${referenceTab === tab ? 'active' : ''}`} onClick={() => setReferenceTab(tab)}>{tab}</button>)}
        </div>
        <div className="account-search-form account-advanced-grid">
          <label className="evictsure-form-group"><span className="evictsure-form-label">Reference Search</span><input className="evictsure-form-input" value={referenceSearch} onChange={(event) => setReferenceSearch(event.target.value)} placeholder="Name, state, code..." /></label>
          <div className="document-action-footer"><Button onClick={() => { setSubmittedReferenceSearch(referenceSearch); setHasLoadedReferences(true); }}><FileSearch size={16} /> Load {referenceTab}</Button></div>
        </div>
        <EnterpriseGrid rows={referenceRows} columns={referenceColumns} isLoading={referenceLoading} height={360} emptyMessage={hasLoadedReferences ? 'No reference records found.' : 'Load reference records on demand.'} />
      </section>
    </div>
  );
}
