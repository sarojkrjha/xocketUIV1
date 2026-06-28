# LP-07 — Reporting & Operations Center Implementation Notes

## Implemented / Changed

- Reworked the main Operations Center dashboard to use real reporting dashboard hooks instead of hardcoded operational counts.
- Operations Center now calls the six Swagger-backed dashboard endpoints:
  - `GET /api/v1/reports/dashboard/operations`
  - `GET /api/v1/reports/dashboard/placement`
  - `GET /api/v1/reports/dashboard/claims`
  - `GET /api/v1/reports/dashboard/ndc`
  - `GET /api/v1/reports/dashboard/scrub`
  - `GET /api/v1/reports/dashboard/bankruptcy-monitoring`
- Added dashboard health tiles that show loaded/loading/error state per reporting endpoint.
- Reworded Operations Center alerts so they are derived from reporting endpoint health/metrics and not invented legacy values.
- Preserved the command-palette surface as a navigation/search shell only; no unsupported backend command execution was invented.
- Enhanced the Enterprise Reporting Center snapshot viewer with:
  - Metadata cards
  - Description display when returned by backend
  - Preview rows table when returned by backend
  - Export action using `GET /api/v1/reports/snapshots/{snapshotId}/export`
- Preserved monitoring snapshot publishing through `POST /api/v1/reports/snapshots/bankruptcy-monitoring/{reportId}`.

## Backend Gaps Not Invented

- No generic report creation endpoint beyond bankruptcy monitoring snapshot publishing.
- No saved report subscription endpoint.
- No report scheduling endpoint.
- No dashboard date-range parameter support in current Swagger.
- No drill-down endpoint for dashboard metric cards.
- No notification feed endpoint; Operations Center only derives endpoint health/metrics.
- No global search endpoint; command palette remains a UI navigation/search surface.

## Validation

- Build validation passed after dependency restore.
