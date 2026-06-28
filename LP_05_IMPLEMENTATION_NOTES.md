# LP-05 – NDC & Payments Implementation Notes

## Implemented

- Strengthened the existing Payments workspace into a dedicated NDC & Payments Operations workbench.
- Kept the workflow search-first so large payment datasets are not loaded by default.
- Added import-run detail support backed by `GET /api/v1/ndc/import-runs/{runId}`.
- Added import run detail review panel with summary metrics and returned validation/error rows when available.
- Added payment review panel from the NDC payment grid.
- Added verified payment posting handoff to claims backed by `POST /api/v1/claims/{claimId}/payments/post`.
- Preserved NDC import run action backed by `POST /api/v1/ndc/payments/import`.
- Preserved NDC import schedule creation backed by `POST /api/v1/ndc/schedules`.
- Preserved schedule search and deactivate backed by `GET /api/v1/ndc/schedules` and `PUT /api/v1/ndc/schedules/{scheduleId}/deactivate`.
- Preserved NDC dashboard backed by `GET /api/v1/ndc/dashboard`.
- Added payment review status cards for amount, mapped claim, and mapping status.
- Added clear UI copy showing which legacy payment actions are backed by real endpoints.

## Changed Files

- `src/features/payments/pages/PaymentsWorkspacePage.tsx`
- `src/features/payments/api/paymentsApi.ts`
- `src/features/payments/hooks/usePayments.ts`
- `src/features/payments/types/payments.ts`

## Backend Gaps Not Invented

- No endpoint exists to manually map an NDC payment to a claim without posting it.
- No endpoint exists to reject or mark an NDC payment as an exception from the UI.
- No endpoint exists to bulk post multiple NDC payments.
- No endpoint exists to download the original NDC import file.
- No endpoint exists to reprocess an existing NDC import run.
- No endpoint exists to edit an existing NDC schedule; only create and deactivate are exposed.
- No endpoint exists to expose a payment-level audit/history timeline.
- Import-run detail may or may not return nested payments/errors depending on backend response shape; the UI safely renders those sections only when present.

## Build Validation

- `npm ci` completed successfully.
- `npm run build` completed successfully.
- Vite emitted only the existing large bundle warning; no TypeScript or compile errors.
