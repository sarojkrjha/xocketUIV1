# Release 2.0.6 — Placement Operations Workspace

This release introduces the first full operational work center for Xocket UI.

## APIs Used
- `GET /api/v1/placement/dashboard`
- `GET /api/v1/placement/queue`
- `GET /api/v1/placement/accounts/{placementAccountId}`

## Rules
- The queue never loads all records automatically.
- All queue data uses server-side pagination.
- Filtering is passed to the backend API.
- Double-clicking a row opens the placement workspace.

## Next
The next release adds the Enterprise Match Review Workspace.
