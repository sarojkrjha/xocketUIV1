# UAT Hotfix 01 — Auth Session and Header User Fix

## Fixed
- Header now uses authenticated backend user payload instead of fallback `User / Operator`.
- Auth store now normalizes backend token response fields:
  - `userId` / `id`
  - `displayName` / `name`
  - `email`
  - `roles`
  - `permissions`
- Auth storage now supports current and legacy keys:
  - `xocket-access-token`
  - `access_token`
  - `ops.auth.v1`
- Login stores the full auth session so page refresh keeps display name, role, and permissions.
- API client continues attaching `Authorization: Bearer <token>` using normalized storage.
- Sign out clears all known auth token/session keys.
- AG Grid `rowSelection` updated from deprecated string API to object API.

## Validation
- `npm run build` passed.
- Vite bundle-size warning remains only a warning, not a build failure.

## Expected UI result
After login with the shown Swagger response, the header should show:
- Name: `TIU SuperAdmin`
- Role: `SuperAdmin`
- Avatar: `T`
