export const documentStatusOptions = [
  { value: 0, label: 'Draft' },
  { value: 1, label: 'Generated' },
  { value: 2, label: 'Uploaded' },
  { value: 3, label: 'Under Review' },
  { value: 4, label: 'Approved' },
  { value: 5, label: 'Filed' },
  { value: 6, label: 'Archived' },
  { value: 7, label: 'Rejected' }
];

export function formatDocumentStatus(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value;
  const numeric = Number(value);
  return documentStatusOptions.find((option) => option.value === numeric)?.label ?? (Number.isFinite(numeric) ? `Status ${numeric}` : 'Unknown');
}

export function documentStatusTone(label?: string | null): 'neutral' | 'success' | 'warning' | 'danger' | 'info' {
  const value = (label ?? '').toLowerCase();
  if (value.includes('approved') || value.includes('filed')) return 'success';
  if (value.includes('review') || value.includes('draft')) return 'warning';
  if (value.includes('reject') || value.includes('fail')) return 'danger';
  if (value.includes('generated') || value.includes('uploaded')) return 'info';
  return 'neutral';
}
