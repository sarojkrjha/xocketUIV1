# LP-01 — Placement Import & Queue Management

## Implemented

### Placement Import Dashboard
- Reworked `PlacementImportWorkspacePage` into a legacy-style import dashboard.
- Added KPI cards for files, rows, accepted rows, rejected rows, and processing files.
- Kept the implementation wired to real placement import/file APIs only.

### Placement Import Wizard
- Added a multi-step wizard: Client → Upload → Validate → Preview → Complete.
- Added client and uploader validation before allowing upload.
- Added preview confirmation before calling the backend import endpoint.
- Uses `POST /api/v1/placement/import/upload`.

### Imported Files
- Kept server-side file history using `GET /api/v1/placement/files`.
- Improved file grid and review action.
- Added search by file, client ID, and status.

### Import Detail
- Replaced raw JSON-only display with structured detail panels.
- Added detail KPI cards from the backend payload when available.
- Added validation/error grid from server-provided `validationErrors`, `errors`, or `errorRows`.
- Added imported account preview grid from server-provided `placementAccounts`, `accounts`, `importedAccounts`, or `rows`.
- Raw backend payload remains available in a collapsible technical section.
- Uses `GET /api/v1/placement/files/{placementFileId}`.

### Placement Queue Management
- Added legacy queue switcher to `PlacementWorkCenterPage`.
- Queue tabs use the existing backend `queueStatus` filter.
- Added bulk queue movement for selected placement accounts.
- Uses `PUT /api/v1/placement/accounts/{placementAccountId}/queue` once per selected account.
- Added queue movement reason field and error handling.

### API/Hook Layer
- Added `MovePlacementQueueRequest` type.
- Added `movePlacementAccountQueue` API method.
- Added `useMovePlacementQueue` mutation hook.

### Styling
- Added LP-01-specific styles for wizard, queue tabs, detail panels, and bulk queue bar.

## Changed Files
- `src/features/imports/pages/PlacementImportWorkspacePage.tsx`
- `src/features/placement/pages/PlacementWorkCenterPage.tsx`
- `src/features/placement/api/placementApi.ts`
- `src/features/placement/hooks/usePlacementAccounts.ts`
- `src/features/placement/types/placement.ts`
- `src/shared/theme/global.css`

## Backend Gaps / Not Implemented Because Not in Swagger
- Separate pre-upload validation endpoint is not available.
- Separate preview/import-confirm endpoint is not available.
- Reprocess placement file endpoint is not available.
- Archive/delete imported placement file endpoint is not available.
- Export validation errors endpoint is not available.
- File-level imported account paging endpoint is not available; detail panel reads whatever the current file-detail endpoint returns.
- Bulk queue movement endpoint is not available; UI calls the single-account queue endpoint per selected account.

## Build Validation
- `npm run build` passed.
