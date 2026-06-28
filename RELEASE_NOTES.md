# Release 4.0.0 — Production Readiness

## Summary
Release 4.0.0 stabilizes the Xocket UI into a production-ready enterprise operations portal.

## Delivered
- Enterprise Operations Center landing experience
- Live queue-health dashboard pattern
- SLA and notification center pattern
- Workflow engine visualization pattern
- Global Search / Command Palette pattern
- Production readiness scorecard
- Executive reporting and governance tile strip
- Responsive production-readiness layout
- Updated package version to 4.0.0

## Validation
- TypeScript build and Vite production build completed successfully.


## Release 4.0.1 — Corrective Workflow Fixes

- Fixed Claims Work Center `Create Claim` action by adding a real create dialog wired to `POST /api/v1/claims`.
- Added required claim creation fields, validation, loading/error states, and post-create refresh/open behavior.
- Added a direct `Placement Import` navigation item so client placement upload is visible without needing to discover it inside Imports.
- Reused the existing placement import API integration for `POST /api/v1/placement/import/upload` and defaulted the Import Operations page to the Placement Files tab when opened from the new route.
- Added modal styling for enterprise form dialogs.
- Build validation passed.

## Release 4.1.0 - Legacy Workflow Parity Hotfix

This release corrects workflow parity issues identified after reviewing the legacy-flow expectations:

- Placement Import is now a first-class workflow screen.
- Matching Review now has its own queue screen and opens the placement account evidence-review workspace.
- Create Claim now provides visible validation and eligibility checking before posting to the API.

Build validation: passed.


## LP-07 — Reporting & Operations Center

- Added backend-driven Operations Center dashboard using reporting dashboard APIs.
- Enhanced Enterprise Reporting Center snapshot detail preview and export workflow.
- Documented unsupported reporting/notification/global-search capabilities as backend gaps.

## LP-08 — Administration, Templates & Security

This sprint completes the current Swagger-backed administration/security UI surface and explicitly marks missing template/audit behavior as backend gaps rather than implementing unsupported mock workflows.

## LP-09 — Production Readiness

This release adds the final validation layer for legacy parity. It does not invent backend functionality. It exposes workflow coverage, backend gaps, smoke tests, and release gates so the team can certify the application against the live API and business UAT.
