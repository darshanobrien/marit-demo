# Screens

## App Shell

Purpose: Provide navigation, current role, current locale, and demo context. The shell now opens on the bilingual landing page and lets users enter the demo views through navigation or CTAs.

Key elements:

- Product name.
- Navigation links.
- Role switcher.
- Locale switcher.
- Clear indication that demo data is mocked.

## Landing Page

Purpose: Introduce Marit to demo viewers before they enter the shell workflow.

Key elements:

- Hero section with visual context and a concise value proposition.
- What Marit Is.
- Why It Exists.
- How It Works in 3 to 5 steps.
- Who It Helps for Business Teams and AI Builders.
- CTA to enter the demo or start a business case.
- English and Canadian French content through the shared i18n dictionary.

## Business Case Intake

Purpose: Let a Business User submit an AI opportunity.

Key elements:

- One-page form with sections for opportunity overview, business context, data and risk, expected value, and review.
- Prominent mock-data warning instructing users not to enter real client, confidential, restricted, or personal data.
- Required fields for title, business area, pain point, desired outcome, affected people, data involved, data sensitivity, urgency, and expected benefits.
- Inline validation messages and an accessible error summary.
- Demo actions to load a credible fictional sample request or clear the form.
- Confirmation state showing the submitted request is `Ready` and the mock assessment is ready for AI Builder review.
- English and Canadian French content through the shared i18n dictionary.

## Business Case List and Prioritization Dashboard

Purpose: Help Business Users see submitted request status and help AI Builders scan opportunities.

Key elements:

- Summary metrics for total requests, ready-for-review cases, high urgency cases, strong-fit cases, and the highest-priority opportunity.
- Seeded and browser-session submitted business cases merged through the mock repository.
- Status, urgency, data sensitivity, created date, priority, score, and assessment readiness.
- Role-aware table content: Business Users see status/readiness/next step, while AI Builders and Admin also see responsible AI risk and tool-fit signals.
- Filters by status, business area, and urgency.
- Sorting by newest, urgency, or priority/score.
- CTA to submit a new business case.
- View assessment action opens the selected case in the Assessments / Reports shell view.
- Empty state if no cases are available.

## Assessment Report

Purpose: Show a polished in-app AI-generated assessment for one business case. This is the first report priority.

Key elements:

- AI-generated label.
- Executive summary.
- Feasibility assessment.
- Relevant AI tools.
- Risks.
- Pros and cons.
- Recommended next steps.
- Responsible AI pillar scores.
- Submitted business case details.
- Key concerns and mitigation ideas.
- Non-editable AI Builder review context.
- Deterministic demo disclaimer.
- Back to dashboard, submit another case, and browser print actions.

## Print-Friendly Browser Layout

Purpose: Make the in-app report print cleanly from the browser after the report view works.

Do not build PDF export for the MVP. Do not prioritize shareable report routes unless routing naturally supports them.

## AI Builder Review

Purpose: Let AI Builders review the generated report.

Key elements:

- Report context.
- Review notes.
- Mark as reviewed action.
- Reviewer and review timestamp in mock data.

## Shareable Report View Later

Purpose: Provide a clean report route for demo sharing if it becomes useful later.

Key elements:

- Business case summary.
- Assessment summary.
- Responsible AI table.
- Review notes if available.

## Admin Configuration Later

Purpose: Manage demo configuration after the happy path is working.

Do not build this for the first demo unless specifically requested.

Deferred elements:

- AI tools catalogue editing.
- Responsible AI pillar editing.
- Demo data reset.
