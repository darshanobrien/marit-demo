# Non-Functional Requirements

## Cost

- Keep Azure cost minimal.
- Prefer static hosting, mock data, and serverless consumption.
- Avoid paid dependencies unless justified.
- Avoid databases until persistence is needed.

## Performance

- The demo should feel responsive on a typical laptop and standard browser.
- Mock data pages should load quickly without network-heavy dependencies.
- Assessment generation may show a short loading state, but the first demo must not require network calls, API keys, or a paid AI service.

## Reliability

- The demo should work without external services for the first build.
- Seeded mock data should make the app resettable and predictable.
- Failure states should be represented when the app introduces mock generation or future service boundaries.

## Maintainability

- Use TypeScript.
- Keep data access behind a small boundary so mock data can later be replaced by Cosmos DB serverless.
- Keep AI evaluation behind a small boundary so mock evaluation can later be replaced by Azure OpenAI.
- Keep user-facing strings externalized.

## Accessibility

- Target WCAG 2.2 AA.
- Keyboard users and screen reader users should be supported in the first demo flows.
- Do not rely on colour alone.

## Localization

- Support `en-CA` and `fr-CA`.
- Externalize user-facing strings from the start.
- Practical first-pass Canadian French is acceptable for the weekend demo.
- The i18n structure must allow later human polishing of `fr-CA` copy.
- Use locale-aware formatting for dates, numbers, and scores.

## Security

- Mock data only.
- No secrets in source control.
- Document future production expectations for confidential business data.

## Observability

- Application Insights is not required for the first demo.
- If logging is added later, design it around privacy and minimal sensitive content.
