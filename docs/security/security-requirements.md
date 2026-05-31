# Security Requirements

## Prototype Rules

- Use mock data only.
- Do not store client data.
- Do not commit secrets.
- Do not add real authentication until specifically requested.
- Treat role switching as a demo feature, not a security control.

## Future Production Expectations

Marit would eventually handle confidential business information. Production design should include:

- Real authentication with Microsoft Entra ID for employee-only access first.
- Role-based authorization.
- Least-privilege access.
- Secure secret storage.
- Server-side validation.
- Audit logging for assessment and review actions.
- Encryption in transit and at rest.
- Data retention and deletion policies.
- Prompt and response retention rules.
- Protection against prompt injection and data exfiltration.

## Role Authorization Expectations

Business User:

- Can create business cases.
- Can view their own or team-visible business cases depending on future policy.

AI Builder:

- Can view submitted business cases.
- Can view and review assessment reports.
- Can add review notes.

Admin:

- Can use simulated demo navigation for AI tools catalogue management.
- Would manage tools, pillars, and system settings in production.

Administrators maintain an inventory of approved, restricted, pilot, and deprecated AI tools, as well as AI tools currently under review. Business cases are assessed not just abstractly, but against the actual AI capabilities available to the firm.

The Admin tools page is role-aware in the prototype shell, but this remains client-side simulation. Production must enforce Admin authorization on the server before catalogue changes are trusted or persisted.

Guest or external access is not part of the first production assumption. It may be considered later as an extension.

## Secrets

No secrets should be needed for the initial documentation or static mock demo. Future Azure OpenAI or Azure Functions work must use environment configuration and managed secrets, not committed files.

## Logging

If logs are added, avoid sensitive business case details, prompts, responses, and personal data. Use safe event names; add correlation IDs only if the system complexity justifies them.
