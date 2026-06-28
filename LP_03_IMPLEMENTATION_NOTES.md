# LP-03 – Filing Operations Implementation Notes

Baseline: `XocketV2_react_ui_LP_02_matching_legal_review.zip`.

## Implemented

- Added first-class **Filing Operations** navigation item under Operations.
- Added `FilingOperationsQueuePage` with filing-oriented queue filters and worklist.
- Added filing queue switcher for:
  - Ready for POC (`queueStatus=4`)
  - Filed / Receipt Work (`queueStatus=5`)
  - Filing Exceptions (`queueStatus=7`)
  - All queue statuses
- Added filing queue KPI cards sourced from placement dashboard where available.
- Added server-side filing worklist backed by `GET /api/v1/placement/queue`.
- Added account/court/filer/search filters for filing operations.
- Open/Filing/Receipt actions route to the existing placement account workspace.
- Reused existing placement filing workspace for:
  - `GET /api/v1/placement/accounts/{placementAccountId}/filing-page`
  - `PUT /api/v1/placement/accounts/{placementAccountId}/filing-assignment`
  - `POST /api/v1/placement/accounts/{placementAccountId}/documents/generate`
  - `POST /api/v1/placement/accounts/{placementAccountId}/poc-documents`
  - `POST /api/v1/placement/accounts/{placementAccountId}/court-receipts`
  - `POST /api/v1/placement/accounts/{placementAccountId}/submit-filing`
- Added backend gap panel directly on Filing Operations so missing legacy queue behavior is visible to QA/UAT.
- Added responsive CSS for filing queue tabs and backend gap card.

## Changed

- `App.tsx`
  - Added `filing-operations` route.
  - Opens placement account detail from Filing Operations.
- `navigation.ts`
  - Added `Filing Operations` menu item and route metadata.
- `global.css`
  - Added LP-03 filing operations styles.

## Backend gaps not invented

- No dedicated receipt-pending queue status or endpoint was present in Swagger.
- No bulk filing assignment endpoint was present.
- No bulk document generation endpoint was present.
- No bulk submit filing endpoint was present.
- No dedicated filing history endpoint was present.
- No court credential/login API was present; the UI only surfaces filing URLs from `filing-page`.

## Build validation

- `npm run build` passed.
