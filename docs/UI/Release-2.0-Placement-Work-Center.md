# Release 2.0 UI - Placement Work Center

## Scope

This iteration introduces the first real business module in the React UI, following the same module-by-module implementation pattern used in the backend.

## Implemented

- Placement Work Center route inside the Enterprise Shell
- Permission-ready sidebar navigation state
- Server-side account search integration through `GET /api/accounts`
- TanStack Query hook for placement accounts
- AG Grid based placement queue
- Search box, match-status filter, refresh, export/bulk-action placeholders
- Server-side pagination controls
- Status badges, SSN last-4 masking, court/case context columns
- Placement-specific page styling using the Xocket design-token system

## Business Flow Alignment

The Placement Work Center is implemented first because placement is the operational entry point for downstream bankruptcy matching, claim eligibility, POC generation, documents, filing, receipts, payments, scrubbing, monitoring, and reporting.

## Next Recommended Module

Matching Review Work Center.

This will add the multiple-match comparison table and accept/reject decision workflow.
