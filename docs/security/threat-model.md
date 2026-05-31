# Threat Model

## Scope

This threat model covers the prototype direction and future production expectations. The first demo uses mock data and no real authentication.

## Assets

- Business case submissions.
- Assessment reports.
- Responsible AI scores.
- AI prompts and responses.
- AI tools catalogue.
- Review notes.
- Future secrets and API keys.

## Actors

- Business User.
- AI Builder.
- Admin, later.
- Unauthenticated visitor in the day-one demo.
- Future malicious internal or external user once real auth or public deployment is introduced.

## Key Threats

## Data Exposure

Risk: Confidential business information could be exposed through UI, logs, prompts, exports, or storage.

Mitigations:

- Mock data only in prototype.
- Avoid logging sensitive content.
- Add real authorization before production data.
- Define retention policy before storing prompts or reports beyond local mock/demo state.

## Prompt Injection

Risk: Submitted text could instruct the AI to ignore rules, reveal data, or produce unsafe output.

Mitigations:

- AI is non-agentic.
- AI receives only necessary context.
- Validate structured output.
- Label AI content as draft.
- Require AI Builder review.

## Unauthorized Access

Risk: Users could access reports or admin configuration they should not see.

Mitigations:

- Day-one role switcher is demo-only.
- Future implementation requires real auth, likely Microsoft Entra ID, and server-enforced authorization.

## Incorrect AI Recommendation

Risk: AI-generated assessment could be wrong, incomplete, or overconfident.

Mitigations:

- Require human review.
- Show confidence and uncertainty.
- Include missing information and risks.
- Keep deterministic mock outputs testable.

## Dependency or Supply Chain Risk

Risk: Unnecessary packages increase maintenance and security risk.

Mitigations:

- Avoid paid or unnecessary dependencies.
- Prefer framework capabilities.
- Keep dependencies minimal.

## Future Secrets Exposure

Risk: API keys or connection strings could be committed or exposed to the browser.

Mitigations:

- Use Azure Functions for secret-backed operations.
- Use environment variables and managed secret storage.
- Never expose service keys in client bundles.
