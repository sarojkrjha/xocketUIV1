import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Flag,
  Gavel,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Scale,
  ShieldCheck,
  XCircle
} from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { PlacementAccountDetail } from '../types/placement';
import { useAddPlacementFlag, useDecidePlacementLegalReview, useResolvePlacementReviewFlag } from '../hooks/usePlacementMatching';

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
};

type ChecklistItem = {
  key: string;
  label: string;
  complete: boolean;
  helper: string;
  severity?: 'normal' | 'warning' | 'danger';
};

function checklistFor(detail: PlacementAccountDetail): ChecklistItem[] {
  const hasAcceptedMatch = (detail.matchStatus ?? '').toLowerCase().includes('accepted') || Boolean(detail.bankruptcyCaseId || detail.bankruptcyCaseNumber);
  const hasCourt = Boolean(detail.courtName || detail.bankruptcyCourt);
  const hasAttorney = Boolean(detail.attorneyName);
  const hasClaimAmount = Boolean((detail.claimAmount ?? detail.balance ?? 0) > 0);
  const hasDebtorIdentity = Boolean(detail.debtorName || detail.contactName);
  const hasLast4 = Boolean(detail.last4Ssn);
  const hasBarDate = Boolean(detail.barDate);
  const hasOpenFlags = (detail.flags ?? []).some((flag) => !String(flag.status ?? '').toLowerCase().includes('resolved'));

  return [
    {
      key: 'match',
      label: 'Bankruptcy match selected',
      complete: hasAcceptedMatch,
      helper: hasAcceptedMatch ? 'A bankruptcy case is associated with the placement.' : 'Select or confirm the bankruptcy match before legal approval.',
      severity: hasAcceptedMatch ? 'normal' : 'danger'
    },
    {
      key: 'identity',
      label: 'Debtor identity verified',
      complete: hasDebtorIdentity && hasLast4,
      helper: hasDebtorIdentity && hasLast4 ? 'Name and last-4 identity context are available.' : 'Name and last-4 identity evidence should be verified.',
      severity: hasDebtorIdentity && hasLast4 ? 'normal' : 'warning'
    },
    {
      key: 'court',
      label: 'Court verified',
      complete: hasCourt,
      helper: hasCourt ? 'Court context is available for filing review.' : 'Court is missing or unavailable.',
      severity: hasCourt ? 'normal' : 'danger'
    },
    {
      key: 'attorney',
      label: 'Attorney assigned',
      complete: hasAttorney,
      helper: hasAttorney ? 'Attorney assignment is available.' : 'Attorney assignment should be completed before filing.',
      severity: hasAttorney ? 'normal' : 'warning'
    },
    {
      key: 'balance',
      label: 'Claim amount verified',
      complete: hasClaimAmount,
      helper: hasClaimAmount ? `Amount available: ${formatCurrency(detail.claimAmount ?? detail.balance)}` : 'Claim amount is missing or zero.',
      severity: hasClaimAmount ? 'normal' : 'danger'
    },
    {
      key: 'barDate',
      label: 'Bar date reviewed',
      complete: hasBarDate,
      helper: hasBarDate ? `Bar date: ${formatDate(detail.barDate)}` : 'Bar date is not available from the current payload.',
      severity: hasBarDate ? 'normal' : 'warning'
    },
    {
      key: 'flags',
      label: 'Review flags resolved or accepted',
      complete: !hasOpenFlags,
      helper: hasOpenFlags ? 'Open review flags exist. Resolve or document them before approval.' : 'No open review flags were returned.',
      severity: hasOpenFlags ? 'warning' : 'normal'
    }
  ];
}

