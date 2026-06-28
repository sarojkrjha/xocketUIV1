# Release 2.0.4 — Enterprise Account Workspace

The Account Workspace is the first reusable business workspace pattern for the Xocket Enterprise Operations Portal.

## Purpose

Provide a single operational view of an account before users move into placement, bankruptcy matching, claims, documents, or timeline activity.

## Backend Contract

- `GET /api/v1/accounts/{accountId}`

## Workspace Areas

- Identity header
- Summary cards
- Action toolbar
- Overview tab
- Contacts tab foundation
- Bankruptcy tab foundation
- Future lazy-load tabs for timeline, claims, documents, tasks, and audit

## Design Rule

No large account data is loaded automatically. Account Search remains search-first and paginated. The workspace loads only a single selected account.
