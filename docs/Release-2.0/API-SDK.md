# React UI API SDK Foundation

The frontend API layer is aligned to the backend OpenAPI contract in `docs/API/endpoint.json`.

## Rules

1. Do not guess endpoint URLs.
2. Use `ApiPath` constants from `src/shared/api/contracts/openapi.generated.ts`.
3. Feature components must not call axios directly.
4. Feature modules expose API functions from `features/<module>/api`.
5. Feature modules expose TanStack Query hooks from `features/<module>/hooks`.
6. Large/list endpoints must use server-side pagination.
7. Search-heavy pages must not load large datasets on first render.

## Shared API Layer

- `apiClient.ts` - Axios client, auth header, correlation ID, error normalization.
- `request.ts` - API verb helpers.
- `pagination.ts` - paged result normalization and query parameter cleanup.
- `problemDetails.ts` - RFC-style problem-details error mapping.
- `queryKeys.ts` - centralized TanStack Query keys.
- `contracts/openapi.generated.ts` - generated backend DTO and path contract.

## Current Integrated Modules

- Authentication
- Placement Queue
- Account Search API foundation
