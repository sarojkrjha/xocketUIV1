import { useMemo, useState } from 'react';
import type { ColDef, ValueFormatterParams } from 'ag-grid-community';
import { AlertTriangle, Banknote, CalendarClock, CheckCircle2, Download, Filter, PlayCircle, RefreshCcw, Search, Settings2, WalletCards } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { EnterpriseGrid } from '@/shared/components/grid/EnterpriseGrid';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { paymentStatusIntent } from '../api/paymentStatusMaps';
import { useCreateNdcSchedule, useDeactivateNdcSchedule, useImportNdcPayments, useNdcDashboard, useNdcImportRunDetail, useNdcImportRuns, useNdcPayments, useNdcSchedules, usePostNdcPaymentToClaim } from '../hooks/usePayments';
import type { NdcImportRunItem, NdcScheduleItem, PaymentQueueItem } from '../types/payments';

type PaymentFilterState = { search: string; trusteeId: string; caseNumber: string; claimNumber: string; mappingStatus: number | '' };
type RunFilterState = { search: string; trusteeId: string; status: number | '' };
type ScheduleFilterState = { search: string; trusteeId: string; isActive: '' | 'true' | 'false' };

type PostingFormState = {
  claimId: string;
  amount: string;
  paymentDate: string;
  referenceNumber: string;
  postedBy: string;
  allowOverpayment: boolean;
};

const pageSize = 25;
const initialPaymentFilters: PaymentFilterState = { search: '', trusteeId: '', caseNumber: '', claimNumber: '', mappingStatus: '' };

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

function formatCurrencyValue(value?: number | null) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function dateFormatter(params: ValueFormatterParams<any, string | null | undefined>) { return formatDate(params.value); }
function currencyFormatter(params: ValueFormatterParams<PaymentQueueItem, number | null | undefined>) { return formatCurrencyValue(params.value); }
function countFormatter(params: { value?: number | null }) { return params.value === null || params.value === undefined ? '-' : new Intl.NumberFormat('en-US').format(params.value); }
function today() { return new Date().toISOString().slice(0, 10); }

