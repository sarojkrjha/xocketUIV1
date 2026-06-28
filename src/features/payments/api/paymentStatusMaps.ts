export function formatPaymentMappingStatus(value: unknown): string {
  const code = Number(value);
  if (!Number.isFinite(code)) return value ? String(value) : 'Unknown';

  const map: Record<number, string> = {
    0: 'Unmapped',
    1: 'Matched',
    2: 'Exception',
    3: 'Posted',
    4: 'Ignored'
  };

  return map[code] ?? `Status ${code}`;
}

export function paymentStatusIntent(label?: string | null): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const value = (label ?? '').toLowerCase();
  if (value.includes('posted') || value.includes('matched') || value.includes('completed')) return 'success';
  if (value.includes('exception') || value.includes('failed') || value.includes('error')) return 'danger';
  if (value.includes('pending') || value.includes('unmapped')) return 'warning';
  if (value.includes('running') || value.includes('import')) return 'info';
  return 'neutral';
}
