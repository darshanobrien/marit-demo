# Epics and Slices

This sequence is optimized for a weekend demo. Each slice should leave the app in a demoable or at least understandable state.

## 1. Repo and Documentation Setup

Goal: Establish project intent, constraints, architecture direction, and Codex operating instructions.

Deliverables:

- Repo documentation.
- ADRs.
- Build sequence.
- Task template.

Status: Complete when these docs are created.

## 2. App Shell and Minimal Design System

Goal: Create the first Next.js app structure with an internal-tool shell.

Deliverables:

- Next.js, React, TypeScript scaffold.
- Basic app shell.
- Navigation.
- Role switcher placeholder.
- Locale switcher wired to app-shell labels.
- A small set of shared UI tokens and components needed by the first screens.

## 3. Localization Foundation

Goal: Make localization the default before major UI work.

Deliverables:

- `en-CA` and `fr-CA` resources.
- Locale switcher.
- Locale-aware formatting helpers.
- Initial translated shell strings.

## 4. Mock Data Model and Seeded Demo Data

Goal: Add typed mock data for users, business cases, AI tools, pillars, and reports.

Deliverables:

- TypeScript types.
- Seed data.
- Data exports for users, business cases, AI tools, and responsible AI pillars.
- Reset-friendly structure.

Status: Foundation implemented with typed seed data. Future slices can add browser storage or data access functions when the intake flow needs mutable state.

## 5. Business Case Intake Form

Goal: Let Business Users submit an opportunity.

Deliverables:

- Intake form.
- Validation.
- Confirmation state.
- Localized copy.
- Mock save behavior.

Status: Implemented in the shell Submit view with localized form copy, accessible validation, fictional sample loading, localStorage-backed mock repository persistence, status `Ready`, deterministic mock assessment generation, and a success confirmation.

## 6. Business Case List and Prioritization Dashboard

Goal: Let AI Builders scan and prioritize submitted cases.

Deliverables:

- List or table.
- Scores and statuses.
- Filters.
- Links to reports.

Status: Implemented in the Dashboard view with seeded plus browser-session cases, summary metrics, status/readiness display, priority signals, filters, sorting, role-aware columns, and a disabled report action for the future report UI.
The dashboard report action is now enabled and opens the selected assessment in the Assessments / Reports shell view.

## 7. Deterministic AI Evaluation Mock Service

Goal: Generate assessment reports without paid AI calls, API keys, or static-only report fixtures.

Deliverables:

- Deterministic mock evaluation service.
- Template-based assessment text.
- Tool matching logic.
- Score calculation.
- Missing-information handling.

Status: Foundation implemented behind `EvaluationService`. Future slices can connect it to intake, dashboard, and report UI.

## 8. Responsible AI Scoring Report

Goal: Show full pillar scoring and explanation.

Deliverables:

- Pillar score section.
- Concerns, pros, cons, and mitigations.
- Risk labels that do not rely on colour alone.

Status: Implemented as the Responsible AI Scoring Report view with all 10 pillars, tool fit, executive summary, submitted case context, pros/cons, concerns, mitigations, reviewer guidance, and deterministic demo disclaimer.

## 9. AI Builder Review Screen

Goal: Let AI Builders review AI-generated assessments.

Deliverables:

- Review notes.
- Review status update.
- Reviewed-by metadata in mock state.
- Clear AI-generated label.

## 10. Polished In-App and Print-Friendly Report View

Goal: Provide a polished in-app report view first, then browser print styling.

Deliverables:

- Polished report layout.
- Print-friendly browser layout.
- Executive summary.
- Responsible AI table.
- Review notes.

Do not add PDF export for the MVP. Do not prioritize shareable routes unless routing naturally supports them.

Status: Basic browser print styling is implemented for the in-shell report. PDF export remains out of scope.

## 11. Azure Static Web Apps Deployment

Goal: Deploy the static demo inexpensively after the happy path is usable.

Deliverables:

- Azure Static Web Apps configuration.
- Build script confirmation.
- Deployment notes.

## 12. Optional Azure Functions API

Goal: Add a server boundary when useful.

Deliverables:

- Azure Functions API.
- API contract implementation.
- Server-side validation.

Only start when a task explicitly asks for it. Do not add it as part of the first static demo.

## 13. Optional Cosmos DB Serverless Persistence

Goal: Add durable persistence if the demo needs saved records.

Deliverables:

- Cosmos DB serverless integration.
- Repository implementation.
- Seed/reset strategy.

Only start when a task explicitly asks for it. Do not add it as part of the first static demo.

## 14. Optional Azure OpenAI Integration

Goal: Replace deterministic mock evaluation with real LLM report generation.

Deliverables:

- Prompt templates.
- JSON schema validation.
- Safety and failure handling.
- Cost controls.

Only start when a task explicitly asks for it. Do not add it as part of the first static demo.

## Recommended Next Slice

Start with slice 9: AI Builder Review Screen.
