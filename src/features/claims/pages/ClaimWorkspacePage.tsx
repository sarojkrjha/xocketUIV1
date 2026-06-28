import { useMemo, useState } from 'react';
import { ArrowLeft, Banknote, FileArchive, FileCheck2, FileText, RefreshCcw, ReceiptText, Scale } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/shared/components/Button';
import { StatCard } from '@/shared/components/StatCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { queryKeys } from '@/shared/api/queryKeys';
import { claimStatusOptions } from '../api/claimStatusMaps';
import { addClaimPayment, advanceClaimStatus, prepareFilingPackage, processReceipt, registerFiling } from '../api/claimsApi';
import { ClaimDocumentsPanel, ClaimPaymentsPanel, ClaimTasksPanel, ClaimTimelinePanel } from '../components/ClaimRelatedPanels';
import { ClaimWorkflowPanel } from '../components/ClaimWorkflowPanel';
import { ClaimLifecyclePanel } from '../components/ClaimLifecyclePanel';
import { useClaimDetail } from '../hooks/useClaimDetail';
import type { ClaimDetail } from '../types/claims';

type ClaimWorkspacePageProps = {
  claimId: number;
  onBack: () => void;
};

const tabs = ['overview', 'lifecycle', 'documents', 'payments', 'timeline', 'workflow', 'tasks'] as const;
type ClaimTab = typeof tabs[number];
type ActionDialog = 'filing-package' | 'register-filing' | 'receipt' | 'payment' | 'advance' | null;

