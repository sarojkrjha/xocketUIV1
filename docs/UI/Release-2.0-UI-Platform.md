# Release 2.0 — UI Platform

## Goal

Build Xocket as an Enterprise Bankruptcy Operations Portal, not as isolated pages.

## Initial scope

- Authentication
- Theme system
- Enterprise shell
- Permission-ready navigation
- API client
- Module-wise roadmap

## Design source

The uploaded standard product snapshots provided the reference design language:
- iOS blue primary color
- light/dark token model
- card-based layout
- status badges
- sidebar/header shell
- form styling
- notification patterns
- skeleton loading patterns

## Implementation pattern

Each frontend module should follow the backend module pattern:

```text
feature/
  api/
  components/
  hooks/
  pages/
  schemas/
  store/
  types.ts
```

## Recommended module order

```text
Authentication
  ↓
Placement Work Center
  ↓
Matching Review
  ↓
Claims / POC
  ↓
Documents
  ↓
Scrubbing
  ↓
Monitoring
  ↓
Reporting
  ↓
Administration
```
