# Test Strategy

## Goals

- Keep the weekend demo stable.
- Test the highest-risk logic without slowing development.
- Make mock AI output deterministic.
- Catch accessibility and localization issues early.

## Early Test Priorities

- Business case form validation.
- Mock data loading.
- Role-specific navigation and visibility.
- Localization resource loading.
- AI tool matching logic.
- Responsible AI score mapping.
- Assessment report rendering.
- Review status updates.

## Suggested Checks

When the app exists, use:

- Type checking.
- Linting.
- Unit tests for scoring and mapping logic.
- Component tests for forms and reports where practical, after UI patterns stabilize.
- Accessibility checks for key screens.
- Manual keyboard walkthrough of intake, dashboard, report, and review.

## Mock AI Testing

Mock AI evaluation should:

- Be deterministic.
- Use fixtures.
- Produce all first-demo report fields.
- Handle missing or weak intake data.
- Flag uncertainty instead of pretending every idea is high confidence.

## Localization Testing

Check:

- English and French resource completeness.
- No hard-coded user-facing strings in touched UI.
- Long French strings do not break layouts.
- Date and number formatting uses the active locale.

## Demo Readiness Checklist

- Happy path works from intake to reviewed report.
- Seeded demo data is available.
- Role switcher works.
- Locale switcher works.
- No real secrets or client data are present.
- Known limitations are documented.
