import { AlertTriangle, BadgeCheck, Flag, Loader2, XCircle } from 'lucide-react';

import { Button } from '@/shared/components/Button';
import type { PlacementBankruptcyMatch } from '../types/placement';
import { MatchScoreIndicator } from './MatchScoreIndicator';

export type MatchDecisionPanelProps = {
  selectedMatch?: PlacementBankruptcyMatch | null;
  isSelecting?: boolean;
  isAddingFlag?: boolean;
  flagCode: string;
  notes: string;
  onFlagCodeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onAccept: () => void;
  onRejectCandidate: () => void;
  onAddFlag: () => void;
};

export function MatchDecisionPanel({
  selectedMatch,
  isSelecting = false,
  isAddingFlag = false,
  flagCode,
  notes,
  onFlagCodeChange,
  onNotesChange,
  onAccept,
  onRejectCandidate,
  onAddFlag
}: MatchDecisionPanelProps) {
  return (
    <aside className="match-decision-panel xocket-card">
      <div className="xocket-card-header">
        <div>
          <h2 className="xocket-card-title">Decision Panel</h2>
          <p className="xocket-card-subtitle">Select the candidate that belongs to this placement account.</p>
        </div>
      </div>

      <div className="xocket-card-body match-decision-body">
        {!selectedMatch ? (
          <div className="placement-empty-business">Select a candidate row to review evidence and make a decision.</div>
        ) : (
          <>
            <MatchScoreIndicator score={selectedMatch.score} />
            <div className="decision-summary">
              <span>Selected Candidate</span>
              <strong>{selectedMatch.caseNumber ?? `Case #${selectedMatch.bankruptcyCaseId ?? '-'}`}</strong>
              <em>{selectedMatch.courtName ?? 'Court unavailable'}</em>
            </div>

            <Button onClick={onAccept} disabled={isSelecting}>
              {isSelecting ? <Loader2 size={16} className="spin" /> : <BadgeCheck size={16} />}
              Accept Match
            </Button>
            <Button variant="secondary" onClick={onRejectCandidate} disabled={isAddingFlag}>
              {isAddingFlag ? <Loader2 size={16} className="spin" /> : <XCircle size={16} />}
              Reject / Flag Candidate
            </Button>

            <div className="decision-divider" />

            <label className="decision-label">
              <span>Review Flag</span>
              <select value={flagCode} onChange={(event) => onFlagCodeChange(event.target.value)}>
                <option value="MANUAL_REVIEW">Manual Review</option>
                <option value="ADDRESS_CONFLICT">Address Conflict</option>
                <option value="MISSING_SSN">Missing SSN</option>
                <option value="MULTIPLE_DEBTORS">Multiple Debtors</option>
                <option value="ATTORNEY_REVIEW">Attorney Review</option>
                <option value="HIGH_BALANCE">High Balance</option>
              </select>
            </label>

            <label className="decision-label">
              <span>Notes</span>
              <textarea value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Explain why this needs review." rows={4} />
            </label>

            <Button variant="secondary" onClick={onAddFlag} disabled={isAddingFlag}>
              {isAddingFlag ? <Loader2 size={16} className="spin" /> : <Flag size={16} />}
              Add Review Flag
            </Button>

            <div className="decision-warning">
              <AlertTriangle size={16} />
              <span>Accepting a match will update placement workflow state through the backend.</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
