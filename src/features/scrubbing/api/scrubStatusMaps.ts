export function formatScrubStatus(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') return 'Unknown';
  if (typeof value === 'string') return splitPascal(value);

  const map: Record<number, string> = {
    0: 'Draft',
    1: 'Queued',
    2: 'Processing',
    3: 'Completed',
    4: 'Failed',
    5: 'Archived',
    6: 'Generating Response'
  };
  return map[value] ?? `Status ${value}`;
}

export function scrubStatusTone(value?: string | number | null): 'success' | 'danger' | 'info' | 'warning' | 'neutral' {
  const label = formatScrubStatus(value).toLowerCase();
  if (label.includes('complete') || label.includes('active') || label.includes('open')) return 'success';
  if (label.includes('fail') || label.includes('error') || label.includes('reject')) return 'danger';
  if (label.includes('processing') || label.includes('running') || label.includes('generating')) return 'info';
  if (label.includes('queued') || label.includes('review') || label.includes('pending')) return 'warning';
  return 'neutral';
}

function splitPascal(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
}

export const scrubRunStatusOptions = [
  { value: 1, label: 'Queued' },
  { value: 2, label: 'Running' },
  { value: 3, label: 'Completed' },
  { value: 4, label: 'Failed' }
];

export const reportedBankruptcyStatusOptions = [
  { value: 1, label: 'Open' },
  { value: 2, label: 'In Review' },
  { value: 3, label: 'Resolved' },
  { value: 4, label: 'Closed' }
];
