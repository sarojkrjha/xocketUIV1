import { ArrowLeft, BadgeCheck, BriefcaseBusiness, FileText, Gavel, RefreshCcw, Scale, ShieldAlert } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { StatCard } from '@/shared/components/StatCard';
import { usePlacementAccountDetail } from '../hooks/usePlacementAccountDetail';
import type { PlacementAccountDetail } from '../types/placement';
import { MatchReviewWorkspace } from '../components/MatchReviewWorkspace';
import { LegalReviewWorkspace } from '../components/LegalReviewWorkspace';
import { PlacementFilingWorkspace } from '../components/PlacementFilingWorkspace';

type PlacementAccountWorkspacePageProps = {
  placementAccountId: number;
  onBack: () => void;
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
};

const display = (value?: string | number | null) => value ?? '-';

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="placement-detail-field">
      <span>{label}</span>
      <strong>{display(value)}</strong>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="placement-detail-skeleton">
      <div />
      <div />
      <div />
    </div>
  );
}

function OverviewPanel({ detail }: { detail: PlacementAccountDetail }) {
  return (
    <div className="placement-detail-grid">
      <section className="xocket-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Account Context</h2>
            <p className="xocket-card-subtitle">Placement, account, balance, and claimant context.</p>
          </div>
        </div>
        <div className="placement-detail-fields">
          <Field label="Account Number" value={detail.accountNumber} />
          <Field label="Client" value={detail.clientName} />
          <Field label="Portfolio" value={detail.portfolioName} />
          <Field label="Debtor" value={detail.debtorName ?? detail.contactName} />
          <Field label="Claim Amount" value={formatCurrency(detail.claimAmount ?? detail.balance)} />
          <Field label="Placed On" value={formatDate(detail.placedOnUtc)} />
          <Field label="Account Open Date" value={formatDate(detail.accountOpenDate)} />
          <Field label="Last Payment Date" value={formatDate(detail.lastPaymentDate)} />
        </div>
      </section>

      <section className="xocket-card">
        <div className="xocket-card-header">
          <div>
            <h2 className="xocket-card-title">Bankruptcy Context</h2>
            <p className="xocket-card-subtitle">Court, case, trustee, attorney, and filing assignment context.</p>
          </div>
        </div>
        <div className="placement-detail-fields">
          <Field label="Case Number" value={detail.bankruptcyCaseNumber} />
          <Field label="Chapter" value={detail.bankruptcyChapter} />
          <Field label="Court" value={detail.courtName ?? detail.bankruptcyCourt} />
          <Field label="Trustee" value={detail.trusteeName} />
          <Field label="Attorney" value={detail.attorneyName} />
          <Field label="District" value={detail.filingDistrict} />
          <Field label="Division" value={detail.filingDivision} />
          <Field label="Bar Date" value={formatDate(detail.barDate)} />
        </div>
      </section>
    </div>
  );
}

function FlagsPanel({ detail }: { detail: PlacementAccountDetail }) {
  const flags = detail.flags ?? [];

  return (
    <section className="xocket-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">Review Flags</h2>
          <p className="xocket-card-subtitle">Operational exceptions requiring review before POC or filing.</p>
        </div>
        <span className="xocket-pill">{flags.length} flags</span>
      </div>
      <div className="xocket-card-body">
        {flags.length === 0 ? (
          <div className="placement-empty-business">No active review flags were returned for this placement account.</div>
        ) : (
          <div className="placement-list-stack">
            {flags.map((flag) => (
              <div className="placement-list-item" key={flag.id}>
                <div>
                  <strong>{flag.flagCode ?? 'Review Flag'}</strong>
                  <span>{flag.flagDescription ?? 'No description supplied.'}</span>
                </div>
                <StatusBadge label={flag.status ?? 'Open'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MatchesPanel({ detail }: { detail: PlacementAccountDetail }) {
  const matches = detail.matches ?? [];

  return (
    <section className="xocket-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">Bankruptcy Match Candidates</h2>
          <p className="xocket-card-subtitle">Candidate summary. Full comparison grid is scheduled for the next sprint.</p>
        </div>
        <span className="xocket-pill">{matches.length} candidates</span>
      </div>
      <div className="xocket-card-body">
        {matches.length === 0 ? (
          <div className="placement-empty-business">No bankruptcy match candidates were returned for this placement account.</div>
        ) : (
          <div className="placement-list-stack">
            {matches.map((match) => (
              <div className="placement-list-item" key={match.id}>
                <div>
                  <strong>{match.caseNumber ?? `Case #${match.bankruptcyCaseId ?? '-'}`}</strong>
                  <span>{match.courtName ?? 'Court unavailable'} · Chapter {match.chapter ?? '-'}</span>
                </div>
                <StatusBadge label={match.score === null || match.score === undefined ? (match.decision ?? 'Candidate') : `${match.score}% Match`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function PlacementAccountWorkspacePage({ placementAccountId, onBack }: PlacementAccountWorkspacePageProps) {
  const detailQuery = usePlacementAccountDetail(placementAccountId);
  const detail = detailQuery.data;

  return (
    <div className="placement-page">
      <section className="placement-hero xocket-card placement-detail-hero">
        <div>
          <button className="placement-link-button" type="button" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Placement Queue
          </button>
          <span className="xocket-pill xocket-pill-primary">Placement Workspace</span>
          <h1>{detail?.accountNumber ?? `Placement #${placementAccountId}`}</h1>
          <p>
            Review account, bankruptcy, queue, matching, and filing context before downstream claim and document processing.
          </p>
        </div>

        <div className="placement-hero-actions">
          <Button variant="secondary" onClick={() => detailQuery.refetch()}><RefreshCcw size={16} /> Refresh</Button>
          <Button variant="secondary"><BadgeCheck size={16} /> Run Match</Button>
          <Button><FileText size={16} /> Create Claim</Button>
        </div>
      </section>

      {detailQuery.isError ? (
        <div className="xocket-alert xocket-alert-danger">
          {(detailQuery.error as Error).message || 'Unable to load placement account.'}
        </div>
      ) : null}

      {detailQuery.isLoading || !detail ? (
        <WorkspaceSkeleton />
      ) : (
        <>
          <div className="stat-grid placement-stat-grid">
            <StatCard icon={<BriefcaseBusiness size={22} />} value={detail.queueStatus ?? 'Open'} label="Queue Status" helper="Current placement queue" tone="primary" />
            <StatCard icon={<ShieldAlert size={22} />} value={detail.matchStatus ?? 'Unknown'} label="Match Status" helper="Bankruptcy matching outcome" tone="warning" />
            <StatCard icon={<Scale size={22} />} value={formatCurrency(detail.claimAmount ?? detail.balance)} label="Claim Amount" helper="Amount used for POC" tone="success" />
            <StatCard icon={<Gavel size={22} />} value={detail.bankruptcyCaseNumber ?? '-'} label="Bankruptcy Case" helper={detail.courtName ?? detail.bankruptcyCourt ?? 'Court unavailable'} tone="info" />
          </div>

          <OverviewPanel detail={detail} />
          <MatchReviewWorkspace detail={detail} onRefresh={() => detailQuery.refetch()} />
          <LegalReviewWorkspace detail={detail} onRefresh={() => detailQuery.refetch()} />
          <PlacementFilingWorkspace detail={detail} onRefresh={() => detailQuery.refetch()} />
          <FlagsPanel detail={detail} />
        </>
      )}
    </div>
  );
}
