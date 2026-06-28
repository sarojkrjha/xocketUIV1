# Account Search Module

## Purpose

The Account Search module is the first backend-aligned business screen in the React portal.
It uses the OpenAPI contract endpoint:

`GET /api/v1/accounts/search`

## Rules

- Do not load the full account population automatically.
- Search only after user action.
- Use server-side pagination.
- Keep page size fixed at 25 for the initial implementation.
- Support advanced search fields exposed by the backend contract.

## Supported Filters

- search
- accountNumber
- contactName
- last4
- phone
- email
- bankruptcyCaseNumber
- stateCode
- courtName

## Next Step

Account Detail should use:

`GET /api/v1/accounts/{accountId}`
