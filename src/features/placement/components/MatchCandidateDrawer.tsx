import { X } from 'lucide-react';

import { StatusBadge } from '@/shared/components/StatusBadge';
import type { PlacementBankruptcyMatch } from '../types/placement';
import { EvidenceBadge, MatchScoreIndicator } from './MatchScoreIndicator';

const display = (value?: string | number | null) => value ?? '-';

function DetailField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="candidate-detail-field">
      <span>{label}</span>
      <strong>{display(value)}</strong>
    </div>
  );
}

export function MatchCandidateDrawer({ candidate, onClose }: { candidate?: PlacementBankruptcyMatch | null; onClose: () => void }) {
  if (!candidate) {
    return null;
  }

  return (
    <div className="candidate-drawer" role="dialog" aria-modal="false" aria-label="Candidate details">
      <div className="candidate-drawer-header">
        <div>
          <span className="xocket-pill xocket-pill-primary">Candidate Detail</span>
          <h2>{candidate.caseNumber ?? `Case #${candidate.bankruptcyCaseId ?? '-'}`}</h2>
          <p>{candidate.courtName ?? 'Court unavailable'}</p>
        </div>
        <button className="candidate-drawer-close" type="button" onClick={onClose} aria-label="Close candidate details">
          <X size={18} />
        </button>
      </div>

      <div className="candidate-drawer-body">
        <MatchScoreIndicator score={candidate.score} />

        <section>
          <h3>Bankruptcy Case</h3>
          <div className="candidate-detail-grid">
            <DetailField label="Case Number" value={candidate.caseNumber} />
            <DetailField label="Chapter" value={candidate.chapter} />
            <DetailField label="Court" value={candidate.courtName} />
            <DetailField label="Filing Date" value={candidate.filingDate} />
            <DetailField label="Trustee" value={candidate.trusteeName} />
            <DetailField label="Attorney" value={candidate.attorneyName} />
          </div>
        </section>

        <section>
          <h3>Debtor Evidence</h3>
          <div className="candidate-detail-grid">
            <DetailField label="Debtor" value={candidate.debtorName} />
            <DetailField label="Last 4" value={candidate.debtorLast4 ? `XXX-XX-${candidate.debtorLast4}` : '-'} />
            <DetailField label="Address" value={candidate.address} />
            <DetailField label="Phone" value={candidate.phone} />
            <DetailField label="Email" value={candidate.email} />
            <DetailField label="Decision" value={candidate.decision} />
          </div>
        </section>

        <section>
          <h3>Evidence Breakdown</h3>
          <div className="evidence-grid">
            {(candidate.evidence ?? []).map((evidence) => <EvidenceBadge key={evidence.key} evidence={evidence} />)}
          </div>
        </section>

        <section>
          <h3>Workflow Recommendation</h3>
          <div className="candidate-recommendation">
            <StatusBadge label={candidate.confidence ?? 'Unknown'} />
            <span>
              {candidate.score !== null && candidate.score !== undefined && candidate.score >= 90
                ? 'Strong evidence supports accepting this candidate.'
                : 'Review evidence before accepting or route this account for manual verification.'}
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
