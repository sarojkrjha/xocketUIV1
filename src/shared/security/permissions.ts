export const Permissions = {
  DashboardView: 'dashboard.view',

  PlacementsView: 'placements.view',
  PlacementsCreate: 'placements.create',
  PlacementsUpdate: 'placements.update',

  MatchingReview: 'matching.review',
  MatchingAccept: 'matching.accept',
  MatchingReject: 'matching.reject',

  ClaimsView: 'claims.view',
  ClaimsCreate: 'claims.create',
  ClaimsFile: 'claims.file',
  ClaimsPaymentsPost: 'claims.payments.post',

  ScrubView: 'scrub.view',
  ScrubUploadInventory: 'scrub.inventory.upload',
  ScrubRun: 'scrub.run',
  ScrubReportedBankruptcyResolve: 'scrub.reported-bankruptcy.resolve',

  ReportsView: 'reports.view',
  AdministrationView: 'administration.view'
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
