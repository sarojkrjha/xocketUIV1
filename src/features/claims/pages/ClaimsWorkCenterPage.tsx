import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { FileCheck2, Filter, PlusCircle, ReceiptText, RefreshCcw, Search, ShieldCheck, TimerReset } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { claimStatusOptions } from '../api/claimStatusMaps';
import { checkClaimEligibility } from '../api/claimsApi';
import { useClaims, useCreateClaim } from '../hooks/useClaims';
import type { ClaimQueueItem, ClaimSearchRequest, CreateClaimRequest } from '../types/claims';

type ClaimsWorkCenterPageProps = {
  onOpenClaim: (claimId: number) => void;
};

type FilterState = {
  search: string;
  status: number | '';
  accountId: string;
  bankruptcyCaseId: string;
};

type CreateClaimFormState = {
  accountId: string;
  bankruptcyCaseId: string;
  bankruptcyCaseNumber: string;
  trusteeId: string;
  debtorLast4: string;
  claimAmount: string;
  barDate: string;
  createdBy: string;
};

const initialFilters: FilterState = {
  search: '',
  status: '',
  accountId: '',
  bankruptcyCaseId: ''
};

const initialCreateClaimForm: CreateClaimFormState = {
  accountId: '',
  bankruptcyCaseId: '',
  bankruptcyCaseNumber: '',
  trusteeId: '',
  debtorLast4: '',
  claimAmount: '',
  barDate: '',
  createdBy: 'UI User'
};

