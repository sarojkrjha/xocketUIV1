import type { StatusTone } from '@/shared/components/StatusBadge';

export function formatImportStatus(status?: string | number | null) {
  if (status === null || status === undefined || status === '') return 'Unknown';
  if (typeof status === 'number') {
    const map: Record<number, string> = {
      0: 'Pending',
      1: 'Processing',
      2: 'Completed',
      3: 'Completed with Errors',
      4: 'Failed',
      5: 'Cancelled'
    };
    return map[status] ?? `Status ${status}`;
  }
  return status.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function importStatusTone(status?: string | number | null): StatusTone {
  const value = String(status ?? '').toLowerCase();
  if (status === 2 || value.includes('complete') || value.includes('success')) return 'success';
  if (status === 1 || value.includes('process') || value.includes('running')) return 'info';
  if (status === 3 || value.includes('error') || value.includes('warning')) return 'warning';
  if (status === 4 || value.includes('fail') || value.includes('reject')) return 'danger';
  return 'neutral';
}
