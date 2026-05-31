# Marit

Marit is an AI Business Case Prioritization and Evaluation Tool for a weekend-demo web app.

Business teams submit AI opportunity requests. Marit evaluates each request against a known list of available AI tools, generates a feasibility and responsible AI assessment, and prepares a report for an internal AI Lab. AI Builders then review the AI-generated assessment.

## Current Status

This repository contains planning documentation, a bilingual landing page, and the initial static-first Next.js app shell. No API, database, infrastructure, real authentication, or real AI integration has been added.

## Demo Goal

The first demo should show this happy path:

1. A Business User submits a business case describing a pain point.
2. Marit evaluates the request against available internal AI tools.
3. Marit generates an AI Lab assessment report.
4. The report includes feasibility, relevant tools, implementation risks, pros and cons, recommended next steps, and responsible AI scoring.
5. An AI Builder reviews the generated assessment.

## Target Stack

- Frontend: Next.js, React, TypeScript.
- Hosting: Azure Static Web Apps.
- API: no API for the first static demo; Azure Functions later if needed.
- Data: mock JSON or in-memory data first.
- Future persistence: Cosmos DB serverless only if explicitly requested.
- Infrastructure as Code: Bicep after the app workflow is clear.
- Observability: Application Insights later, only if useful.

## Principles

- Weekend-demo first.
- Mock data only.
- Minimal Azure cost.
- No real authentication on day one.
- Role-aware design for Business User, AI Builder, and a mostly deferred Admin role.
- English and Canadian French from the start.
- WCAG 2.2 AA target.
- AI output must be reviewed by an AI Builder.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the local dev server:

```bash
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Run checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Current Implementation

- Bilingual landing page with hero, product explanation, workflow steps, audience sections, and CTA into the demo shell.
- Static-first Next.js app shell.
- Typed mock domain models in [lib/domain/types.ts](lib/domain/types.ts).
- Seeded mock users, business cases, AI tools, and responsible AI pillars in [lib/data](lib/data).
- Deterministic mock evaluator behind `EvaluationService` in [lib/evaluation](lib/evaluation).
- No real authentication, database, API, Azure infrastructure, or live AI integration.

## Documentation Map

- [Product Vision](docs/product/vision.md)
- [Personas](docs/product/personas.md)
- [User Stories](docs/product/user-stories.md)
- [Functional Requirements](docs/requirements/functional-requirements.md)
- [Non-Functional Requirements](docs/requirements/non-functional-requirements.md)
- [System Design](docs/architecture/system-design.md)
- [Data Model](docs/data/data-model.md)
- [API Contract](docs/api/api-contract.md)
- [AI Evaluation Design](docs/ai/ai-evaluation-design.md)
- [Responsible AI Pillars](docs/ai/responsible-ai-pillars.md)
- [Design System](docs/ui/design-system.md)
- [Screens](docs/ui/screens.md)
- [Security Requirements](docs/security/security-requirements.md)
- [Threat Model](docs/security/threat-model.md)
- [Accessibility Requirements](docs/accessibility/accessibility-requirements.md)
- [Localization](docs/i18n/localization.md)
- [Test Strategy](docs/testing/test-strategy.md)
- [Epics and Slices](docs/backlog/epics-and-slices.md)
- [Codex Task Template](docs/backlog/codex-task-template.md)

## For Codex Sessions

Read [AGENTS.md](AGENTS.md) before making changes. It defines repo-specific operating rules, including cost control, security, localization, accessibility, AI review, and final response requirements.
