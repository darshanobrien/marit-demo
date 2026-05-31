# Localization

## Supported Locales

- `en-CA`: Canadian English.
- `fr-CA`: Canadian French.

## Requirements

- Externalize all user-facing strings.
- Do not hard-code UI copy inside components.
- Do not concatenate translated fragments unless grammar is safe in both languages.
- Use locale-aware formatting for dates, numbers, percentages, and scores.
- Store locale-specific route, metadata, or content decisions explicitly if introduced later.

## Canadian French Guidance

- Use clear, professional Canadian French.
- Prefer terminology familiar to Quebec business users.
- Avoid overly literal translations.
- Practical first-pass Canadian French is acceptable for the weekend demo.
- Keep resources easy to polish later with a fluent reviewer.

## Content Types to Localize

- Navigation.
- Form labels, help text, and validation.
- Status labels.
- Risk labels.
- Report section headings.
- Empty, loading, and error states.
- Buttons and tooltips.
- AI-generated report labels.

## Data and AI Output

For the first demo, seeded mock report text should be generated from localized templates or authored separately for each locale. Avoid machine-translating at runtime unless that is specifically requested.

## Implementation Direction

The app should introduce localization before major UI screens so string externalization is the default pattern.
