export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type StatusBadgeProps = {
  tone?: StatusTone;
  children?: string;
  label?: string;
};

const inferTone = (value: string): StatusTone => {
  const normalized = value.toLowerCase();

  if (['accepted', 'active', 'completed', 'matched', 'ready', 'filed', 'success'].some((term) => normalized.includes(term))) {
    return 'success';
  }

  if (['pending', 'review', 'queued', 'draft', 'processing'].some((term) => normalized.includes(term))) {
    return 'warning';
  }

  if (['rejected', 'failed', 'error', 'overdue', 'exception'].some((term) => normalized.includes(term))) {
    return 'danger';
  }

  if (['new', 'open', 'unmatched', 'info'].some((term) => normalized.includes(term))) {
    return 'info';
  }

  return 'neutral';
};

export function StatusBadge({ tone, children, label }: StatusBadgeProps) {
  const value = label ?? children ?? 'Unknown';
  const resolvedTone = tone ?? inferTone(value);

  return <span className={`xocket-status xocket-status-${resolvedTone}`}>{value}</span>;
}