function LegalChecklist({ items }: { items: ChecklistItem[] }) {
  const completeCount = items.filter((item) => item.complete).length;

  return (
    <section className="xocket-card legal-checklist-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">Legal Review Checklist</h2>
          <p className="xocket-card-subtitle">Shows what is ready, missing, or risky before the legal decision.</p>
        </div>
        <StatusBadge tone={completeCount === items.length ? 'success' : 'warning'} label={`${completeCount}/${items.length} Ready`} />
      </div>
      <div className="legal-checklist-list">
        {items.map((item) => (
          <div className={`legal-checklist-item legal-checklist-${item.complete ? 'complete' : item.severity ?? 'warning'}`} key={item.key}>
            <div className="legal-checklist-icon">
              {item.complete ? <CheckCircle2 size={18} /> : item.severity === 'danger' ? <XCircle size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <strong>{item.label}</strong>
              <span>{item.helper}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidencePanel({ detail, onRefresh }: { detail: PlacementAccountDetail; onRefresh: () => void }) {
  const user = useAuthStore((state) => state.user);
  const reviewer = user?.email ?? user?.name ?? 'legal.reviewer@xocket.local';
  const flags = detail.flags ?? [];
  const matches = detail.matches ?? [];
  const placementAccountId = detail.placementAccountId ?? detail.id;
  const resolveFlag = useResolvePlacementReviewFlag(placementAccountId);

  const resolve = async (placementReviewFlagId: number) => {
    await resolveFlag.mutateAsync({
      placementReviewFlagId,
      resolutionReason: 'Resolved from Legal Review Workspace after evidence review.',
      resolvedBy: reviewer
    });
    onRefresh();
  };

  return (
    <div className="legal-evidence-grid">
      <section className="xocket-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Evidence Summary</h2>
            <p className="xocket-card-subtitle">Legal context assembled from placement, matching, and bankruptcy data.</p>
          </div>
          <ShieldCheck size={18} />
        </div>
        <div className="legal-evidence-list">
          <div><span>Account</span><strong>{detail.accountNumber ?? '-'}</strong></div>
          <div><span>Debtor</span><strong>{detail.debtorName ?? detail.contactName ?? '-'}</strong></div>
          <div><span>Last 4</span><strong>{detail.last4Ssn ? `XXX-XX-${detail.last4Ssn}` : '-'}</strong></div>
          <div><span>Claim Amount</span><strong>{formatCurrency(detail.claimAmount ?? detail.balance)}</strong></div>
          <div><span>Case Number</span><strong>{detail.bankruptcyCaseNumber ?? '-'}</strong></div>
          <div><span>Court</span><strong>{detail.courtName ?? detail.bankruptcyCourt ?? '-'}</strong></div>
          <div><span>Attorney</span><strong>{detail.attorneyName ?? '-'}</strong></div>
          <div><span>Trustee</span><strong>{detail.trusteeName ?? '-'}</strong></div>
        </div>
      </section>

      <section className="xocket-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Review Flags</h2>
            <p className="xocket-card-subtitle">Exceptions that may affect approval.</p>
          </div>
          <Flag size={18} />
        </div>
        <div className="legal-flag-list">
          {flags.length === 0 ? (
            <div className="placement-empty-business">No review flags were returned for this placement account.</div>
          ) : flags.map((flag) => {
            const isResolved = String(flag.status ?? '').toLowerCase().includes('resolved');
            return (
              <div className="legal-flag-item" key={flag.id}>
                <div>
                  <strong>{flag.flagCode ?? 'Review Flag'}</strong>
                  <span>{flag.flagDescription ?? 'No description supplied.'}</span>
                </div>
                <div className="legal-flag-actions">
                  <StatusBadge label={flag.status ?? 'Open'} />
                  <Button variant="secondary" disabled={isResolved || resolveFlag.isPending} onClick={() => resolve(flag.id)}>Resolve</Button>
                </div>
              </div>
            );
          })}
          {resolveFlag.isError ? <div className="xocket-alert xocket-alert-danger">{(resolveFlag.error as Error).message}</div> : null}
        </div>
      </section>

      <section className="xocket-card legal-span-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Workflow Timeline</h2>
            <p className="xocket-card-subtitle">Current legal flow based on available placement state.</p>
          </div>
          <FileText size={18} />
        </div>
        <div className="legal-mini-timeline">
          <div className="legal-timeline-item complete"><span /><strong>Placement Created</strong><small>{formatDate(detail.placedOnUtc)}</small></div>
          <div className={matches.length > 0 || detail.bankruptcyCaseNumber ? 'legal-timeline-item complete' : 'legal-timeline-item'}><span /><strong>Matching Completed</strong><small>{detail.matchStatus ?? 'Pending'}</small></div>
          <div className={detail.attorneyName ? 'legal-timeline-item complete' : 'legal-timeline-item warning'}><span /><strong>Attorney Assignment</strong><small>{detail.attorneyName ?? 'Needs assignment'}</small></div>
          <div className="legal-timeline-item active"><span /><strong>Legal Review</strong><small>Current workspace</small></div>
          <div className="legal-timeline-item"><span /><strong>Claim Creation</strong><small>Next workflow step</small></div>
        </div>
      </section>
    </div>
  );
}

function DecisionPanel({ detail, checklistItems, onRefresh }: { detail: PlacementAccountDetail; checklistItems: ChecklistItem[]; onRefresh: () => void }) {
  const user = useAuthStore((state) => state.user);
  const reviewer = user?.email ?? user?.name ?? 'legal.reviewer@xocket.local';
  const placementAccountId = detail.placementAccountId ?? detail.id;
  const decide = useDecidePlacementLegalReview(placementAccountId);
  const addFlag = useAddPlacementFlag(placementAccountId);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const incompleteCount = checklistItems.filter((item) => !item.complete).length;

  const submitDecision = async (approved: boolean) => {
    setSuccess(null);
    await decide.mutateAsync({ placementAccountId, approved, reviewerUserId: reviewer, notes });
    setSuccess(approved ? 'Legal review approved.' : 'Legal review rejected / returned for review.');
    setNotes('');
    onRefresh();
  };

  const escalate = async () => {
    setSuccess(null);
    await addFlag.mutateAsync({
      placementAccountId,
      flagCode: 'LEGAL_ESCALATION',
      flagDescription: notes || 'Legal review escalation requested from the Legal Review Workspace.',
      createdBy: reviewer
    });
    setSuccess('Legal escalation flag added.');
    setNotes('');
    onRefresh();
  };

  return (
    <aside className="xocket-card legal-decision-panel">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">Decision Panel</h2>
          <p className="xocket-card-subtitle">Approve, reject, or escalate after reviewing evidence.</p>
        </div>
        <Scale size={18} />
      </div>
      <div className="legal-decision-body">
        <div className="legal-decision-summary">
          <div><span>Reviewer</span><strong>{reviewer}</strong></div>
          <div><span>Queue</span><strong>{detail.queueStatus ?? '-'}</strong></div>
          <div><span>Open Issues</span><strong>{incompleteCount}</strong></div>
        </div>

        <label className="legal-notes-label" htmlFor="legalNotes">Legal notes</label>
        <textarea
          id="legalNotes"
          className="xocket-form-textarea legal-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Document why this placement is approved, rejected, escalated, or returned."
        />

        {success ? <div className="xocket-alert xocket-alert-success"><BadgeCheck size={16} /> {success}</div> : null}
        {decide.isError ? <div className="xocket-alert xocket-alert-danger">{(decide.error as Error).message}</div> : null}
        {addFlag.isError ? <div className="xocket-alert xocket-alert-danger">{(addFlag.error as Error).message}</div> : null}

        <div className="legal-decision-actions">
          <Button disabled={decide.isPending} onClick={() => submitDecision(true)}>
            {decide.isPending ? <Loader2 size={16} className="spin" /> : <BadgeCheck size={16} />}
            Approve Legal Review
          </Button>
          <Button variant="secondary" disabled={decide.isPending} onClick={() => submitDecision(false)}>
            <RotateCcw size={16} /> Reject / Return
          </Button>
          <Button variant="secondary" disabled={addFlag.isPending} onClick={escalate}>
            {addFlag.isPending ? <Loader2 size={16} className="spin" /> : <Flag size={16} />}
            Escalate
          </Button>
        </div>

        <div className="legal-decision-hint">
          <MessageSquareText size={16} />
          <span>Approval uses the backend Legal Review endpoint and refreshes placement detail, queue, and dashboard state.</span>
        </div>
      </div>
    </aside>
  );
}

export function LegalReviewWorkspace({ detail, onRefresh }: { detail: PlacementAccountDetail; onRefresh: () => void }) {
  const checklistItems = useMemo(() => checklistFor(detail), [detail]);

  return (
    <div className="legal-review-workspace">
      <section className="xocket-card legal-hero-card">
        <div className="xocket-card-header">
          <div>
            <span className="xocket-pill xocket-pill-primary">Legal Review Workspace</span>
            <h2 className="xocket-card-title">Legal Decision Support</h2>
            <p className="xocket-card-subtitle">
              Review evidence, exceptions, attorney context, and workflow readiness before claim creation or filing work begins.
            </p>
          </div>
          <Gavel size={28} />
        </div>
        <div className="legal-context-strip">
          <div><span>Account</span><strong>{detail.accountNumber ?? '-'}</strong></div>
          <div><span>Case</span><strong>{detail.bankruptcyCaseNumber ?? '-'}</strong></div>
          <div><span>Court</span><strong>{detail.courtName ?? detail.bankruptcyCourt ?? '-'}</strong></div>
          <div><span>Amount</span><strong>{formatCurrency(detail.claimAmount ?? detail.balance)}</strong></div>
        </div>
      </section>

      <div className="legal-main-grid">
        <div className="legal-main-column">
          <LegalChecklist items={checklistItems} />
          <EvidencePanel detail={detail} onRefresh={onRefresh} />
        </div>
        <DecisionPanel detail={detail} checklistItems={checklistItems} onRefresh={onRefresh} />
      </div>
    </div>
  );
}
