import type { MatchEvidence, MatchEvidenceStatus } from '../types/placement';

function evidenceSymbol(status: MatchEvidenceStatus) {
  switch (status) {
    case 'matched':
      return '✓';
    case 'partial':
      return '◐';
    case 'conflict':
      return '!';
    case 'missing':
      return '–';
    default:
      return '?';
  }
}

function confidenceTone(score?: number | null) {
  if (score === null || score === undefined) return 'unknown';
  if (score >= 90) return 'high';
  if (score >= 75) return 'medium';
  return 'low';
}

export function confidenceLabel(score?: number | null) {
  if (score === null || score === undefined) return 'Unknown';
  if (score >= 90) return 'High Confidence';
  if (score >= 75) return 'Medium Confidence';
  return 'Low Confidence';
}

export function MatchScoreIndicator({ score, compact = false }: { score?: number | null; compact?: boolean }) {
  const tone = confidenceTone(score);
  const label = confidenceLabel(score);

  return (
    <div className={`match-score match-score-${tone} ${compact ? 'match-score-compact' : ''}`}>
      <strong>{score === null || score === undefined ? '—' : `${Math.round(score)}%`}</strong>
      <span>{label}</span>
    </div>
  );
}

export function EvidenceBadge({ evidence }: { evidence: MatchEvidence }) {
  return (
    <div className={`evidence-badge evidence-${evidence.status}`} title={evidence.notes ?? undefined}>
      <span>{evidenceSymbol(evidence.status)}</span>
      <strong>{evidence.label}</strong>
      {evidence.score !== null && evidence.score !== undefined ? <em>{evidence.score}</em> : null}
    </div>
  );
}
