# LP-08 — Administration, Templates & Security

## Implemented / changed

- Continued from LP-07 baseline.
- Expanded Administration Center into the LP-08 governance workspace.
- Added nine administration tabs:
  - Clients
  - Portfolios
  - Workflow Queues
  - System Settings
  - Users
  - Roles
  - Permissions
  - Templates
  - Audit Readiness
- Preserved Swagger-backed write operations:
  - Create client
  - Create portfolio
  - Create workflow queue
  - Upsert system setting
  - Create user
  - Assign role to user
  - Assign client access to user
- Added permission matrix summary grouped by module from the read-only permissions API.
- Added explicit Template backend gap register instead of inventing template CRUD.
- Added explicit Audit/Security evidence backend gap register instead of inventing audit/session APIs.
- Added clearer LP-08 page copy to distinguish live API features from backend gaps.
- Added LP-08 responsive styles for the expanded admin tab set.

## Swagger-backed APIs used

- GET /api/v1/admin/clients
- POST /api/v1/admin/clients
- GET /api/v1/admin/portfolios
- POST /api/v1/admin/portfolios
- GET /api/v1/admin/system-settings
- PUT /api/v1/admin/system-settings
- GET /api/v1/admin/workflow-queues
- POST /api/v1/admin/workflow-queues
- GET /api/v1/security/users
- POST /api/v1/security/users
- GET /api/v1/security/roles
- GET /api/v1/security/permissions
- POST /api/v1/security/users/{userId}/roles/{roleId}
- POST /api/v1/security/users/{userId}/clients/{clientId}

## Backend gaps not invented

- No document-template CRUD endpoint.
- No email-template CRUD endpoint.
- No timeline-template CRUD endpoint.
- No workflow-template definition endpoint.
- No notification-template endpoint.
- No audit trail search endpoint.
- No login history endpoint.
- No session list/revoke endpoint.
- No role create/update endpoint.
- No permission create/update endpoint.
- No role-permission mapping endpoint.
- No role/client assignment history endpoint.

## Build validation

- npm run build passed.
- Vite reported only a bundle-size warning, not a build error.
