# Release 2.0.6 — Enterprise Legal Review Workspace

This release introduces the legal operations step after matching. It gives reviewers a workspace to validate match readiness, evidence, flags, attorney/court context, and decide whether to approve or reject the placement for downstream claim work.

## Primary API

- `PUT /api/v1/placement/accounts/{placementAccountId}/legal-review`

## Supporting API

- `POST /api/v1/placement/accounts/{placementAccountId}/flags`

## UX Principles

- Decision-first workspace.
- Checklist-driven legal readiness.
- Sticky decision panel.
- Evidence visible without modal navigation.
- No placeholder endpoints.
