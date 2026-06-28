export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const
  },
  accounts: {
    root: ['accounts'] as const,
    search: (request: unknown) => ['accounts', 'search', request] as const,
    detail: (accountId: number) => ['accounts', 'detail', accountId] as const,
    timeline: (accountId: number, page: number, pageSize: number) => ['accounts', 'timeline', accountId, page, pageSize] as const,
    claims: (accountId: number, page: number, pageSize: number) => ['accounts', 'claims', accountId, page, pageSize] as const,
    documents: (accountId: number, page: number, pageSize: number) => ['accounts', 'documents', accountId, page, pageSize] as const,
    tasks: (accountId: number, page: number, pageSize: number) => ['accounts', 'tasks', accountId, page, pageSize] as const
  },
  placement: {
    root: ['placement'] as const,
    dashboard: ['placement', 'dashboard'] as const,
    queue: (request: unknown) => ['placement', 'queue', request] as const,
    detail: (placementAccountId: number) => ['placement', 'detail', placementAccountId] as const,
    matches: (placementAccountId: number) => ['placement', 'matches', placementAccountId] as const
  },
  claims: {
    root: ['claims'] as const,
    search: (request: unknown) => ['claims', 'search', request] as const,
    detail: (claimId: number) => ['claims', 'detail', claimId] as const
  },
  documents: {
    root: ['documents'] as const,
    search: (request: unknown) => ['documents', 'search', request] as const,
    versions: (documentId: number) => ['documents', 'versions', documentId] as const
  },
  scrubbing: {
    root: ['scrubbing'] as const,
    dashboard: ['scrubbing', 'dashboard'] as const,
    inventories: (request: unknown) => ['scrubbing', 'inventories', request] as const,
    runs: (request: unknown) => ['scrubbing', 'runs', request] as const,
    reportedBankruptcies: (request: unknown) => ['scrubbing', 'reported-bankruptcies', request] as const
  },

  payments: {
    root: ['payments'] as const,
    dashboard: ['payments', 'dashboard'] as const,
    payments: (request: unknown) => ['payments', 'payments', request] as const,
    importRuns: (request: unknown) => ['payments', 'import-runs', request] as const,
    schedules: (request: unknown) => ['payments', 'schedules', request] as const
  },
  monitoring: {
    root: ['monitoring'] as const,
    dashboard: ['monitoring', 'dashboard'] as const,
    runs: (request: unknown) => ['monitoring', 'runs', request] as const,
    runDetail: (runId: number) => ['monitoring', 'runs', runId] as const,
    reportDetail: (reportId: number) => ['monitoring', 'reports', reportId] as const
  },

  administration: {
    root: ['administration'] as const,
    clients: (request: unknown) => ['administration', 'clients', request] as const,
    portfolios: (request: unknown) => ['administration', 'portfolios', request] as const,
    settings: (request: unknown) => ['administration', 'system-settings', request] as const,
    queues: (request: unknown) => ['administration', 'workflow-queues', request] as const,
    roles: (request: unknown) => ['administration', 'roles', request] as const,
    permissions: (request: unknown) => ['administration', 'permissions', request] as const,
    users: (request: unknown) => ['administration', 'users', request] as const
  },
  reporting: {
    root: ['reporting'] as const,
    dashboard: (key: string) => ['reporting', 'dashboard', key] as const,
    snapshots: (request: unknown) => ['reporting', 'snapshots', request] as const,
    snapshotDetail: (snapshotId: number) => ['reporting', 'snapshots', snapshotId] as const
  }
} as const;
