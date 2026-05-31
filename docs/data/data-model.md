# Data Model

## Entities

The TypeScript source of truth lives in [lib/domain/types.ts](../../lib/domain/types.ts). Seeded demo data lives in [lib/data](../../lib/data).

## DemoUser

Represents a seeded user for role simulation. Keep this minimal; it is not a real identity model.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable demo identifier. |
| `displayName` | string | Minimal personal data. |
| `role` | `businessUser` \| `aiBuilder` \| `admin` | Simulated role. Admin is deferred for the first demo. |
| `team` | string | Optional demo team. |
| `localePreference` | `en-CA` \| `fr-CA` | Optional. |

## BusinessCase

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable identifier. |
| `title` | string | Short name. |
| `businessArea` | BusinessArea | Optional intake-native business area/function value. |
| `team` | string | Business unit or submitting group. |
| `submitterUserId` | string | References `DemoUser`. |
| `painPoint` | string | Main problem statement. |
| `currentProcess` | string | Optional: how work happens today. |
| `desiredOutcome` | string | Target result. |
| `impactStatement` | string | Business value if solved. |
| `affectedPeople` | string | Optional intake-native description of who is affected. |
| `estimatedVolume` | string | Optional intake-native volume or frequency. |
| `knownDataSources` | string[] | Mock data source names only. |
| `dataSensitivity` | `low` \| `medium` \| `high` \| `unknown` | Estimate for assessment. |
| `dataSensitivitySelections` | IntakeDataSensitivity[] | Optional intake-native multi-select values. |
| `urgency` | `low` \| `medium` \| `high` | Demo prioritization input. |
| `urgencySelection` | `low` \| `medium` \| `high` \| `critical` | Optional original intake urgency selection. `critical` maps to `high` for deterministic evaluator compatibility. |
| `currentTools` | string | Optional intake-native tools/systems description. |
| `expectedBenefits` | ExpectedBenefit[] | Optional intake-native selected benefits. |
| `expectedUsers` | string | Optional: who benefits or uses the solution. |
| `constraints` | string[] | Optional: deadline, policy, system, or process constraints. |
| `imaginedAiSolution` | string | Optional intake-native AI idea description. |
| `status` | `draft` \| `submitted` \| `ready` \| `assessed` \| `reviewed` | Demo workflow status. New valid intake submissions are saved as `ready` and displayed as Ready. |
| `createdAt` | string | ISO timestamp or deterministic demo date. |
| `updatedAt` | string | ISO timestamp or deterministic demo date. |

## Intake Mapping

The browser intake form captures richer user input than the evaluator needs. Mapping keeps the evaluator stable:

- `Restricted` or `PII` maps to `high` data sensitivity.
- `Confidential` maps to `medium`.
- `Public` maps to `low`.
- `Unknown` maps to `unknown`.
- `Critical` urgency is preserved in `urgencySelection` and maps to evaluator urgency `high`.
- `dataInvolved` is split into `knownDataSources` by commas or line breaks.

## Browser-Session Repository

The mutable demo repository is local to the browser:

- Seed cases remain in `lib/data/businessCases.ts`.
- Submitted cases and generated assessments are stored in `localStorage`.
- The repository merges seeded and stored records by id.
- No API, database, authentication, or Azure service is involved.

## Dashboard Display Model

The Dashboard uses a derived display model rather than a persisted dashboard entity:

- Each displayed row pairs a `BusinessCase` with a stored `BusinessCaseAssessment` when one exists.
- If no stored assessment exists, the deterministic evaluator can generate an in-memory assessment for dashboard scoring only.
- `ready`, `assessed`, and `reviewed` are treated as assessment-ready display states.
- Display priority is derived from evaluator score and urgency. It is a triage signal only, not a final recommendation.

## Report Display Model

The Responsible AI report also uses a derived display model:

- A selected business case id resolves against seeded plus browser-session cases.
- Stored assessments are preferred for submitted browser-session cases.
- Missing assessments can be generated in memory through `EvaluationService`.
- Recommended tool ids are joined to the mock AI tool catalogue for names, descriptions, limitations, and complexity.
- Responsible AI pillar ids are joined to the locked pillar catalogue for names and descriptions.

## AITool

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable identifier. |
| `name` | string | Tool name. |
| `shortDescription` | string | What the tool does. |
| `capabilities` | AIToolCapability[] | Example: document extraction, search, summarization, triage. |
| `suitableUseCases` | string[] | Fit signals. |
| `limitations` | string[] | Constraints and caveats. |
| `riskProfile` | AIToolRiskProfile | Demo sensitivity support, risk notes, and human review flag. |
| `implementationComplexity` | `low` \| `medium` \| `high` | Demo build estimate. |

## BusinessCaseAssessment

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable identifier. |
| `businessCaseId` | string | References `BusinessCase`. |
| `generatedAt` | string | ISO timestamp. |
| `generatedBy` | `deterministicMock` | No real LLM or API key. |
| `feasibility` | FeasibilityAssessment | Score, summary, positive signals, and gaps. |
| `recommendedTools` | ToolRecommendation[] | Relevant AI tools and fit rationale. |
| `pillarAssessments` | PillarAssessment[] | 10 responsible AI pillar scores. |
| `concerns` | EvaluationConcern[] | Cross-cutting concerns. |
| `pros` | EvaluationProCon[] | Positive signals. |
| `cons` | EvaluationProCon[] | Caveats. |
| `mitigationIdeas` | string[] | Practical mitigations. |
| `recommendation` | EvaluationRecommendation | Deterministic next-step category. |
| `recommendedNextStep` | string | Plain-language AI Lab next step. |
| `overallScore` | EvaluationScore | 0 to 100 score with explanation. |
| `confidence` | `low` \| `medium` \| `high` | Assessment confidence. |

## EvaluationScore

| Field | Type | Notes |
| --- | --- | --- |
| `value` | number | 0 to 100. |
| `level` | `low` \| `moderate` \| `high` \| `critical` | For feasibility scores, low level means favourable. For risk scores, low level means low risk. |
| `explanation` | string | Short deterministic rationale. |

## ToolRecommendation

| Field | Type | Notes |
| --- | --- | --- |
| `toolId` | string | References `AITool`. |
| `fitScore` | EvaluationScore | 0 to 100 fit score. |
| `rationale` | string | Why it matches. |
| `limitations` | string[] | Relevant limitations. |

## PillarAssessment

| Field | Type | Notes |
| --- | --- | --- |
| `pillarId` | string | References responsible AI pillar. |
| `riskScore` | EvaluationScore | 0 to 100, higher means more risk. |
| `explanation` | string | Plain-language reasoning. |
| `concerns` | EvaluationConcern[] | Risk signals. |
| `pros` | EvaluationProCon[] | Positive signals. |
| `cons` | EvaluationProCon[] | Negative signals. |
| `mitigationIdeas` | string[] | Practical mitigations. |

## Evaluation Service Boundary

The evaluator is intentionally behind an interface:

- `EvaluationService` defines `evaluate(input): BusinessCaseAssessment`.
- `DeterministicEvaluationService` implements deterministic mock generation.
- A future Azure OpenAI-backed implementation should replace the service behind this boundary instead of changing UI code directly.

## BuilderReview

Builder review is not implemented yet. It remains a future UI/data concern for the AI Builder review slice.

| Field | Type | Notes |
| --- | --- | --- |
| `status` | `notReviewed` \| `inReview` \| `reviewed` | Human review state. |
| `reviewerUserId` | string | Optional demo user reference until reviewed. |
| `notes` | string | AI Builder notes. |
| `reviewedAt` | string | Optional ISO timestamp. |
