## Release 2.8.0 — Administration & Security Completion

Implemented the Administration & Security Center with live API integration for:

- Clients: search, pagination, create.
- Portfolios: search, client filter, pagination, create.
- Workflow Queues: search, module filter, pagination, create.
- System Settings: search, pagination, upsert.
- Security Users: search, pagination, create, assign role, assign client access.
- Security Roles: read-only role catalog from Swagger-supported endpoint.
- Security Permissions: read-only permission catalog from Swagger-supported endpoint.

Validation:

- Production build passed.
- No mock data added.
- All write actions are limited to endpoints present in current Swagger.

# Changelog

## 2.6.1

- Replaced the dashboard roadmap with Enterprise Operations Center 2.0.
- Removed SOON/planned style navigation behavior from the sidebar.
- Added operations hero, work cards, recent activity, quick actions, and intelligence-ready panel.
- Updated navigation labels for production readiness.

## 2.7.0

- Added Placement Filing Completion workflow.
- Added placement filing API functions and React Query mutations.
- Added filing assignment, document generation, POC upload, receipt upload, filing page, and submit filing UI.
- Added responsive Release 2.7 filing workspace styles.

## 2.9.0
- Completed Bankruptcy Monitoring operational workflow gaps.
- Added monitoring report generation, item decisioning, delivery marking, and reporting snapshot publishing.
- Updated Monitoring and Reporting Centers to Release 2.9.0.
- Build validated successfully.

## 3.0.0

### Added
- Enterprise Import Operations Center.
- G2 Import manual trigger and operational dashboard cards.
- Bankruptcy import runs, batches, and errors grids.
- Placement file upload and file queue.
- File ingestion run detail lookup.
- Demo CSV bundle upload workflows for accounts and bankruptcy imports.

### Validation
- `npm run build` passed.

## 3.1.0

- Completed Claims lifecycle UI/API alignment.
- Added lifecycle panels for eligibility, attorney assignment, amendments, objections, transfers, event processing, and post-payment reconciliation.
- Added reusable claim lifecycle query hook and API adapters.
- Updated package version to 3.1.0.

## 3.2.0
- Completed Account and Contact workflow maintenance surfaces.
- Added real API integration for account updates, bankruptcy status, contact assignment/removal, contact communication maintenance, timeline creation, task creation, and search-index rebuild.
- Build validation passed.

## 4.0.0 — Production Readiness

- Added production-grade Enterprise Operations Center.
- Added queue health, workflow engine visualization, notification center, command palette, production readiness checks, and executive governance tiles.
- Updated package version to 4.0.0.


## Release 4.0.1 — Corrective Workflow Fixes

- Fixed Claims Work Center `Create Claim` action by adding a real create dialog wired to `POST /api/v1/claims`.
- Added required claim creation fields, validation, loading/error states, and post-create refresh/open behavior.
- Added a direct `Placement Import` navigation item so client placement upload is visible without needing to discover it inside Imports.
- Reused the existing placement import API integration for `POST /api/v1/placement/import/upload` and defaulted the Import Operations page to the Placement Files tab when opened from the new route.
- Added modal styling for enterprise form dialogs.
- Build validation passed.

## 4.1.0 - Legacy Workflow Parity Hotfix

- Added a dedicated Placement Import workspace using the real placement import API and placement file list/detail APIs.
- Replaced the Matching Review navigation target with a dedicated Matching Review Queue instead of reusing the general Placement Work Center.
- Improved Create Claim behavior with explicit validation messages and an eligibility check before create.
- Preserved backend-defined status codes instead of inventing workflow status mappings not proven by Swagger.


## LP-07 — Reporting & Operations Center

- Added backend-driven Operations Center dashboard using reporting dashboard APIs.
- Enhanced Enterprise Reporting Center snapshot detail preview and export workflow.
- Documented unsupported reporting/notification/global-search capabilities as backend gaps.

## LP-08 — Administration, Templates & Security

- Expanded Administration Center into a full governance workspace.
- Added Templates and Audit Readiness tabs as explicit backend gap registers.
- Added permission matrix summary grouped by module.
- Preserved Swagger-backed admin/security write operations only.
- Documented missing template, audit, session, and role-permission mapping APIs.

## LP-09 — End-to-End Legacy Workflow Validation & Production Readiness

- Added Production Readiness navigation and page.
- Added LP-01 through LP-08 workflow traceability matrix.
- Added backend gap register.
- Added smoke-test checklist and release gate checklist.
- Added readiness CSV export.
- Added dashboard health indicators from existing reporting dashboard APIs.
- Added final go-live rule section.
