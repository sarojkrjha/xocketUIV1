# LP-04 — Claims Lifecycle Implementation Notes

Baseline: LP-03 Filing Operations package.

## Implemented

- Strengthened Claim Workspace lifecycle actions so they no longer call backend APIs with placeholder values.
- Replaced direct header actions with action dialogs for:
  - Filing package generation (`POST /api/v1/claims/{claimId}/filing-package`)
  - Filing registration (`POST /api/v1/claims/{claimId}/register-filing`)
  - Court receipt processing (`POST /api/v1/claims/{claimId}/receipt`)
  - Claim payment add (`POST /api/v1/claims/{claimId}/payments`)
  - Claim status advance (`PUT /api/v1/claims/{claimId}/status`)
- Added Claim Lifecycle Readiness panel in Claim Workspace.
- Added readiness checks for:
  - account link
  - bankruptcy case link
  - claim amount
  - attorney assignment
  - filing package
  - court claim number
  - receipt processing
  - payment reconciliation
- Preserved existing lifecycle API coverage for:
  - eligibility
  - attorney assignment
  - amendments
  - objections
  - transfers
  - post payment
  - bankruptcy event processing
- Added validation before receipt processing and payment posting.
- Added action-level API error display.
- Added LP-04 CSS for readiness checklist and action forms.

## Changed

- `src/features/claims/pages/ClaimWorkspacePage.tsx`
  - Added modal-driven claim action workflows.
  - Added readiness panel.
  - Removed unsafe placeholder calls such as receiptDocumentId `0`, payment amount `0`, and hard-coded status advance from the header buttons.
- `src/shared/theme/global.css`
  - Added LP-04 claim readiness styling.

## Backend gaps not invented

- No dedicated claim close/reopen/withdraw endpoint in current Swagger.
- No dedicated claim distribution/recovery/settlement endpoint in current Swagger.
- No dedicated receipt upload endpoint under Claims; receipt processing requires an existing receipt document id.
- No status transition dictionary endpoint; UI uses the current local status map and leaves backend as source of truth.
- No dedicated claim audit/history endpoint beyond claim detail/timeline payloads currently returned by backend.

## Build validation

- `npm ci` completed successfully.
- `npm run build` completed successfully.