function toNumberOrUndefined(value: string | number | '') {
  if (value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

const currencyFormatter = (params: ValueFormatterParams<ClaimQueueItem, number | null | undefined>) => {
  if (params.value === null || params.value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(params.value);
};

const dateFormatter = (params: ValueFormatterParams<ClaimQueueItem, string | null | undefined>) => {
  if (!params.value) return '-';
  const date = new Date(params.value);
  return Number.isNaN(date.getTime()) ? params.value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
};

export function ClaimsWorkCenterPage({ onOpenClaim }: ClaimsWorkCenterPageProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [submittedFilters, setSubmittedFilters] = useState<FilterState>(initialFilters);
  const [hasSubmittedQuery, setHasSubmittedQuery] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCreateClaim, setShowCreateClaim] = useState(false);
  const [createClaimForm, setCreateClaimForm] = useState<CreateClaimFormState>(initialCreateClaimForm);
  const [createClaimValidation, setCreateClaimValidation] = useState<string | null>(null);
  const pageSize = 25;
  const createClaimMutation = useCreateClaim();
  const eligibilityMutation = useMutation({
    mutationFn: () => {
      const accountId = toNumberOrUndefined(createClaimForm.accountId);
      if (!accountId) {
        throw new Error('Account ID is required before eligibility can be checked.');
      }

      return checkClaimEligibility({
        accountId,
        bankruptcyCaseId: toNumberOrUndefined(createClaimForm.bankruptcyCaseId),
        claimAmount: Number(createClaimForm.claimAmount) > 0 ? Number(createClaimForm.claimAmount) : undefined,
        barDate: createClaimForm.barDate || undefined,
        requestedBy: createClaimForm.createdBy || 'UI User'
      });
    }
  });

  const request = useMemo<ClaimSearchRequest>(() => ({
    page,
    pageSize,
    search: submittedFilters.search.trim() || undefined,
    status: toNumberOrUndefined(submittedFilters.status),
    accountId: toNumberOrUndefined(submittedFilters.accountId),
    bankruptcyCaseId: toNumberOrUndefined(submittedFilters.bankruptcyCaseId)
  }), [page, submittedFilters]);

  const claimsQuery = useClaims(request, hasSubmittedQuery);
  const rows = claimsQuery.data?.items ?? [];
  const totalCount = claimsQuery.data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const stats = useMemo(() => ({
    draft: rows.filter((x) => (x.status ?? '').toLowerCase().includes('draft')).length,
    ready: rows.filter((x) => (x.status ?? '').toLowerCase().includes('ready')).length,
    filed: rows.filter((x) => (x.status ?? '').toLowerCase().includes('filed')).length,
    receipt: rows.filter((x) => (x.status ?? '').toLowerCase().includes('receipt')).length,
    closed: rows.filter((x) => (x.status ?? '').toLowerCase().includes('closed') || (x.status ?? '').toLowerCase().includes('paid')).length
  }), [rows]);

  const columns = useMemo<ColDef<ClaimQueueItem>[]>(() => [
    {
      headerName: 'Claim',
      field: 'claimId',
      pinned: 'left',
      minWidth: 170,
      cellRenderer: ({ data }: { data?: ClaimQueueItem }) => (
        <button className="grid-link-cell" type="button" onClick={() => data && onOpenClaim(data.claimId)}>
          <strong>Claim #{data?.claimId ?? '-'}</strong>
          <span>{data?.courtClaimNumber ?? 'Court claim pending'}</span>
        </button>
      )
    },
    { headerName: 'Account', field: 'accountNumber', minWidth: 165, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Debtor', field: 'debtorName', minWidth: 220, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Case #', field: 'bankruptcyCaseNumber', minWidth: 180, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Court', field: 'courtName', minWidth: 240, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Status', field: 'status', minWidth: 170, cellRenderer: ({ value }: { value?: string | null }) => <StatusBadge label={value ?? 'Draft'} /> },
    { headerName: 'Claim Amount', field: 'claimAmount', type: 'numericColumn', minWidth: 155, valueFormatter: currencyFormatter },
    { headerName: 'Bar Date', field: 'barDate', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Filed', field: 'filedOnUtc', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Attorney', field: 'attorneyName', minWidth: 180, valueFormatter: ({ value }) => value || '-' },
    {
      headerName: 'Actions',
      pinned: 'right',
      width: 170,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: ClaimQueueItem }) => (
        <div className="grid-actions-cell">
          <Button variant="secondary" onClick={() => data && onOpenClaim(data.claimId)}>Open</Button>
        </div>
      )
    }
  ], [onOpenClaim]);

  const submitSearch = () => {
    setPage(1);
    setSubmittedFilters(filters);
    setHasSubmittedQuery(true);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setSubmittedFilters(initialFilters);
    setPage(1);
    setHasSubmittedQuery(false);
  };

  const updateCreateClaimForm = (key: keyof CreateClaimFormState, value: string) => {
    setCreateClaimValidation(null);
    setCreateClaimForm((current) => ({ ...current, [key]: value }));
  };

  const canCreateClaim = Boolean(
    toNumberOrUndefined(createClaimForm.accountId)
    && toNumberOrUndefined(createClaimForm.bankruptcyCaseId)
    && Number(createClaimForm.claimAmount) > 0
  );

  const submitCreateClaim = async () => {
    const accountId = toNumberOrUndefined(createClaimForm.accountId);
    const bankruptcyCaseId = toNumberOrUndefined(createClaimForm.bankruptcyCaseId);
    const claimAmount = Number(createClaimForm.claimAmount);

    if (!accountId) {
      setCreateClaimValidation('Account ID is required. Create Claim is a context-based workflow, so the claim must be tied to an account.');
      return;
    }
    if (!bankruptcyCaseId) {
      setCreateClaimValidation('Bankruptcy Case ID is required. Use the selected bankruptcy match/case from placement or account context.');
      return;
    }
    if (!Number.isFinite(claimAmount) || claimAmount <= 0) {
      setCreateClaimValidation('Claim Amount must be greater than zero.');
      return;
    }

    const requestPayload: CreateClaimRequest = {
      accountId,
      bankruptcyCaseId,
      bankruptcyCaseNumber: createClaimForm.bankruptcyCaseNumber.trim() || null,
      trusteeId: toNumberOrUndefined(createClaimForm.trusteeId) ?? null,
      debtorLast4: createClaimForm.debtorLast4.trim() || null,
      claimAmount,
      barDate: createClaimForm.barDate || null,
      createdBy: createClaimForm.createdBy.trim() || 'UI User'
    };

    const result = await createClaimMutation.mutateAsync(requestPayload);
    const createdClaimId = extractCreatedClaimId(result);
    setShowCreateClaim(false);
    setCreateClaimValidation(null);
    setCreateClaimForm(initialCreateClaimForm);
    setHasSubmittedQuery(true);
    claimsQuery.refetch();

    if (createdClaimId) {
      onOpenClaim(createdClaimId);
    }
  };


  return (
    <div className="claims-page">
      <section className="placement-hero xocket-card claims-hero">
        <div> 
          <h1>Enterprise Claims Workspace</h1>
          <p>Proof of Claim operations from draft through filing, receipt processing, payments, and closure.</p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => claimsQuery.refetch()}><RefreshCcw size={16} /> Refresh</Button>
          <Button onClick={() => { setCreateClaimValidation(null); setShowCreateClaim(true); }}><PlusCircle size={16} /> Create Claim</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<FileCheck2 size={22} />} value={stats.draft} label="Draft" helper="Visible page count" tone="primary" />
        <StatCard icon={<ShieldCheck size={22} />} value={stats.ready} label="Ready" helper="Ready for filing" tone="warning" />
        <StatCard icon={<TimerReset size={22} />} value={stats.filed} label="Filed" helper="Filed claims" tone="info" />
        <StatCard icon={<ReceiptText size={22} />} value={stats.receipt} label="Receipt Pending" helper="Receipt workflow" tone="danger" />
        <StatCard icon={<ShieldCheck size={22} />} value={stats.closed} label="Paid / Closed" helper="Completed claims" tone="success" />
      </div>

      <section className="xocket-card placement-filter-card">
        <div className="placement-filter-row">
          <div className="placement-search-box">
            <Search size={18} />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
              placeholder="Search claim, account, debtor, case..."
            />
          </div>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value === '' ? '' : Number(event.target.value) }))}>
            <option value="">All statuses</option>
            {claimStatusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
          <Button onClick={submitSearch}><Search size={16} /> Search</Button>
          <Button variant="secondary" onClick={() => setShowAdvancedFilters((value) => !value)}><Filter size={16} /> Filters</Button>
          <Button variant="secondary" onClick={clearFilters}>Clear</Button>
        </div>

        {showAdvancedFilters ? (
          <div className="placement-advanced-filters">
            <label>
              Account ID
              <input value={filters.accountId} onChange={(event) => setFilters((current) => ({ ...current, accountId: event.target.value }))} />
            </label>
            <label>
              Bankruptcy Case ID
              <input value={filters.bankruptcyCaseId} onChange={(event) => setFilters((current) => ({ ...current, bankruptcyCaseId: event.target.value }))} />
            </label>
          </div>
        ) : null}
      </section>

      <section className="xocket-card placement-grid-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Claims Queue</h2>
            <p className="xocket-card-subtitle">Server-side search and pagination using GET /api/v1/claims.</p>
          </div>
          <span className="xocket-pill">{totalCount} records</span>
        </div>

        {!hasSubmittedQuery ? (
          <div className="placement-empty-business">Enter search criteria or click Search to load a paged claims queue. Large datasets are never loaded automatically.</div>
        ) : claimsQuery.isError ? (
          <div className="xocket-alert xocket-alert-danger">{(claimsQuery.error as Error).message || 'Unable to load claims.'}</div>
        ) : (
          <>
            <EnterpriseGrid rows={rows} columns={columns} isLoading={claimsQuery.isFetching} height={560} emptyMessage="No claims matched the current filters." onRowDoubleClicked={(row) => onOpenClaim(row.claimId)} />
            <div className="placement-pagination-bar">
              <span>Page {page} of {totalPages}</span>
              <div>
                <Button variant="secondary" disabled={page <= 1 || claimsQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button variant="secondary" disabled={page >= totalPages || claimsQuery.isFetching} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </section>

      {showCreateClaim ? (
        <div className="xocket-modal-backdrop" role="presentation">
          <section className="xocket-modal" role="dialog" aria-modal="true" aria-labelledby="create-claim-title">
            <div className="xocket-modal-header">
              <div>
                <span className="xocket-pill xocket-pill-primary">POST /api/v1/claims</span>
                <h2 id="create-claim-title">Create Claim</h2>
                <p>Create a Proof of Claim record from account and bankruptcy case context.</p>
              </div>
              <button className="xocket-modal-close" type="button" onClick={() => setShowCreateClaim(false)} aria-label="Close create claim dialog">×</button>
            </div>

            <div className="form-grid">
              <label>
                Account ID <span className="required-marker">*</span>
                <input value={createClaimForm.accountId} onChange={(event) => updateCreateClaimForm('accountId', event.target.value)} placeholder="Example: 10001" />
              </label>
              <label>
                Bankruptcy Case ID <span className="required-marker">*</span>
                <input value={createClaimForm.bankruptcyCaseId} onChange={(event) => updateCreateClaimForm('bankruptcyCaseId', event.target.value)} placeholder="Example: 65378402" />
              </label>
              <label>
                Case Number
                <input value={createClaimForm.bankruptcyCaseNumber} onChange={(event) => updateCreateClaimForm('bankruptcyCaseNumber', event.target.value)} placeholder="Optional court case number" />
              </label>
              <label>
                Trustee ID
                <input value={createClaimForm.trusteeId} onChange={(event) => updateCreateClaimForm('trusteeId', event.target.value)} placeholder="Optional" />
              </label>
              <label>
                Debtor Last 4
                <input value={createClaimForm.debtorLast4} maxLength={4} onChange={(event) => updateCreateClaimForm('debtorLast4', event.target.value)} placeholder="1234" />
              </label>
              <label>
                Claim Amount <span className="required-marker">*</span>
                <input value={createClaimForm.claimAmount} onChange={(event) => updateCreateClaimForm('claimAmount', event.target.value)} placeholder="500.00" />
              </label>
              <label>
                Bar Date
                <input type="date" value={createClaimForm.barDate} onChange={(event) => updateCreateClaimForm('barDate', event.target.value)} />
              </label>
              <label>
                Created By
                <input value={createClaimForm.createdBy} onChange={(event) => updateCreateClaimForm('createdBy', event.target.value)} />
              </label>
            </div>

            {createClaimValidation ? <div className="xocket-alert xocket-alert-warning">{createClaimValidation}</div> : null}
            {eligibilityMutation.isError ? <div className="xocket-alert xocket-alert-danger">{(eligibilityMutation.error as Error).message || 'Eligibility check failed.'}</div> : null}
            {eligibilityMutation.data ? (
              <div className={eligibilityMutation.data.eligible === false ? 'xocket-alert xocket-alert-warning' : 'xocket-alert xocket-alert-success'}>
                {eligibilityMutation.data.eligible === false ? 'Eligibility warning' : 'Eligibility checked'}
                {eligibilityMutation.data.reason ? `: ${eligibilityMutation.data.reason}` : ''}
                {eligibilityMutation.data.missingRequirements?.length ? ` Missing: ${eligibilityMutation.data.missingRequirements.join(', ')}` : ''}
              </div>
            ) : null}
            {createClaimMutation.isError ? (
              <div className="xocket-alert xocket-alert-danger">{(createClaimMutation.error as Error).message || 'Create claim failed.'}</div>
            ) : null}

            <div className="xocket-modal-actions">
              <Button variant="secondary" onClick={() => setShowCreateClaim(false)}>Cancel</Button>
              <Button variant="secondary" disabled={!toNumberOrUndefined(createClaimForm.accountId) || eligibilityMutation.isPending} onClick={() => eligibilityMutation.mutate()}>
                {eligibilityMutation.isPending ? 'Checking...' : 'Check Eligibility'}
              </Button>
              <Button disabled={!canCreateClaim || createClaimMutation.isPending} onClick={submitCreateClaim}>
                <PlusCircle size={16} /> {createClaimMutation.isPending ? 'Creating...' : 'Create Claim'}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}


function extractCreatedClaimId(value: unknown): number | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const raw = source.claimId ?? source.id ?? source.resultId ?? source.createdId;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() && Number.isFinite(Number(raw))) return Number(raw);
  return null;
}
