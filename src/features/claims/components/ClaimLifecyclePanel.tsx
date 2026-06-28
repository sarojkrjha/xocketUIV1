import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, Banknote, GitBranch, Landmark, Scale, ShieldCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { queryKeys } from '@/shared/api/queryKeys';
import {
  assignAttorney,
  checkClaimEligibility,
  createClaimAmendment,
  createClaimObjection,
  createClaimTransfer,
  markClaimAmendmentFiled,
  markClaimObjectionResponded,
  markClaimTransferAccepted,
  markClaimTransferFiled,
  postClaimPayment,
  processBankruptcyEvent,
  resolveClaimObjection
} from '../api/claimsApi';
import { useClaimLifecycle } from '../hooks/useClaimLifecycle';
import type { ClaimDetail } from '../types/claims';

type ClaimLifecyclePanelProps = {
  claim: ClaimDetail;
  onRefresh: () => void;
};

type ActionState = {
  amount: string;
  reason: string;
  objectionType: string;
  objectionReason: string;
  responseDueDate: string;
  fromCreditor: string;
  toCreditor: string;
  effectiveDate: string;
  paymentReference: string;
  bankruptcyEventType: string;
  eventNotes: string;
  resolution: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const nowUtc = () => new Date().toISOString();

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

function numberOrZero(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function LifecycleActionCard({
  icon,
  title,
  description,
  children
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="xocket-card claim-lifecycle-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">{icon} {title}</h2>
          <p className="xocket-card-subtitle">{description}</p>
        </div>
      </div>
      <div className="claim-lifecycle-body">{children}</div>
    </section>
  );
}

export function ClaimLifecyclePanel({ claim, onRefresh }: ClaimLifecyclePanelProps) {
  const [state, setState] = useState<ActionState>({
    amount: claim.claimAmount?.toString() ?? '',
    reason: '',
    objectionType: 'Amount Dispute',
    objectionReason: '',
    responseDueDate: today(),
    fromCreditor: '',
    toCreditor: '',
    effectiveDate: today(),
    paymentReference: '',
    bankruptcyEventType: 'Case Status Change',
    eventNotes: '',
    resolution: ''
  });
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const lifecycle = useClaimLifecycle(claim.claimId);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.claims.detail(claim.claimId) });
    onRefresh();
  };

  const eligibilityMutation = useMutation({
    mutationFn: () => checkClaimEligibility({
      accountId: claim.accountId ?? 0,
      bankruptcyCaseId: claim.bankruptcyCaseId ?? undefined,
      claimAmount: claim.claimAmount ?? undefined,
      barDate: claim.barDate,
      requestedBy: 'UI'
    }),
    onSuccess: (result) => {
      setMessage(`${result.eligible === false ? 'Not eligible' : 'Eligibility checked'}${result.reason ? `: ${result.reason}` : ''}`);
    }
  });

  const attorneyMutation = useMutation({
    mutationFn: () => assignAttorney({ claimId: claim.claimId, assignedBy: 'UI', forceReassign: true }),
    onSuccess: invalidateAll
  });

  const amendmentMutation = useMutation({
    mutationFn: () => createClaimAmendment({ claimId: claim.claimId, newClaimAmount: numberOrZero(state.amount), reason: state.reason || null, createdBy: 'UI' }),
    onSuccess: invalidateAll
  });

  const objectionMutation = useMutation({
    mutationFn: () => createClaimObjection({ claimId: claim.claimId, objectionType: state.objectionType || null, objectionReason: state.objectionReason || null, responseDueDate: state.responseDueDate || null, createdBy: 'UI' }),
    onSuccess: invalidateAll
  });

  const transferMutation = useMutation({
    mutationFn: () => createClaimTransfer({ claimId: claim.claimId, fromCreditor: state.fromCreditor || null, toCreditor: state.toCreditor || null, effectiveDate: state.effectiveDate || today(), createdBy: 'UI' }),
    onSuccess: invalidateAll
  });

  const paymentMutation = useMutation({
    mutationFn: () => postClaimPayment({ claimId: claim.claimId, amount: numberOrZero(state.amount), paymentDate: today(), referenceNumber: state.paymentReference || null, postedBy: 'UI', sourceSystem: 'Manual', allowOverpayment: false }),
    onSuccess: invalidateAll
  });

  const eventMutation = useMutation({
    mutationFn: () => processBankruptcyEvent({ claimId: claim.claimId, bankruptcyCaseId: claim.bankruptcyCaseId, bankruptcyEventType: state.bankruptcyEventType || null, eventDateUtc: nowUtc(), source: 'UI', processedBy: 'UI', notes: state.eventNotes || null, force: false }),
    onSuccess: invalidateAll
  });

  const lifecycleError = [lifecycle.amendments.error, lifecycle.objections.error, lifecycle.transfers.error].find(Boolean) as Error | undefined;
  const busy = [eligibilityMutation, attorneyMutation, amendmentMutation, objectionMutation, transferMutation, paymentMutation, eventMutation].some((x) => x.isPending);

  const eligibilitySummary = useMemo(() => {
    const data = eligibilityMutation.data;
    if (!data) return null;
    return (
      <div className={`claim-lifecycle-result ${data.eligible === false ? 'danger' : 'success'}`}>
        <strong>{data.decision ?? (data.eligible === false ? 'Not Eligible' : 'Eligible')}</strong>
        <span>{data.reason ?? 'Eligibility API returned a successful decision.'}</span>
        {data.missingRequirements.length > 0 ? <small>Missing: {data.missingRequirements.join(', ')}</small> : null}
        {data.warnings.length > 0 ? <small>Warnings: {data.warnings.join(', ')}</small> : null}
      </div>
    );
  }, [eligibilityMutation.data]);

  return (
    <div className="claim-lifecycle-grid">
      {message ? <div className="xocket-alert xocket-alert-success claim-lifecycle-banner">{message}</div> : null}
      {lifecycleError ? <div className="xocket-alert xocket-alert-danger claim-lifecycle-banner">{lifecycleError.message || 'Unable to load one or more lifecycle lists.'}</div> : null}

      <LifecycleActionCard icon={<ShieldCheck size={18} />} title="Eligibility & Attorney" description="Validate claim filing eligibility and trigger attorney assignment using dedicated Claims APIs.">
        <div className="claim-lifecycle-actions">
          <Button variant="secondary" disabled={busy || !claim.accountId} onClick={() => eligibilityMutation.mutate()}>Check Eligibility</Button>
          <Button disabled={busy} onClick={() => attorneyMutation.mutate()}>Assign Attorney</Button>
        </div>
        {eligibilitySummary}
      </LifecycleActionCard>

      <LifecycleActionCard icon={<Scale size={18} />} title="Amendments" description="Create amendments, then mark them as filed after attorney/court confirmation.">
        <div className="claim-inline-form">
          <label>New Claim Amount<input value={state.amount} onChange={(e) => setState((x) => ({ ...x, amount: e.target.value }))} /></label>
          <label>Reason<input value={state.reason} onChange={(e) => setState((x) => ({ ...x, reason: e.target.value }))} /></label>
          <Button disabled={busy || numberOrZero(state.amount) <= 0} onClick={() => amendmentMutation.mutate()}>Create Amendment</Button>
        </div>
        <div className="claim-list-stack claim-lifecycle-list">
          {(lifecycle.amendments.data ?? []).map((item) => (
            <div className="claim-list-item" key={item.amendmentId}>
              <div><strong>{formatCurrency(item.newClaimAmount)}</strong><span>{item.reason ?? 'No reason'} · {formatDate(item.createdOnUtc)}</span></div>
              <div className="claim-row-actions"><StatusBadge label={item.status ?? 'Amendment'} /><Button variant="secondary" onClick={() => markClaimAmendmentFiled(item.amendmentId).then(invalidateAll)}>Filed</Button></div>
            </div>
          ))}
        </div>
      </LifecycleActionCard>

      <LifecycleActionCard icon={<AlertTriangle size={18} />} title="Objections" description="Record objections, track response dates, and resolve objection workflow items.">
        <div className="claim-inline-form three-col">
          <label>Type<input value={state.objectionType} onChange={(e) => setState((x) => ({ ...x, objectionType: e.target.value }))} /></label>
          <label>Response Due<input type="date" value={state.responseDueDate} onChange={(e) => setState((x) => ({ ...x, responseDueDate: e.target.value }))} /></label>
          <label>Reason<input value={state.objectionReason} onChange={(e) => setState((x) => ({ ...x, objectionReason: e.target.value }))} /></label>
          <Button disabled={busy} onClick={() => objectionMutation.mutate()}>Create Objection</Button>
        </div>
        <div className="claim-list-stack claim-lifecycle-list">
          {(lifecycle.objections.data ?? []).map((item) => (
            <div className="claim-list-item" key={item.objectionId}>
              <div><strong>{item.objectionType ?? `Objection #${item.objectionId}`}</strong><span>{item.objectionReason ?? 'No reason'} · Due {formatDate(item.responseDueDate)}</span></div>
              <div className="claim-row-actions"><StatusBadge label={item.status ?? 'Open'} /><Button variant="secondary" onClick={() => markClaimObjectionResponded(item.objectionId).then(invalidateAll)}>Responded</Button><Button onClick={() => resolveClaimObjection({ objectionId: item.objectionId, resolution: state.resolution || 'Resolved from UI' }).then(invalidateAll)}>Resolve</Button></div>
            </div>
          ))}
        </div>
      </LifecycleActionCard>

      <LifecycleActionCard icon={<GitBranch size={18} />} title="Transfers" description="Track transfer of claim ownership through filed and accepted states.">
        <div className="claim-inline-form three-col">
          <label>From Creditor<input value={state.fromCreditor} onChange={(e) => setState((x) => ({ ...x, fromCreditor: e.target.value }))} /></label>
          <label>To Creditor<input value={state.toCreditor} onChange={(e) => setState((x) => ({ ...x, toCreditor: e.target.value }))} /></label>
          <label>Effective Date<input type="date" value={state.effectiveDate} onChange={(e) => setState((x) => ({ ...x, effectiveDate: e.target.value }))} /></label>
          <Button disabled={busy} onClick={() => transferMutation.mutate()}>Create Transfer</Button>
        </div>
        <div className="claim-list-stack claim-lifecycle-list">
          {(lifecycle.transfers.data ?? []).map((item) => (
            <div className="claim-list-item" key={item.transferId}>
              <div><strong>{item.fromCreditor ?? '-'} → {item.toCreditor ?? '-'}</strong><span>Effective {formatDate(item.effectiveDate)}</span></div>
              <div className="claim-row-actions"><StatusBadge label={item.status ?? 'Transfer'} /><Button variant="secondary" onClick={() => markClaimTransferFiled(item.transferId).then(invalidateAll)}>Filed</Button><Button onClick={() => markClaimTransferAccepted(item.transferId).then(invalidateAll)}>Accepted</Button></div>
            </div>
          ))}
        </div>
      </LifecycleActionCard>

      <LifecycleActionCard icon={<Banknote size={18} />} title="Payment Posting" description="Use the stronger post-payment endpoint for NDC/manual payment reconciliation.">
        <div className="claim-inline-form">
          <label>Amount<input value={state.amount} onChange={(e) => setState((x) => ({ ...x, amount: e.target.value }))} /></label>
          <label>Reference<input value={state.paymentReference} onChange={(e) => setState((x) => ({ ...x, paymentReference: e.target.value }))} /></label>
          <Button disabled={busy || numberOrZero(state.amount) <= 0} onClick={() => paymentMutation.mutate()}>Post Payment</Button>
        </div>
      </LifecycleActionCard>

      <LifecycleActionCard icon={<Landmark size={18} />} title="Bankruptcy Events" description="Process bankruptcy case events that can advance or restrict claim workflow.">
        <div className="claim-inline-form">
          <label>Event Type<input value={state.bankruptcyEventType} onChange={(e) => setState((x) => ({ ...x, bankruptcyEventType: e.target.value }))} /></label>
          <label>Notes<input value={state.eventNotes} onChange={(e) => setState((x) => ({ ...x, eventNotes: e.target.value }))} /></label>
          <Button disabled={busy} onClick={() => eventMutation.mutate()}>Process Event</Button>
        </div>
      </LifecycleActionCard>
    </div>
  );
}