export function PaymentsWorkspacePage() {
  const dashboardQuery = useNdcDashboard();
  const importPayments = useImportNdcPayments();
  const createSchedule = useCreateNdcSchedule();
  const deactivateSchedule = useDeactivateNdcSchedule();
  const postPaymentToClaim = usePostNdcPaymentToClaim();

  const [activeTab, setActiveTab] = useState<'payments' | 'runs' | 'schedules'>('payments');
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [runsPage, setRunsPage] = useState(1);
  const [schedulesPage, setSchedulesPage] = useState(1);
  const [hasPaymentSearch, setHasPaymentSearch] = useState(false);
  const [hasRunSearch, setHasRunSearch] = useState(false);
  const [hasScheduleSearch, setHasScheduleSearch] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentQueueItem | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [paymentFilters, setPaymentFilters] = useState<PaymentFilterState>(initialPaymentFilters);
  const [submittedPaymentFilters, setSubmittedPaymentFilters] = useState<PaymentFilterState>(initialPaymentFilters);
  const [runFilters, setRunFilters] = useState<RunFilterState>({ search: '', trusteeId: '', status: '' });
  const [submittedRunFilters, setSubmittedRunFilters] = useState<RunFilterState>({ search: '', trusteeId: '', status: '' });
  const [scheduleFilters, setScheduleFilters] = useState<ScheduleFilterState>({ search: '', trusteeId: '', isActive: '' });
  const [submittedScheduleFilters, setSubmittedScheduleFilters] = useState<ScheduleFilterState>({ search: '', trusteeId: '', isActive: '' });
  const [importForm, setImportForm] = useState({ trusteeId: '', checkNumber: '', paymentDate: '', searchAllTime: false, triggeredBy: 'UI User' });
  const [scheduleForm, setScheduleForm] = useState({ trusteeId: '', checkNumber: '', paymentDate: '', searchAllTime: false, frequency: 'Daily' });
  const [postingForm, setPostingForm] = useState<PostingFormState>({ claimId: '', amount: '', paymentDate: today(), referenceNumber: '', postedBy: 'UI User', allowOverpayment: false });

  const paymentRequest = useMemo(() => ({
    page: paymentsPage,
    pageSize,
    search: submittedPaymentFilters.search || undefined,
    trusteeId: submittedPaymentFilters.trusteeId || undefined,
    caseNumber: submittedPaymentFilters.caseNumber || undefined,
    claimNumber: submittedPaymentFilters.claimNumber || undefined,
    mappingStatus: toNumberOrUndefined(submittedPaymentFilters.mappingStatus)
  }), [paymentsPage, submittedPaymentFilters]);

  const runRequest = useMemo(() => ({
    page: runsPage,
    pageSize,
    search: submittedRunFilters.search || undefined,
    trusteeId: submittedRunFilters.trusteeId || undefined,
    status: toNumberOrUndefined(submittedRunFilters.status)
  }), [runsPage, submittedRunFilters]);

  const scheduleRequest = useMemo(() => ({
    page: schedulesPage,
    pageSize,
    search: submittedScheduleFilters.search || undefined,
    trusteeId: submittedScheduleFilters.trusteeId || undefined,
    isActive: toBooleanOrUndefined(submittedScheduleFilters.isActive)
  }), [schedulesPage, submittedScheduleFilters]);

  const paymentsQuery = useNdcPayments(paymentRequest, hasPaymentSearch);
  const runsQuery = useNdcImportRuns(runRequest, hasRunSearch);
  const schedulesQuery = useNdcSchedules(scheduleRequest, hasScheduleSearch);
  const runDetailQuery = useNdcImportRunDetail(selectedRunId);

  const paymentRows = paymentsQuery.data?.items ?? [];
  const runRows = runsQuery.data?.items ?? [];
  const scheduleRows = schedulesQuery.data?.items ?? [];
  const paymentsTotalPages = Math.max(1, Math.ceil((paymentsQuery.data?.totalCount ?? 0) / pageSize));
  const runsTotalPages = Math.max(1, Math.ceil((runsQuery.data?.totalCount ?? 0) / pageSize));
  const schedulesTotalPages = Math.max(1, Math.ceil((schedulesQuery.data?.totalCount ?? 0) / pageSize));
  const dashboard = dashboardQuery.data;

  const openPayment = (payment: PaymentQueueItem) => {
    setSelectedPayment(payment);
    setPostingForm({
      claimId: '',
      amount: payment.amount?.toString() ?? '',
      paymentDate: payment.paymentDate?.slice(0, 10) ?? today(),
      referenceNumber: payment.referenceNumber ?? '',
      postedBy: 'UI User',
      allowOverpayment: false
    });
  };

  const paymentColumns = useMemo<ColDef<PaymentQueueItem>[]>(() => [
    {
      headerName: 'Payment',
      field: 'paymentId',
      pinned: 'left',
      minWidth: 210,
      cellRenderer: ({ data }: { data?: PaymentQueueItem }) => (
        <div className="grid-primary-cell">
          <strong>{data?.referenceNumber ?? `Payment #${data?.paymentId ?? '-'}`}</strong>
          <span>{data?.sourceSystem ?? 'NDC'} · {formatDate(data?.paymentDate)}</span>
        </div>
      )
    },
    { headerName: 'Case / Claim', minWidth: 230, cellRenderer: ({ data }: { data?: PaymentQueueItem }) => <div className="grid-primary-cell"><strong>{data?.caseNumber ?? '-'}</strong><span>Claim {data?.claimNumber ?? '-'}</span></div> },
    { headerName: 'Debtor', field: 'debtorName', minWidth: 200, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Trustee', field: 'trusteeId', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Amount', field: 'amount', minWidth: 140, valueFormatter: currencyFormatter },
    { headerName: 'Mapping', field: 'mappingStatus', minWidth: 150, cellRenderer: ({ data }: { data?: PaymentQueueItem }) => <StatusBadge label={data?.mappingStatus ?? 'Unknown'} tone={paymentStatusIntent(data?.mappingStatus)} /> },
    { headerName: 'Review', minWidth: 130, pinned: 'right', sortable: false, filter: false, cellRenderer: ({ data }: { data?: PaymentQueueItem }) => <button className="xeds-row-action" type="button" onClick={() => data && openPayment(data)}>Review</button> }
  ], []);

  const runColumns = useMemo<ColDef<NdcImportRunItem>[]>(() => [
    { headerName: 'Run', field: 'runId', pinned: 'left', minWidth: 120 },
    { headerName: 'Trustee', field: 'trusteeId', minWidth: 160, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Check', field: 'checkNumber', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Payment Date', field: 'paymentDate', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Status', field: 'status', minWidth: 150, cellRenderer: ({ data }: { data?: NdcImportRunItem }) => <StatusBadge label={data?.status ?? 'Unknown'} tone={paymentStatusIntent(data?.status)} /> },
    { headerName: 'Records', field: 'totalRecords', minWidth: 130, valueFormatter: countFormatter },
    { headerName: 'Matched', field: 'matchedRecords', minWidth: 130, valueFormatter: countFormatter },
    { headerName: 'Exceptions', field: 'exceptionRecords', minWidth: 140, valueFormatter: countFormatter },
    { headerName: 'Started', field: 'startedUtc', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'View', minWidth: 120, pinned: 'right', sortable: false, filter: false, cellRenderer: ({ data }: { data?: NdcImportRunItem }) => <button className="xeds-row-action" type="button" onClick={() => data && setSelectedRunId(data.runId)}>Detail</button> }
  ], []);

  const scheduleColumns = useMemo<ColDef<NdcScheduleItem>[]>(() => [
    { headerName: 'Schedule', field: 'scheduleId', pinned: 'left', minWidth: 130 },
    { headerName: 'Trustee', field: 'trusteeId', minWidth: 160, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Frequency', field: 'frequency', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Check', field: 'checkNumber', minWidth: 150, valueFormatter: ({ value }) => value || '-' },
    { headerName: 'Payment Date', field: 'paymentDate', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Next Run', field: 'nextRunUtc', minWidth: 150, valueFormatter: dateFormatter },
    { headerName: 'Status', field: 'isActive', minWidth: 140, cellRenderer: ({ data }: { data?: NdcScheduleItem }) => <StatusBadge label={data?.isActive ? 'Active' : 'Inactive'} tone={data?.isActive ? 'success' : 'neutral'} /> },
    { headerName: 'Action', minWidth: 140, pinned: 'right', sortable: false, filter: false, cellRenderer: ({ data }: { data?: NdcScheduleItem }) => data?.isActive ? <button className="xeds-row-action" type="button" onClick={() => deactivateSchedule.mutate(data.scheduleId)}>Deactivate</button> : <span className="workspace-muted">-</span> }
  ], [deactivateSchedule]);

  function submitPaymentSearch() { setPaymentsPage(1); setSubmittedPaymentFilters(paymentFilters); setHasPaymentSearch(true); }
  function submitRunSearch() { setRunsPage(1); setSubmittedRunFilters(runFilters); setHasRunSearch(true); }
  function submitScheduleSearch() { setSchedulesPage(1); setSubmittedScheduleFilters(scheduleFilters); setHasScheduleSearch(true); }

  function submitPosting() {
    if (!selectedPayment) return;
    const claimId = Number(postingForm.claimId);
    const amount = Number(postingForm.amount);
    if (!Number.isFinite(claimId) || claimId <= 0 || !Number.isFinite(amount) || amount <= 0 || !postingForm.paymentDate) return;
    postPaymentToClaim.mutate({
      claimId,
      paymentId: selectedPayment.paymentId,
      amount,
      paymentDate: postingForm.paymentDate,
      referenceNumber: postingForm.referenceNumber || selectedPayment.referenceNumber,
      postedBy: postingForm.postedBy || 'UI User',
      sourceSystem: selectedPayment.sourceSystem ?? 'NDC',
      sourcePaymentId: String(selectedPayment.paymentId),
      externalReference: selectedPayment.referenceNumber,
      allowOverpayment: postingForm.allowOverpayment
    });
  }

  return (
    <div className="enterprise-page payments-page">
      <section className="placement-hero xocket-card payments-hero">
        <div>
          <h1>NDC & Payments Operations</h1>
          <p>Import trustee payments, review mapping exceptions, manage schedules, inspect import runs, and post verified payments to claims.</p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => { dashboardQuery.refetch(); paymentsQuery.refetch(); runsQuery.refetch(); schedulesQuery.refetch(); }}><RefreshCcw size={16} /> Refresh</Button>
        </div>
      </section>

      <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
        <StatCard icon={<WalletCards size={22} />} value={dashboard?.totalPayments ?? 0} label="Total Payments" helper="NDC payment library" tone="primary" />
        <StatCard icon={<Banknote size={22} />} value={dashboard?.matchedPayments ?? 0} label="Matched" helper="Ready to post" tone="success" />
        <StatCard icon={<AlertTriangle size={22} />} value={dashboard?.exceptionPayments ?? 0} label="Exceptions" helper="Needs review" tone="warning" />
        <StatCard icon={<Download size={22} />} value={dashboard?.importedToday ?? 0} label="Imported Today" helper="Current activity" tone="info" />
        <StatCard icon={<CalendarClock size={22} />} value={dashboard?.pendingSchedules ?? 0} label="Schedules" helper="Active jobs" tone="info" />
      </div>

      <section className="document-workspace-panel payments-production-panel">
        <div className="document-workspace-section-title">
          <div><span className="enterprise-eyebrow">Legacy Payment Intake</span><h2>Import & Schedule</h2><p>Run one-time NDC imports or maintain automated trustee payment schedules.</p></div>
        </div>
        <div className="document-actions-layout document-actions-layout-polished payments-actions-layout">
          <section className="enterprise-card document-action-tile payments-action-tile">
            <div className="document-action-tile-header"><div className="document-action-icon payments-action-icon"><PlayCircle size={20} /></div><div><h3>Import NDC Payments</h3><p>Backed by POST /api/v1/ndc/payments/import.</p></div></div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Trustee Id</span><input className="evictsure-form-input" value={importForm.trusteeId} onChange={(event) => setImportForm((current) => ({ ...current, trusteeId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Check Number</span><input className="evictsure-form-input" value={importForm.checkNumber} onChange={(event) => setImportForm((current) => ({ ...current, checkNumber: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Payment Date</span><input className="evictsure-form-input" type="date" value={importForm.paymentDate} onChange={(event) => setImportForm((current) => ({ ...current, paymentDate: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Triggered By</span><input className="evictsure-form-input" value={importForm.triggeredBy} onChange={(event) => setImportForm((current) => ({ ...current, triggeredBy: event.target.value }))} /></label>
            </div>
            <div className="document-action-footer">
              <label className="document-inline-check"><input type="checkbox" checked={importForm.searchAllTime} onChange={(event) => setImportForm((current) => ({ ...current, searchAllTime: event.target.checked }))} /> Search all time</label>
              <Button disabled={importPayments.isPending} onClick={() => importPayments.mutate({ trusteeId: importForm.trusteeId || null, checkNumber: importForm.checkNumber || null, paymentDate: importForm.paymentDate || null, searchAllTime: importForm.searchAllTime, triggeredBy: importForm.triggeredBy || null })}>Run Import</Button>
            </div>
          </section>
          <section className="enterprise-card document-action-tile payments-action-tile">
            <div className="document-action-tile-header"><div className="document-action-icon payments-action-icon"><Settings2 size={20} /></div><div><h3>Create Schedule</h3><p>Backed by POST /api/v1/ndc/schedules.</p></div></div>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Trustee Id</span><input className="evictsure-form-input" value={scheduleForm.trusteeId} onChange={(event) => setScheduleForm((current) => ({ ...current, trusteeId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Frequency</span><select className="evictsure-form-select" value={scheduleForm.frequency} onChange={(event) => setScheduleForm((current) => ({ ...current, frequency: event.target.value }))}><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Check Number</span><input className="evictsure-form-input" value={scheduleForm.checkNumber} onChange={(event) => setScheduleForm((current) => ({ ...current, checkNumber: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Payment Date</span><input className="evictsure-form-input" type="date" value={scheduleForm.paymentDate} onChange={(event) => setScheduleForm((current) => ({ ...current, paymentDate: event.target.value }))} /></label>
            </div>
            <div className="document-action-footer">
              <label className="document-inline-check"><input type="checkbox" checked={scheduleForm.searchAllTime} onChange={(event) => setScheduleForm((current) => ({ ...current, searchAllTime: event.target.checked }))} /> Search all time</label>
              <Button disabled={createSchedule.isPending} onClick={() => createSchedule.mutate({ trusteeId: scheduleForm.trusteeId || null, checkNumber: scheduleForm.checkNumber || null, paymentDate: scheduleForm.paymentDate || null, searchAllTime: scheduleForm.searchAllTime, frequency: scheduleForm.frequency || null })}>Create Schedule</Button>
            </div>
          </section>
        </div>
      </section>

      <section className="document-library-card xocket-card payments-library-card">
        <div className="xocket-card-header">
          <div><span className="enterprise-eyebrow">Payment Operations</span><h2 className="xocket-card-title">Payment Workbench</h2><p className="xocket-card-subtitle">Search-first grids with review panels and verified claim posting.</p></div>
          <div className="payments-tab-strip">
            <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>Payments</button>
            <button className={activeTab === 'runs' ? 'active' : ''} onClick={() => setActiveTab('runs')}>Import Runs</button>
            <button className={activeTab === 'schedules' ? 'active' : ''} onClick={() => setActiveTab('schedules')}>Schedules</button>
          </div>
        </div>

        {activeTab === 'payments' ? <div className="xocket-card-body payments-tab-panel">
          <div className="document-search-form payments-search-form">
            <label><span>Search</span><input className="evictsure-form-input" value={paymentFilters.search} onChange={(event) => setPaymentFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Debtor, account, reference" /></label>
            <label><span>Trustee Id</span><input className="evictsure-form-input" value={paymentFilters.trusteeId} onChange={(event) => setPaymentFilters((current) => ({ ...current, trusteeId: event.target.value }))} /></label>
            <label><span>Case Number</span><input className="evictsure-form-input" value={paymentFilters.caseNumber} onChange={(event) => setPaymentFilters((current) => ({ ...current, caseNumber: event.target.value }))} /></label>
            <label><span>Claim Number</span><input className="evictsure-form-input" value={paymentFilters.claimNumber} onChange={(event) => setPaymentFilters((current) => ({ ...current, claimNumber: event.target.value }))} /></label>
            <label><span>Status</span><select className="evictsure-form-select" value={paymentFilters.mappingStatus} onChange={(event) => setPaymentFilters((current) => ({ ...current, mappingStatus: event.target.value === '' ? '' : Number(event.target.value) }))}><option value="">Any</option><option value="0">Unmapped</option><option value="1">Matched</option><option value="2">Exception</option><option value="3">Posted</option></select></label>
            <Button onClick={submitPaymentSearch}><Search size={16} /> Search</Button>
          </div>
          <EnterpriseGrid rows={paymentRows} columns={paymentColumns} height={560} isLoading={paymentsQuery.isFetching} emptyMessage="Search for NDC payments by trustee, case, claim, or reference." />
          <div className="enterprise-pagination"><span>Page {paymentsPage} of {paymentsTotalPages} · {paymentsQuery.data?.totalCount ?? 0} payments</span><div><Button variant="secondary" disabled={paymentsPage <= 1} onClick={() => setPaymentsPage((current) => Math.max(1, current - 1))}>Previous</Button><Button variant="secondary" disabled={paymentsPage >= paymentsTotalPages} onClick={() => setPaymentsPage((current) => current + 1)}>Next</Button></div></div>
        </div> : null}

        {activeTab === 'runs' ? <div className="xocket-card-body payments-tab-panel">
          <div className="document-search-form payments-search-form">
            <label><span>Search</span><input className="evictsure-form-input" value={runFilters.search} onChange={(event) => setRunFilters((current) => ({ ...current, search: event.target.value }))} /></label>
            <label><span>Trustee Id</span><input className="evictsure-form-input" value={runFilters.trusteeId} onChange={(event) => setRunFilters((current) => ({ ...current, trusteeId: event.target.value }))} /></label>
            <label><span>Status</span><input className="evictsure-form-input" value={runFilters.status} onChange={(event) => setRunFilters((current) => ({ ...current, status: event.target.value === '' ? '' : Number(event.target.value) }))} placeholder="Numeric status" /></label>
            <Button onClick={submitRunSearch}><Search size={16} /> Search Runs</Button>
          </div>
          <EnterpriseGrid rows={runRows} columns={runColumns} height={560} isLoading={runsQuery.isFetching} emptyMessage="Search for NDC import runs to review processing history." />
          <div className="enterprise-pagination"><span>Page {runsPage} of {runsTotalPages} · {runsQuery.data?.totalCount ?? 0} runs</span><div><Button variant="secondary" disabled={runsPage <= 1} onClick={() => setRunsPage((current) => Math.max(1, current - 1))}>Previous</Button><Button variant="secondary" disabled={runsPage >= runsTotalPages} onClick={() => setRunsPage((current) => current + 1)}>Next</Button></div></div>
        </div> : null}

        {activeTab === 'schedules' ? <div className="xocket-card-body payments-tab-panel">
          <div className="document-search-form payments-search-form">
            <label><span>Search</span><input className="evictsure-form-input" value={scheduleFilters.search} onChange={(event) => setScheduleFilters((current) => ({ ...current, search: event.target.value }))} /></label>
            <label><span>Trustee Id</span><input className="evictsure-form-input" value={scheduleFilters.trusteeId} onChange={(event) => setScheduleFilters((current) => ({ ...current, trusteeId: event.target.value }))} /></label>
            <label><span>Active</span><select className="evictsure-form-select" value={scheduleFilters.isActive} onChange={(event) => setScheduleFilters((current) => ({ ...current, isActive: event.target.value as '' | 'true' | 'false' }))}><option value="">Any</option><option value="true">Active</option><option value="false">Inactive</option></select></label>
            <Button onClick={submitScheduleSearch}><Search size={16} /> Search Schedules</Button>
          </div>
          <EnterpriseGrid rows={scheduleRows} columns={scheduleColumns} height={560} isLoading={schedulesQuery.isFetching || deactivateSchedule.isPending} emptyMessage="Search for payment import schedules." />
          <div className="enterprise-pagination"><span>Page {schedulesPage} of {schedulesTotalPages} · {schedulesQuery.data?.totalCount ?? 0} schedules</span><div><Button variant="secondary" disabled={schedulesPage <= 1} onClick={() => setSchedulesPage((current) => Math.max(1, current - 1))}>Previous</Button><Button variant="secondary" disabled={schedulesPage >= schedulesTotalPages} onClick={() => setSchedulesPage((current) => current + 1)}>Next</Button></div></div>
        </div> : null}
      </section>

      {selectedPayment ? <section className="xocket-card document-library-card payments-review-panel">
        <div className="xocket-card-header"><div><span className="enterprise-eyebrow">Payment Review</span><h2 className="xocket-card-title">{selectedPayment.referenceNumber ?? `Payment #${selectedPayment.paymentId}`}</h2><p className="xocket-card-subtitle">Verify mapping before posting to the claim ledger.</p></div><Button variant="secondary" onClick={() => setSelectedPayment(null)}>Close</Button></div>
        <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
          <StatCard icon={<Banknote size={22} />} value={formatCurrencyValue(selectedPayment.amount)} label="Amount" helper="NDC amount" tone="primary" />
          <StatCard icon={<CheckCircle2 size={22} />} value={selectedPayment.claimNumber ?? '-'} label="Claim Number" helper={selectedPayment.caseNumber ?? 'No case'} tone="success" />
          <StatCard icon={<Filter size={22} />} value={selectedPayment.mappingStatus ?? 'Unknown'} label="Mapping" helper="Backend status" tone="warning" />
        </div>
        <div className="document-actions-layout document-actions-layout-polished payments-actions-layout">
          <section className="enterprise-card document-action-tile payments-action-tile">
            <h3>Post to Claim</h3>
            <p className="workspace-muted">Backed by POST /api/v1/claims/{'{claimId}'}/payments/post. Enter the claim id confirmed by mapping review.</p>
            <div className="document-action-grid">
              <label className="evictsure-form-group"><span className="evictsure-form-label">Claim Id</span><input className="evictsure-form-input" value={postingForm.claimId} onChange={(event) => setPostingForm((current) => ({ ...current, claimId: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Amount</span><input className="evictsure-form-input" value={postingForm.amount} onChange={(event) => setPostingForm((current) => ({ ...current, amount: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Payment Date</span><input className="evictsure-form-input" type="date" value={postingForm.paymentDate} onChange={(event) => setPostingForm((current) => ({ ...current, paymentDate: event.target.value }))} /></label>
              <label className="evictsure-form-group"><span className="evictsure-form-label">Posted By</span><input className="evictsure-form-input" value={postingForm.postedBy} onChange={(event) => setPostingForm((current) => ({ ...current, postedBy: event.target.value }))} /></label>
            </div>
            <div className="document-action-footer"><label className="document-inline-check"><input type="checkbox" checked={postingForm.allowOverpayment} onChange={(event) => setPostingForm((current) => ({ ...current, allowOverpayment: event.target.checked }))} /> Allow overpayment</label><Button disabled={postPaymentToClaim.isPending} onClick={submitPosting}>Post Payment</Button></div>
          </section>
          <section className="enterprise-card document-action-tile payments-action-tile"><h3>Review Summary</h3><p>Debtor: {selectedPayment.debtorName ?? '-'}</p><p>Account: {selectedPayment.accountNumber ?? '-'}</p><p>Trustee: {selectedPayment.trusteeName ?? selectedPayment.trusteeId ?? '-'}</p><p>Reference: {selectedPayment.referenceNumber ?? '-'}</p></section>
        </div>
      </section> : null}

      {selectedRunId ? <section className="xocket-card document-library-card payments-review-panel">
        <div className="xocket-card-header"><div><span className="enterprise-eyebrow">Import Run Detail</span><h2 className="xocket-card-title">Run #{selectedRunId}</h2><p className="xocket-card-subtitle">Backed by GET /api/v1/ndc/import-runs/{'{runId}'}.</p></div><Button variant="secondary" onClick={() => setSelectedRunId(null)}>Close</Button></div>
        {runDetailQuery.isFetching ? <p className="workspace-muted">Loading import run detail...</p> : <>
          <div className="stat-grid placement-stat-grid placement-stat-grid-wide">
            <StatCard icon={<WalletCards size={22} />} value={runDetailQuery.data?.totalRecords ?? 0} label="Records" helper="Total processed" tone="primary" />
            <StatCard icon={<CheckCircle2 size={22} />} value={runDetailQuery.data?.matchedRecords ?? 0} label="Matched" helper="Mapped records" tone="success" />
            <StatCard icon={<AlertTriangle size={22} />} value={runDetailQuery.data?.exceptionRecords ?? 0} label="Exceptions" helper="Requires review" tone="warning" />
          </div>
          <div className="document-actions-layout document-actions-layout-polished payments-actions-layout">
            <section className="enterprise-card document-action-tile payments-action-tile"><h3>Run Summary</h3><p>Trustee: {runDetailQuery.data?.trusteeId ?? '-'}</p><p>Check: {runDetailQuery.data?.checkNumber ?? '-'}</p><p>Status: {runDetailQuery.data?.status ?? '-'}</p><p>Started: {formatDate(runDetailQuery.data?.startedUtc)}</p><p>Completed: {formatDate(runDetailQuery.data?.completedUtc)}</p></section>
            <section className="enterprise-card document-action-tile payments-action-tile"><h3>Validation / Errors</h3>{(runDetailQuery.data?.errors.length ?? 0) === 0 ? <p className="workspace-muted">No error rows returned by backend detail.</p> : runDetailQuery.data?.errors.slice(0, 8).map((error) => <p key={error.id}><strong>{error.severity ?? 'Error'}:</strong> {error.message ?? '-'} {error.lineNumber ? `(line ${error.lineNumber})` : ''}</p>)}</section>
          </div>
        </>}
      </section> : null}
    </div>
  );
}
