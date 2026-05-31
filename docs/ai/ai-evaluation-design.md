# AI Evaluation Design

## Purpose

Marit's AI evaluation helps the AI Lab triage business cases. It generates an assessment report that AI Builders review before any decision or next step is treated as final.

## AI Scope

The AI may:

- Summarize a submitted business case.
- Compare the request with available AI tools.
- Identify feasibility signals.
- Identify implementation risks.
- Generate pros, cons, and next steps.
- Score responsible AI pillars.

The AI must not:

- Execute workflows.
- Contact external systems.
- Approve or reject business cases as a final authority.
- Make production decisions without human review.
- Use real client data in the prototype.

## First Demo Approach

Use deterministic mock generation for the first demo. Do not use a real LLM, API keys, or static-only precomputed report fixtures.

Newly submitted mock business cases can be evaluated by `DeterministicEvaluationService`, which uses templates, scoring rules, keyword capability matching, seeded mock tool data, and the locked responsible AI pillar list. The evaluator stays behind the `EvaluationService` interface so Azure OpenAI can replace it later.

The intake flow calls this existing service immediately after a valid browser-session submission and stores the generated assessment alongside the submitted case in `localStorage`. This does not add a real LLM, API key, network call, or server boundary.

The report view also uses this boundary. When an assessment is already stored, the report renders that saved mock assessment. When a seeded or older case has no stored assessment, the report generates a deterministic in-memory assessment on view without persisting it.

Benefits:

- No cost.
- Stable demo.
- Easy testing.
- No secrets.
- New demo submissions can produce plausible assessments without a network call.

## Future LLM Approach

When requested, introduce an LLM boundary that:

- Accepts structured business case input.
- Accepts the current AI tools catalogue.
- Uses a controlled prompt template.
- Requires JSON output matching the report schema.
- Performs validation and fallback handling.
- Stores prompts and responses only for mock data, and only when a task explicitly asks for storage.

## Evaluation Inputs

- Business case fields.
- Available AI tools.
- Responsible AI pillar definitions.

## Evaluation Output

The output should follow `BusinessCaseAssessment` in [Data Model](../data/data-model.md), including:

- Overall scores.
- Tool matches.
- Feasibility summary.
- Risks.
- Pros and cons.
- Recommended next steps.
- Responsible AI pillar assessments.

## Current Deterministic Rules

The first evaluator:

- Scores feasibility from request clarity, known data sources, tool fit, and data sensitivity.
- Recommends up to three AI tools based on capability keyword matches, data readiness, sensitivity fit, and implementation complexity.
- Produces all 10 responsible AI pillar assessments every time.
- Generates concerns, pros, cons, mitigation ideas, a recommendation category, and a plain-language next step.
- Uses a stable generated timestamp so identical inputs produce identical outputs.

## Review Requirement

Every generated assessment must be labelled as AI-generated until reviewed by an AI Builder. The UI should show review status clearly.

The first report view includes AI Builder review guidance but does not yet implement editable notes, approval, or review status changes.

## Quality Expectations

Good assessments are:

- Specific to the submitted pain point.
- Honest about uncertainty.
- Clear about missing information.
- Practical about next steps.
- Explicit about responsible AI risk.
