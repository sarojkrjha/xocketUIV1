export const placementMatchStatusOptions = [
  { value: 0, label: 'Unknown' },
  { value: 1, label: 'Not Matched' },
  { value: 2, label: 'Potential Match' },
  { value: 3, label: 'Pending Review' },
  { value: 4, label: 'Matched' },
  { value: 5, label: 'Rejected' }
] as const;

export const placementQueueStatusOptions = [
  { value: 1, label: 'New' },
  { value: 2, label: 'Pending Match Review' },
  { value: 3, label: 'Legal Review' },
  { value: 4, label: 'Ready For POC' },
  { value: 5, label: 'Filed' },
  { value: 6, label: 'Closed' },
  { value: 7, label: 'Exception' }
] as const;

export function formatPlacementMatchStatus(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'string' && Number.isNaN(Number(value))) {
    return value;
  }

  const numeric = Number(value);
  return placementMatchStatusOptions.find((option) => option.value === numeric)?.label ?? String(value);
}

export function formatPlacementQueueStatus(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'string' && Number.isNaN(Number(value))) {
    return value;
  }

  const numeric = Number(value);
  return placementQueueStatusOptions.find((option) => option.value === numeric)?.label ?? String(value);
}
