# Mock Data Plan

## Goals

- Make the demo useful without a database.
- Keep scenarios deterministic.
- Avoid client data and sensitive personal data.
- Provide enough variation to show prioritization, risk, and tool matching.

## Seed Data Sets

### Demo Users

- Business User from Operations.
- AI Builder from the AI Lab.
- Admin for simulated demo navigation.

### Business Cases

The current seed set includes 4 business cases covering:

- Workflow triage.
- Knowledge search.
- Data readiness and data quality.
- Bilingual drafting and terminology.

Each case should vary by urgency, impact, data sensitivity, available data, and clarity.

### AI Tools

The current approved AI tools seed set includes 10 tools:

- Codex (desktop app).
- Codex plugins.
- M365 Copilot chat.
- Github Copilot.
- Azure Open AI.
- Custom web app development platform with Azure Open AI support for rapidly developing full custom applications with custom AI workflows.
- Azure Foundry agents.
- NIMO - a teams-integrated chatbot with access to IT support ticketing and knowledgebases.
- Claude Code.
- Claude Cowork.

Each tool includes id, name, description, capabilities, suitable use cases, limitations, risk notes, supported data sensitivity, status, implementation complexity, and catalogue metadata for exact inventory labels. All approved seed tools are suitable for Public and Confidential data. Codex plugins is Under Review. The custom web app platform and Azure Foundry agents require development. The custom web app platform uses Customizable as its integration option.

Administrators maintain an inventory of approved, restricted, pilot, and deprecated AI tools, as well as AI tools currently under review. Business cases are assessed not just abstractly, but against the actual AI capabilities available to the firm.

### Assessment Reports

For the first demo, reports should be deterministically generated from business case fields, templates, scoring rules, and tool metadata.

Seeded examples may include expected outputs for testing, but the app should not rely only on static precomputed report fixtures. Newly submitted mock business cases should eventually produce plausible deterministic assessments without a real LLM or API key.

## Browser-Session Submissions

The intake form now saves newly submitted fictional business cases to `localStorage` through a typed mock repository. Submissions persist through browser refresh on the same browser session/device and are merged with seeded cases by id. Each valid submission is saved with status `Ready` and paired with a deterministic mock assessment generated immediately by the existing evaluator.

The sample intake request uses fictional internal-service details only. It must remain free of real client, confidential, restricted, or personal data.

## Dashboard Display Data

The Dashboard reads seeded cases plus stored browser-session cases through the mock repository. Stored submitted cases use their saved assessment. Seeded cases or older cases without a stored assessment may receive an in-memory deterministic assessment for display and prioritization only; this does not write new records to browser storage.

Dashboard priority is a simple display signal derived from evaluator score and urgency. It is not a final approval or business decision.

## Reset Strategy

The app should be easy to reset by reloading seeded data. If browser storage is used, provide a simple reset path later.

## Data Sensitivity

Mock examples must not resemble real client data. Use generic business scenarios and fictional team names.

## Future Persistence

If persistence is explicitly requested, introduce a small data access boundary first, then add Cosmos DB serverless behind it.
