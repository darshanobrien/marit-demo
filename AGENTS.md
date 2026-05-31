# Marit Codex Operating Instructions

## Project Summary

Marit is an AI Business Case Prioritization and Evaluation Tool for a weekend-demo web app. Business teams submit AI opportunity requests, Marit evaluates feasibility, risk, and fit against known internal AI tools, and AI Builders review generated assessment reports.

This is a demo app, not a production system. Use mock data only unless a task explicitly changes that constraint.

## Repo Layout

- `docs/product/`: vision, personas, and user stories.
- `docs/requirements/`: functional and non-functional requirements.
- `docs/architecture/`: system design and architecture decision records.
- `docs/data/`: data model and mock data plan.
- `docs/api/`: lightweight notes for a future Azure Functions boundary.
- `docs/ai/`: AI evaluation design and responsible AI pillars.
- `docs/ui/`: design system and screen inventory.
- `docs/security/`: prototype security expectations and threat model.
- `docs/accessibility/`: WCAG 2.2 AA requirements.
- `docs/i18n/`: English and Canadian French localization guidance.
- `docs/testing/`: practical test strategy.
- `docs/backlog/`: build sequence and Codex task template.

## Expected Stack

- Frontend: Next.js, React, TypeScript.
- Hosting: Azure Static Web Apps.
- API: no API at first; Azure Functions only when a task needs a server boundary.
- Data: mock JSON or in-memory data first, with a small data access boundary that can later support Cosmos DB serverless.
- Infrastructure as Code: Bicep later, after the app skeleton and demo workflow are clear.
- Observability: Application Insights later, not a blocker for the first demo.

## Weekend-Demo Priorities

1. Make the happy path demoable end to end.
2. Keep data mocked and deterministic.
3. Prefer simple, readable implementation over abstraction.
4. Defer infrastructure, real authentication, real persistence, and real AI integration until explicitly requested.
5. Build only enough structure that these deferred pieces can be added without rewriting the happy path.

## Non-Negotiables

- Do not build production-only complexity into the first demo.
- Do not introduce real authentication unless a task explicitly asks for it.
- Do not introduce a real database unless a task explicitly asks for it.
- Do not introduce infrastructure or deployment code unless a task explicitly asks for it.
- Do not hard-code user-facing strings. Use localization resources from the start.
- Do not add paid dependencies without a short written justification.
- Do not store real client data or sensitive personal data.
- Keep implementation aligned with the docs, and update docs when product or architecture decisions change.

## Cost-Control Rules

- Prefer free tiers and serverless consumption models.
- Prefer static hosting and mock data first.
- Avoid paid SaaS dependencies.
- Avoid always-on services.
- Add Azure Functions only when a server boundary is explicitly requested.
- Add Cosmos DB serverless only when persistence is explicitly requested.
- Add Azure OpenAI only when real LLM integration is specifically requested.

## Security Rules

- Use mock data only.
- Treat all future business case content as confidential business information.
- Do not log secrets, prompts, or generated reports.
- Never commit secrets, API keys, local settings, or real customer examples.
- Design role-based authorization around Business User, AI Builder, and Admin even while roles are simulated.
- Future production authentication assumes Microsoft Entra employee-only access first; guest access is a later extension.
- Keep production security expectations documented when adding features.

## Accessibility Rules

- Target WCAG 2.2 AA.
- Use semantic HTML and keyboard-accessible controls.
- Do not rely on colour alone to convey priority, status, risk, or score.
- Ensure visible focus states.
- Use accessible names for form fields, buttons, icons, charts, and status indicators.
- Validate forms with text feedback connected to fields.

## Localization Rules

- Support `en-CA` and `fr-CA` from the start.
- Externalize user-facing strings.
- Use Canadian French suitable for Quebec users where relevant.
- Practical first-pass Canadian French is acceptable for the weekend demo, but structure resources so a fluent reviewer can polish later.
- Do not concatenate translated fragments in ways that break grammar.
- Format dates, numbers, and scores through locale-aware utilities.

## AI Safety and Review Rules

- Marit's AI is analytical only.
- AI must not execute workflows, contact systems, approve business cases, or make final decisions.
- Use deterministic mock generation for the first demo; do not use a real LLM, API keys, or static-only precomputed report fixtures.
- AI-generated assessments must be reviewed by an AI Builder.
- AI output should include reasoning summaries, uncertainty, risks, pros, cons, mitigation ideas, and responsible AI pillar scoring.
- Prompt and response storage is allowed only with mock data in the prototype and only when useful for the demo.
- Make it clear in the UI when content is AI-generated and pending human review.

## Testing Expectations

- Add focused tests with each implementation task when practical.
- Prioritize tests for scoring logic, localization loading, form validation, data mapping, and role-aware UI behavior.
- For UI work, include keyboard and accessibility checks.
- For AI mock services, keep deterministic fixtures so reports are stable.
- Run the relevant checks before finishing and report what was run.

## Definition of Done

An implementation task is done when:

- The requested behavior is implemented.
- User-facing strings are localized.
- Mock data is used unless otherwise requested.
- Accessibility requirements for the touched UI are considered.
- Tests or checks appropriate to the change have been run.
- Documentation is updated when behavior, architecture, data, security, or AI assumptions change.

## Planning Instructions

Plan first for ambiguous, cross-cutting, security-sensitive, localization-sensitive, accessibility-sensitive, or architecture-changing work. Keep plans short and practical, then implement once the direction is clear.

## Deferred Until Explicitly Requested

Do not introduce real authentication, a database, Azure infrastructure, Bicep, Application Insights, or live Azure OpenAI calls until a specific task asks for that capability.

## Required Final Response for Every Implementation Task

End every implementation task with:

- Files changed.
- Checks run.
- Known risks.
- Suggested next task.
