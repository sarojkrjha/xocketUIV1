# LP-06 — Bankruptcy Monitoring & Scrubbing Implementation Notes

## Implemented / Changed

### Bankruptcy Monitoring
- Preserved the existing Monitoring Operations Center dashboard and run/report workflow.
- Confirmed the page uses the real Swagger-backed monitoring APIs:
  - `POST /api/v1/bankruptcy-monitoring/run`
  - `GET /api/v1/bankruptcy-monitoring/runs`
  - `GET /api/v1/bankruptcy-monitoring/runs/{runId}` support remains in the API layer
  - `POST /api/v1/bankruptcy-monitoring/runs/{runId}/reports`
  - `GET /api/v1/bankruptcy-monitoring/reports/{reportId}`
  - `GET /api/v1/bankruptcy-monitoring/reports/{reportId}/export`
  - `PUT /api/v1/bankruptcy-monitoring/report-items/{reportItemId}/approve`
  - `PUT /api/v1/bankruptcy-monitoring/report-items/{reportItemId}/reject`
  - `POST /api/v1/bankruptcy-monitoring/report-items/{reportItemId}/convert-to-placement`
  - `PUT /api/v1/bankruptcy-monitoring/reports/{reportId}/delivered`
  - `GET /api/v1/bankruptcy-monitoring/dashboard`

### Scrubbing
- Extended the Scrubbing API layer with missing Swagger-backed operations:
  - Inventory detail
  - Inventory versions
  - Run detail
  - Result batch detail
  - Reported bankruptcy detail
  - Create reported bankruptcy
  - Create scrub schedule
  - Search scrub schedules
  - Deactivate scrub schedule
- Added Scrub Schedule workflow to the Scrubbing workspace:
  - New **Schedules** tab
  - Schedule search/filter
  - Create schedule form
  - Deactivate schedule action
- Preserved the existing Inventory, Runs & Responses, and Reported Bankruptcies workspaces.
- Kept large-data behavior safe: grids are search-driven and paginated rather than loaded by default.

## Backend Gaps Not Invented
- No dedicated monitoring report item list endpoint separate from report detail.
- No monitoring run cancel/retry endpoint.
- No monitoring report item detail endpoint.
- No scrub run cancel/retry endpoint.
- No scrub result batch item-level paginated endpoint.
- No scrub schedule edit endpoint.
- No scrub inventory deactivate endpoint in current Swagger.
- No explicit scrub/manual-review decision endpoint beyond reported bankruptcy resolve.

## Build Validation
- `npm ci` completed successfully.
- `npm run build` completed successfully.
- Vite emitted only the existing large bundle warning; no TypeScript or build errors.
