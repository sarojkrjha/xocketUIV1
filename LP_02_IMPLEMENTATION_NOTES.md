# LP-02 — Matching & Legal Review Implementation Notes

Baseline used: user-uploaded `XocketUI.zip`, preserving user CSS/class fixes.

## Implemented

### Matching Review
- Kept a dedicated Matching Review Queue instead of routing users to the generic Placement Work Center.
- Matching Review continues to use `GET /api/v1/placement/queue` with backend-defined queue/match status filters.
- Placement detail opens the evidence-first Match Review Workspace.
- Candidate comparison grid supports evidence review, candidate drawer, selected candidate context, run matching, and accept match.
- Added `Reject / Flag Candidate` action. Because Swagger does not expose a dedicated reject-match endpoint, this records a `MATCH_REJECTED` review flag through `POST /api/v1/placement/accounts/{placementAccountId}/flags` instead of inventing a non-existent API.

### Legal Review
- Added first-class Legal Review navigation item.
- Added dedicated Legal Review Queue page.
- Legal Review Queue uses `GET /api/v1/placement/queue`, defaulting to the local Legal Review queue status mapping.
- Legal Review detail opens the existing Placement Account Workspace and lands operators in the legal decision workflow section.
- Legal Review Workspace includes checklist, evidence summary, flags, approve, reject/return, and escalation actions.
- Added review flag resolution using the real Swagger endpoint `PUT /api/v1/placement/flags/{placementReviewFlagId}/resolve`.

### API/Hook Changes
- Added `ResolvePlacementReviewFlagRequest` type.
- Added `resolvePlacementReviewFlag` API client function.
- Added `useResolvePlacementReviewFlag` mutation hook.
- Legal review and flag resolution invalidate placement detail, queue, and dashboard queries.

## Changed Files
- `src/shared/layout/navigation.ts`
- `src/app/App.tsx`
- `src/features/placement/api/placementApi.ts`
- `src/features/placement/hooks/usePlacementMatching.ts`
- `src/features/placement/types/placement.ts`
- `src/features/placement/components/MatchDecisionPanel.tsx`
- `src/features/placement/components/MatchReviewWorkspace.tsx`
- `src/features/placement/components/LegalReviewWorkspace.tsx`
- `src/features/placement/pages/LegalReviewQueuePage.tsx`

## Backend Gaps Not Invented
- No dedicated reject-match endpoint in current Swagger.
- No dedicated skip-match endpoint in current Swagger.
- No explicit queue endpoint named `matching-review`; the UI uses `/api/v1/placement/queue` with backend-defined status filters.
- No explicit queue endpoint named `legal-review`; the UI uses `/api/v1/placement/queue` with backend-defined status filters.
- No backend-provided status dictionary endpoint; UI keeps status codes editable/configurable in filters.

## Build Validation
- `npm ci` completed successfully.
- `npm run build` completed successfully.
- Vite reported a bundle-size warning only; no TypeScript/build errors.

## Next LP Command
When LP-02 is accepted, say:

`Start LP-03 – Filing Operations`
