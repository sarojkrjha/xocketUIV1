export const claimStatusOptions = [
  { value: 0, label: 'Draft' },
  { value: 1, label: 'Ready' },
  { value: 2, label: 'Filed' },
  { value: 3, label: 'Receipt Pending' },
  { value: 4, label: 'Receipt Received' },
  { value: 5, label: 'Paid' },
  { value: 6, label: 'Closed' },
  { value: 7, label: 'Exception' }
];

export function formatClaimStatus(value: unknown) {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  const numeric = Number(value);
  return claimStatusOptions.find((option) => option.value === numeric)?.label ?? (Number.isFinite(numeric) ? `Status ${numeric}` : null);
}

export function claimStatusTone(label?: string | null): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const value = (label ?? '').toLowerCase();

  if (value.includes('closed') || value.includes('paid') || value.includes('received')) return 'success';
  if (value.includes('pending') || value.includes('ready')) return 'warning';
  if (value.includes('exception') || value.includes('reject') || value.includes('fail')) return 'danger';
  if (value.includes('filed')) return 'info';
  return 'primary';
}
