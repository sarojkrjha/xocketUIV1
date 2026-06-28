import type { StatusTone } from '@/shared/components/StatusBadge';

export const monitoringRunStatusOptions = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Running' },
  { value: 2, label: 'Completed' },
  { value: 3, label: 'Failed' },
  { value: 4, label: 'Cancelled' }
];

export function formatMonitoringStatus(status: string | number | null | undefined): string {
  if (status === null || status === undefined || status === '') return 'Unknown';
  if (typeof status === 'string') {
    return status.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
  return monitoringRunStatusOptions.find((option) => option.value === status)?.label ?? `Status ${status}`;
}

export function monitoringStatusTone(status: string | number | null | undefined): StatusTone {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized === '2' || normalized.includes('complete') || normalized.includes('delivered') || normalized.includes('approved')) return 'success';
  if (normalized === '1' || normalized.includes('running') || normalized.includes('processing')) return 'info';
  if (normalized === '3' || normalized.includes('fail') || normalized.includes('reject')) return 'danger';
  if (normalized === '0' || normalized.includes('pending') || normalized.includes('review')) return 'warning';
  return 'neutral';
}
