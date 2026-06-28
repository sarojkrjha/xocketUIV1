# UAT Hotfix 02 — Operations Center Routing

## Issue
The Operations Center command palette displayed route buttons but did not navigate because the dashboard page did not receive the application navigation callback.

## Fix
- Added `onNavigate` prop to `DashboardPlaceholderPage`.
- Passed the app-level `navigate` callback from `App.tsx` into the dashboard.
- Converted command palette items from strings to `{ label, route }` definitions.
- Wired every Route button to the correct `AppRoute`:
  - Placement Import -> `placement-import`
  - Placement Queue -> `placement`
  - Matching Review -> `matching-review`
  - Legal Review -> `legal-review`
  - Filing Operations -> `filing-operations`
  - Claims Work Center -> `claims`
  - NDC Payments -> `payments`
  - Scrubbing Operations -> `scrubbing`
  - Monitoring Operations -> `monitoring`
  - Enterprise Reporting -> `reporting`

## Validation
- TypeScript build passed.
- Vite production build passed.
- Bundle size warning remains informational only.
