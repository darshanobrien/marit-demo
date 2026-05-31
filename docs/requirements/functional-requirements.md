# Functional Requirements

## Roles

Marit should be designed around three roles, with only the first two needed for the first happy path:

- Business User: submits and views business cases.
- AI Builder: reviews assessments and prioritization.
- Admin: deferred configuration role.

Day one should simulate roles through a role switcher with Business User, AI Builder, and Admin. This is not real authentication.

## Business Case Intake

The first demo should collect enough information to generate a useful assessment:

- Title.
- Business area or function.
- Pain point summary.
- Current process.
- Desired outcome.
- Who is affected.
- Estimated volume or frequency.
- Data involved.
- Multi-select data sensitivity estimate.
- Current tools or systems.
- Urgency.
- Expected benefits.

Optional fields may include:

- Constraints or deadlines.
- Imagined AI solution.
- Demo submitter reference.

The intake form should show a prominent mock-data warning, include a fictional sample request action, validate required fields inline and in an accessible summary, save submitted cases to browser storage through a typed mock repository, set new submissions to `Ready`, and immediately generate a deterministic mock assessment for AI Builder review.

## Prioritization

The app should derive or display:

- Overall opportunity score.
- Feasibility score.
- Impact score.
- Risk score.
- Confidence level.
- Status.
- Recommended next step.

For the first demo, scores should be deterministically generated from mock inputs, templates, scoring rules, and seeded mock tool data.

The Dashboard view should list seeded and browser-session submitted cases together. It should show status, urgency, data sensitivity, created date, assessment readiness, and a simple priority signal. Business User copy should emphasize request status and next step. AI Builder and Admin copy may show additional prioritization signals such as score, responsible AI risk, and recommended tool fit.

Dashboard filters should remain lightweight: status, business area, and urgency are enough for the demo. Sorting should support newest first, urgency, and priority/score.

## AI Tool Matching

The app should compare each business case with a mocked list of available AI tools. Each matched tool should include:

- Tool name.
- Capability category.
- Fit explanation.
- Constraints.
- Relative suitability.

## Assessment Report

Each first-demo report should include:

- Feasibility assessment.
- Relevant AI tools.
- Key implementation risks.
- Pros.
- Cons.
- Recommended next steps.
- Responsible AI pillar scores and explanations.
- Review status.
- AI Builder review notes.

## Responsible AI Scoring

For each of the 10 responsible AI pillars, the assessment should include:

- Risk score.
- Explanation.
- Concerns.
- Pros.
- Cons.
- Mitigation ideas where appropriate.

## Review

AI Builders should be able to:

- Open a generated assessment.
- See that the content is AI-generated.
- Add review notes.
- Mark the assessment as reviewed.

## Export or Shareable Report

The first priority is a polished in-app assessment report view. The second priority is browser print styling for that report. Do not build PDF export for the MVP, and do not prioritize shareable routes unless routing naturally supports them.
