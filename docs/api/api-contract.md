# Future API Notes

## Current Position

No API is required for the first static demo. These notes sketch a possible Azure Functions boundary if a later task needs server-side behavior.

## Principles

- Keep endpoints small and demo-focused.
- Do not expose secrets to the browser.
- Validate input server-side when an API exists.
- Avoid storing sensitive prompt or report data unless explicitly needed.

## Candidate Endpoints

These are candidates, not committed requirements.

### `GET /api/business-cases`

Returns business cases visible to the current role.

In a prototype API, demo role simulation may pass a role or demo user ID through a header or query string. Production should use Microsoft Entra ID and server-enforced authorization.

### `POST /api/business-cases`

Creates a business case.

Request body follows the `BusinessCase` intake fields, excluding generated fields such as `id`, `status`, `createdAt`, and `updatedAt`.

### `GET /api/business-cases/{id}`

Returns one business case and its assessment if available.

### `POST /api/business-cases/{id}/assessment`

Generates or regenerates an assessment report.

An initial API implementation should still be able to use a mock service. A future implementation may call Azure OpenAI from the function.

### `GET /api/ai-tools`

Returns available AI tools.

### `PATCH /api/assessments/{id}/review`

Updates AI Builder review notes and status.

## Error Shape

```json
{
  "error": {
    "code": "validation_failed",
    "message": "A user-friendly localized message key or safe message.",
    "details": []
  }
}
```

## Deferred Decisions

- Microsoft Entra ID integration and token claims.
- Cosmos DB partition keys.
- Report export endpoint.
- Prompt and response retention policy.