type ClaimActionForm = {
  requestedBy: string;
  forceRegenerate: boolean;
  generatePdf: boolean;
  filingPackageId: string;
  filedBy: string;
  filedOnUtc: string;
  trackingNumber: string;
  courtClaimNumber: string;
  filingNotes: string;
  receiptDocumentId: string;
  filingRegistrationId: string;
  courtReceiptNumber: string;
  receiptDateUtc: string;
  receiptNotes: string;
  paymentAmount: string;
  paymentDate: string;
  paymentReference: string;
  paymentCreatedBy: string;
  toStatus: string;
  statusReason: string;
  changedBy: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const nowLocalDateTime = () => new Date().toISOString().slice(0, 16);

function buildInitialActionForm(claim: ClaimDetail | undefined): ClaimActionForm {
  return {
    requestedBy: 'UI User',
    forceRegenerate: false,
    generatePdf: true,
    filingPackageId: claim?.filingPackageId ? String(claim.filingPackageId) : '',
    filedBy: 'UI User',
    filedOnUtc: nowLocalDateTime(),
    trackingNumber: '',
    courtClaimNumber: claim?.courtClaimNumber ?? '',
    filingNotes: '',
    receiptDocumentId: '',
    filingRegistrationId: '',
    courtReceiptNumber: '',
    receiptDateUtc: nowLocalDateTime(),
    receiptNotes: '',
    paymentAmount: '',
    paymentDate: today(),
    paymentReference: '',
    paymentCreatedBy: 'UI User',
    toStatus: '',
    statusReason: '',
    changedBy: 'UI User'
  };
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

function display(value?: string | number | null) {
  return value ?? '-';
}

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function requiredNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

function localDateTimeToIso(value: string): string | null {
  if (!value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="placement-detail-field">
      <span>{label}</span>
      <strong>{display(value)}</strong>
    </div>
  );
}

function ClaimWorkspaceSkeleton() {
  return (
    <div className="placement-detail-skeleton">
      <div />
      <div />
      <div />
    </div>
  );
}

function ClaimOverview({ claim }: { claim: ClaimDetail }) {
  return (
    <div className="placement-detail-grid">
      <section className="xocket-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Claim Context</h2>
            <p className="xocket-card-subtitle">Account, bankruptcy case, amount, and filing context.</p>
          </div>
        </div>
        <div className="placement-detail-fields">
          <Field label="Claim ID" value={claim.claimId} />
          <Field label="Account ID" value={claim.accountId} />
          <Field label="Account Number" value={claim.accountNumber} />
          <Field label="Debtor" value={claim.debtorName} />
          <Field label="Debtor Last 4" value={claim.debtorLast4 ? `XXX-XX-${claim.debtorLast4}` : '-'} />
          <Field label="Claim Amount" value={formatCurrency(claim.claimAmount)} />
          <Field label="Paid Amount" value={formatCurrency(claim.paidAmount)} />
          <Field label="Remaining Balance" value={formatCurrency(claim.remainingBalance)} />
        </div>
      </section>

      <section className="xocket-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Bankruptcy & Filing</h2>
            <p className="xocket-card-subtitle">Case, court, trustee, attorney, and court claim information.</p>
          </div>
        </div>
        <div className="placement-detail-fields">
          <Field label="Case Number" value={claim.bankruptcyCaseNumber} />
          <Field label="Case ID" value={claim.bankruptcyCaseId} />
          <Field label="Court" value={claim.courtName} />
          <Field label="Trustee" value={claim.trusteeName} />
          <Field label="Attorney" value={claim.attorneyName} />
          <Field label="Bar Date" value={formatDate(claim.barDate)} />
          <Field label="Filed On" value={formatDate(claim.filedOnUtc)} />
          <Field label="Court Claim Number" value={claim.courtClaimNumber} />
        </div>
      </section>
    </div>
  );
}

function ClaimReadinessPanel({ claim, onAction }: { claim: ClaimDetail; onAction: (dialog: ActionDialog) => void }) {
  const checks = [
    { label: 'Account linked', pass: Boolean(claim.accountId), detail: claim.accountNumber ?? `Account #${claim.accountId ?? '-'}` },
    { label: 'Bankruptcy case linked', pass: Boolean(claim.bankruptcyCaseId), detail: claim.bankruptcyCaseNumber ?? `Case #${claim.bankruptcyCaseId ?? '-'}` },
    { label: 'Claim amount available', pass: Boolean(claim.claimAmount && claim.claimAmount > 0), detail: formatCurrency(claim.claimAmount) },
    { label: 'Attorney assigned', pass: Boolean(claim.attorneyName), detail: claim.attorneyName ?? 'Use Lifecycle → Eligibility & Attorney' },
    { label: 'Filing package', pass: Boolean(claim.filingPackageId || claim.documents.some((x) => (x.documentType ?? '').toLowerCase().includes('filing'))), detail: claim.filingPackageId ? `Package #${claim.filingPackageId}` : 'Generate from action panel' },
    { label: 'Court claim number', pass: Boolean(claim.courtClaimNumber), detail: claim.courtClaimNumber ?? 'Register after external filing' },
    { label: 'Receipt processed', pass: Boolean((claim.receiptStatus ?? '').toLowerCase().includes('received') || claim.workflowEvents.some((x) => x.title.toLowerCase().includes('receipt'))), detail: claim.receiptStatus ?? 'Receipt pending' },
    { label: 'Payments reconciled', pass: Boolean((claim.paidAmount ?? 0) > 0 || claim.payments.length > 0), detail: `${claim.payments.length} payment(s)` }
  ];

  const completed = checks.filter((x) => x.pass).length;

  return (
    <section className="xocket-card claim-readiness-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">Claim Lifecycle Readiness</h2>
          <p className="xocket-card-subtitle">Legacy parity checklist for claim creation, filing, receipt, payment, and close readiness.</p>
        </div>
        <span className="xocket-pill xocket-pill-primary">{completed}/{checks.length}</span>
      </div>
      <div className="claim-readiness-grid">
        {checks.map((check) => (
          <div className={`claim-readiness-item ${check.pass ? 'complete' : 'blocked'}`} key={check.label}>
            <strong>{check.pass ? '✓' : '!' } {check.label}</strong>
            <span>{check.detail}</span>
          </div>
        ))}
      </div>
      <div className="claim-readiness-actions">
        <Button variant="secondary" onClick={() => onAction('filing-package')}>Generate Package</Button>
        <Button variant="secondary" onClick={() => onAction('register-filing')}>Register Filing</Button>
        <Button variant="secondary" onClick={() => onAction('receipt')}>Process Receipt</Button>
        <Button variant="secondary" onClick={() => onAction('payment')}>Post Payment</Button>
      </div>
    </section>
  );
}

function ClaimActionDialog({
  dialog,
  form,
  onClose,
  onChange,
  onSubmit,
  isPending,
  error
}: {
  dialog: Exclude<ActionDialog, null>;
  form: ClaimActionForm;
  onClose: () => void;
  onChange: <K extends keyof ClaimActionForm>(key: K, value: ClaimActionForm[K]) => void;
  onSubmit: () => void;
  isPending: boolean;
  error?: Error | null;
}) {
  const titles: Record<Exclude<ActionDialog, null>, { title: string; subtitle: string; endpoint: string }> = {
    'filing-package': { title: 'Prepare Filing Package', subtitle: 'Generate or regenerate court filing package using the claim API.', endpoint: 'POST /api/v1/claims/{claimId}/filing-package' },
    'register-filing': { title: 'Register Filing', subtitle: 'Record the external court filing result after attorney/filer action.', endpoint: 'POST /api/v1/claims/{claimId}/register-filing' },
    receipt: { title: 'Process Receipt', subtitle: 'Record court receipt details against the filed claim.', endpoint: 'POST /api/v1/claims/{claimId}/receipt' },
    payment: { title: 'Add Claim Payment', subtitle: 'Add a claim payment entry using the basic payment endpoint.', endpoint: 'POST /api/v1/claims/{claimId}/payments' },
    advance: { title: 'Advance Claim Status', subtitle: 'Move a claim to a backend status code. Codes are from the current Swagger/UI map.', endpoint: 'PUT /api/v1/claims/{claimId}/status' }
  };

  const meta = titles[dialog];

  return (
    <div className="xocket-modal-backdrop" role="presentation">
      <section className="xocket-modal" role="dialog" aria-modal="true" aria-labelledby="claim-action-title">
        <div className="xocket-modal-header">
          <div>
            <span className="xocket-pill xocket-pill-primary">{meta.endpoint}</span>
            <h2 id="claim-action-title">{meta.title}</h2>
            <p>{meta.subtitle}</p>
          </div>
          <button className="xocket-modal-close" type="button" onClick={onClose} aria-label="Close claim action dialog">×</button>
        </div>

        {dialog === 'filing-package' ? (
          <div className="form-grid">
            <label>Requested By<input value={form.requestedBy} onChange={(event) => onChange('requestedBy', event.target.value)} /></label>
            <label className="checkbox-field"><input type="checkbox" checked={form.generatePdf} onChange={(event) => onChange('generatePdf', event.target.checked)} /> Generate PDF</label>
            <label className="checkbox-field"><input type="checkbox" checked={form.forceRegenerate} onChange={(event) => onChange('forceRegenerate', event.target.checked)} /> Force regenerate</label>
          </div>
        ) : null}

        {dialog === 'register-filing' ? (
          <div className="form-grid">
            <label>Filing Package ID<input value={form.filingPackageId} onChange={(event) => onChange('filingPackageId', event.target.value)} placeholder="Optional" /></label>
            <label>Filed By<input value={form.filedBy} onChange={(event) => onChange('filedBy', event.target.value)} /></label>
            <label>Filed On<input type="datetime-local" value={form.filedOnUtc} onChange={(event) => onChange('filedOnUtc', event.target.value)} /></label>
            <label>Tracking Number<input value={form.trackingNumber} onChange={(event) => onChange('trackingNumber', event.target.value)} /></label>
            <label>Court Claim Number<input value={form.courtClaimNumber} onChange={(event) => onChange('courtClaimNumber', event.target.value)} /></label>
            <label>Notes<input value={form.filingNotes} onChange={(event) => onChange('filingNotes', event.target.value)} /></label>
          </div>
        ) : null}

        {dialog === 'receipt' ? (
          <div className="form-grid">
            <label>Receipt Document ID <span className="required-marker">*</span><input value={form.receiptDocumentId} onChange={(event) => onChange('receiptDocumentId', event.target.value)} placeholder="Required by API" /></label>
            <label>Filing Registration ID<input value={form.filingRegistrationId} onChange={(event) => onChange('filingRegistrationId', event.target.value)} /></label>
            <label>Court Receipt Number<input value={form.courtReceiptNumber} onChange={(event) => onChange('courtReceiptNumber', event.target.value)} /></label>
            <label>Receipt Date<input type="datetime-local" value={form.receiptDateUtc} onChange={(event) => onChange('receiptDateUtc', event.target.value)} /></label>
            <label>Received By<input value={form.paymentCreatedBy} onChange={(event) => onChange('paymentCreatedBy', event.target.value)} /></label>
            <label>Notes<input value={form.receiptNotes} onChange={(event) => onChange('receiptNotes', event.target.value)} /></label>
          </div>
        ) : null}

        {dialog === 'payment' ? (
          <div className="form-grid">
            <label>Amount <span className="required-marker">*</span><input value={form.paymentAmount} onChange={(event) => onChange('paymentAmount', event.target.value)} placeholder="500.00" /></label>
            <label>Payment Date<input type="date" value={form.paymentDate} onChange={(event) => onChange('paymentDate', event.target.value)} /></label>
            <label>Reference Number<input value={form.paymentReference} onChange={(event) => onChange('paymentReference', event.target.value)} /></label>
            <label>Created By<input value={form.paymentCreatedBy} onChange={(event) => onChange('paymentCreatedBy', event.target.value)} /></label>
          </div>
        ) : null}

        {dialog === 'advance' ? (
          <div className="form-grid">
            <label>Status <span className="required-marker">*</span><select value={form.toStatus} onChange={(event) => onChange('toStatus', event.target.value)}><option value="">Select status</option>{claimStatusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
            <label>Changed By<input value={form.changedBy} onChange={(event) => onChange('changedBy', event.target.value)} /></label>
            <label>Reason<input value={form.statusReason} onChange={(event) => onChange('statusReason', event.target.value)} /></label>
          </div>
        ) : null}

        {error ? <div className="xocket-alert xocket-alert-danger">{error.message || 'Claim action failed.'}</div> : null}

        <div className="xocket-modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={isPending} onClick={onSubmit}>{isPending ? 'Saving...' : 'Submit'}</Button>
        </div>
      </section>
    </div>
  );
}

export function ClaimWorkspacePage({ claimId, onBack }: ClaimWorkspacePageProps) {
  const [activeTab, setActiveTab] = useState<ClaimTab>('overview');
  const [dialog, setDialog] = useState<ActionDialog>(null);
  const claimQuery = useClaimDetail(claimId);
  const claim = claimQuery.data;
  const [actionForm, setActionForm] = useState<ClaimActionForm>(() => buildInitialActionForm(claim));
  const [actionError, setActionError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const refreshClaim = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.claims.detail(claimId) });
    claimQuery.refetch();
  };

  const openDialog = (nextDialog: ActionDialog) => {
    setActionError(null);
    setActionForm(buildInitialActionForm(claim));
    setDialog(nextDialog);
  };

  const updateActionForm = <K extends keyof ClaimActionForm>(key: K, value: ClaimActionForm[K]) => {
    setActionError(null);
    setActionForm((current) => ({ ...current, [key]: value }));
  };

  const filingPackageMutation = useMutation({
    mutationFn: () => prepareFilingPackage({ claimId, requestedBy: actionForm.requestedBy || 'UI User', forceRegenerate: actionForm.forceRegenerate, generatePdf: actionForm.generatePdf }),
    onSuccess: () => { setDialog(null); refreshClaim(); },
    onError: (error) => setActionError(error as Error)
  });

  const registerFilingMutation = useMutation({
    mutationFn: () => registerFiling({
      claimId,
      filingPackageId: optionalNumber(actionForm.filingPackageId),
      filedBy: actionForm.filedBy || null,
      filedOnUtc: localDateTimeToIso(actionForm.filedOnUtc),
      trackingNumber: actionForm.trackingNumber || null,
      courtClaimNumber: actionForm.courtClaimNumber || null,
      notes: actionForm.filingNotes || null,
      registeredBy: actionForm.changedBy || 'UI User',
      force: false
    }),
    onSuccess: () => { setDialog(null); refreshClaim(); },
    onError: (error) => setActionError(error as Error)
  });

  const receiptMutation = useMutation({
    mutationFn: () => processReceipt({
      claimId,
      filingRegistrationId: optionalNumber(actionForm.filingRegistrationId),
      receiptDocumentId: requiredNumber(actionForm.receiptDocumentId),
      courtReceiptNumber: actionForm.courtReceiptNumber || null,
      receiptDateUtc: localDateTimeToIso(actionForm.receiptDateUtc),
      receivedBy: actionForm.paymentCreatedBy || 'UI User',
      notes: actionForm.receiptNotes || null,
      validateImmediately: true,
      force: false
    }),
    onSuccess: () => { setDialog(null); refreshClaim(); },
    onError: (error) => setActionError(error as Error)
  });

  const paymentMutation = useMutation({
    mutationFn: () => addClaimPayment({ claimId, amount: requiredNumber(actionForm.paymentAmount), paymentDate: actionForm.paymentDate || today(), referenceNumber: actionForm.paymentReference || null, createdBy: actionForm.paymentCreatedBy || 'UI User' }),
    onSuccess: () => { setDialog(null); refreshClaim(); },
    onError: (error) => setActionError(error as Error)
  });

  const advanceMutation = useMutation({
    mutationFn: () => advanceClaimStatus({ claimId, toStatus: requiredNumber(actionForm.toStatus), changedBy: actionForm.changedBy || 'UI User', reason: actionForm.statusReason || null }),
    onSuccess: () => { setDialog(null); refreshClaim(); },
    onError: (error) => setActionError(error as Error)
  });

  const pendingByDialog = useMemo(() => ({
    'filing-package': filingPackageMutation.isPending,
    'register-filing': registerFilingMutation.isPending,
    receipt: receiptMutation.isPending,
    payment: paymentMutation.isPending,
    advance: advanceMutation.isPending
  }), [advanceMutation.isPending, filingPackageMutation.isPending, paymentMutation.isPending, receiptMutation.isPending, registerFilingMutation.isPending]);

  const submitDialog = () => {
    setActionError(null);
    if (dialog === 'receipt' && requiredNumber(actionForm.receiptDocumentId) <= 0) {
      setActionError(new Error('Receipt Document ID is required by the current API. Upload the receipt through Documents/Filing first, then process it here.'));
      return;
    }
    if (dialog === 'payment' && requiredNumber(actionForm.paymentAmount) <= 0) {
      setActionError(new Error('Payment amount must be greater than zero.'));
      return;
    }
    if (dialog === 'advance' && requiredNumber(actionForm.toStatus) < 0) {
      setActionError(new Error('Select a target claim status.'));
      return;
    }

    if (dialog === 'filing-package') filingPackageMutation.mutate();
    if (dialog === 'register-filing') registerFilingMutation.mutate();
    if (dialog === 'receipt') receiptMutation.mutate();
    if (dialog === 'payment') paymentMutation.mutate();
    if (dialog === 'advance') advanceMutation.mutate();
  };

  const renderTab = (claimData: ClaimDetail) => {
    switch (activeTab) {
      case 'lifecycle':
        return <ClaimLifecyclePanel claim={claimData} onRefresh={refreshClaim} />;
      case 'documents':
        return <ClaimDocumentsPanel claim={claimData} />;
      case 'payments':
        return <ClaimPaymentsPanel claim={claimData} />;
      case 'timeline':
        return <ClaimTimelinePanel claim={claimData} />;
      case 'workflow':
        return <ClaimWorkflowPanel claim={claimData} />;
      case 'tasks':
        return <ClaimTasksPanel />;
      default:
        return <ClaimOverview claim={claimData} />;
    }
  };

  return (
    <div className="claims-page claim-workspace-page">
      <section className="placement-hero xocket-card claims-hero">
        <div>
          <button className="placement-link-button" type="button" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Claims Queue
          </button>
          <span className="xocket-pill xocket-pill-primary">Claim Workspace</span>
          <h1>{claim?.courtClaimNumber ?? `Claim #${claimId}`}</h1>
          <p>Manage POC workflow, filing package, receipt, payments, timeline, and documents from one workspace.</p>
        </div>
        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => claimQuery.refetch()}><RefreshCcw size={16} /> Refresh</Button>
          <Button variant="secondary" onClick={() => openDialog('filing-package')}><FileArchive size={16} /> Filing Package</Button>
          <Button variant="secondary" onClick={() => openDialog('register-filing')}><FileCheck2 size={16} /> Register Filing</Button>
          <Button variant="secondary" onClick={() => openDialog('receipt')}><ReceiptText size={16} /> Process Receipt</Button>
          <Button variant="secondary" onClick={() => openDialog('payment')}><Banknote size={16} /> Add Payment</Button>
          <Button onClick={() => openDialog('advance')}><Scale size={16} /> Advance</Button>
        </div>
      </section>

      {claimQuery.isError ? (
        <div className="xocket-alert xocket-alert-danger">{(claimQuery.error as Error).message || 'Unable to load claim.'}</div>
      ) : null}

      {claimQuery.isLoading || !claim ? (
        <ClaimWorkspaceSkeleton />
      ) : (
        <>
          <div className="stat-grid placement-stat-grid">
            <StatCard icon={<FileText size={22} />} value={claim.status ?? 'Draft'} label="Claim Status" helper="Current POC state" tone="primary" />
            <StatCard icon={<Scale size={22} />} value={formatCurrency(claim.claimAmount)} label="Claim Amount" helper="Amount filed or prepared" tone="success" />
            <StatCard icon={<ReceiptText size={22} />} value={claim.receiptStatus ?? 'Pending'} label="Receipt" helper={claim.courtClaimNumber ?? 'Court claim pending'} tone="warning" />
            <StatCard icon={<Banknote size={22} />} value={formatCurrency(claim.remainingBalance)} label="Remaining" helper="Claim balance after payments" tone="info" />
          </div>

          <ClaimReadinessPanel claim={claim} onAction={openDialog} />

          <section className="xocket-card claim-tabs-card">
            <div className="account-tabs claims-tabs" role="tablist">
              {tabs.map((tab) => (
                <button key={tab} className={activeTab === tab ? 'active' : ''} type="button" onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="claim-tab-content">{renderTab(claim)}</div>
          </section>

          <ClaimWorkflowPanel claim={claim} />
        </>
      )}

      {dialog ? (
        <ClaimActionDialog
          dialog={dialog}
          form={actionForm}
          onChange={updateActionForm}
          onClose={() => setDialog(null)}
          onSubmit={submitDialog}
          isPending={pendingByDialog[dialog]}
          error={actionError}
        />
      ) : null}
    </div>
  );
}
