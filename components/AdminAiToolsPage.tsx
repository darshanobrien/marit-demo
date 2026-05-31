"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  aiToolDataSensitivityOptions,
  aiToolDeploymentModelOptions,
  aiToolCapabilityOptions,
  aiToolInputTypeOptions,
  aiToolIntegrationOptionOptions,
  aiToolOutputTypeOptions,
  aiToolStatusOptions,
  createAIToolFromForm,
  emptyAIToolFormValues,
  validateAIToolForm,
  type AIToolFormField,
  type AIToolFormValues,
  type AIToolValidationError,
} from "@/lib/admin/aiToolManagement";
import { aiTools } from "@/lib/data";
import { createLocalStorageAIToolRepository } from "@/lib/data/mockAiToolRepository";
import type {
  AITool,
} from "@/lib/domain/types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

type AdminAiToolsPageProps = {
  dictionary: Dictionary;
  locale: Locale;
  onBackToDashboard: () => void;
};

export function AdminAiToolsPage({
  dictionary,
  locale,
  onBackToDashboard,
}: AdminAiToolsPageProps) {
  const admin = dictionary.adminTools;
  const [tools, setTools] = useState<AITool[]>(aiTools);
  const [values, setValues] = useState<AIToolFormValues>(emptyAIToolFormValues);
  const [errors, setErrors] = useState<AIToolValidationError[]>([]);
  const [savedToolName, setSavedToolName] = useState<string | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const errorsByField = useMemo(() => {
    return errors.reduce<Partial<Record<AIToolFormField, AIToolValidationError[]>>>(
      (acc, error) => {
        acc[error.field] = [...(acc[error.field] ?? []), error];
        return acc;
      },
      {},
    );
  }, [errors]);

  useEffect(() => {
    setTools(createLocalStorageAIToolRepository(window.localStorage).listTools());
  }, []);

  function updateTextField(field: AIToolFormField, nextValue: string) {
    setValues((current) => ({ ...current, [field]: nextValue }));
    clearFieldErrors(field);
    setSavedToolName(null);
  }

  function updateBooleanField(field: "requiresHumanReview" | "supportsEnglish" | "supportsFrench", checked: boolean) {
    setValues((current) => ({ ...current, [field]: checked }));
    clearFieldErrors(field);
    if (field === "supportsEnglish" || field === "supportsFrench") {
      clearFieldErrors("supportsEnglish");
    }
    setSavedToolName(null);
  }

  function updateSingleChoice(field: "deploymentModel" | "status", nextValue: string) {
    setValues((current) => ({ ...current, [field]: nextValue }));
    clearFieldErrors(field);
    setSavedToolName(null);
  }

  function toggleArrayValue<T extends string>(
    field:
      | "supportedInputTypes"
      | "supportedOutputTypes"
      | "capabilities"
      | "dataSensitivitySuitability"
      | "integrationOptions",
    option: T,
    checked: boolean,
  ) {
    setValues((current) => {
      const currentValues = current[field] as T[];
      return {
        ...current,
        [field]: checked
          ? [...currentValues, option]
          : currentValues.filter((value) => value !== option),
      };
    });
    clearFieldErrors(field);
    setSavedToolName(null);
  }

  function clearFieldErrors(field: AIToolFormField) {
    setErrors((current) => current.filter((error) => error.field !== field));
  }

  function clearForm() {
    setValues(emptyAIToolFormValues);
    setErrors([]);
    setSavedToolName(null);
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateAIToolForm(values);
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    const tool = createAIToolFromForm(values, {
      id: `tool-${slugify(values.name)}-${Date.now()}`,
    });
    const repository = createLocalStorageAIToolRepository(window.localStorage);
    repository.saveTool(tool);
    setTools(repository.listTools());
    setValues(emptyAIToolFormValues);
    setSavedToolName(tool.name);
  }

  return (
    <div className="admin-tools">
      <section className="dashboard-intro" aria-labelledby="admin-tools-summary-title">
        <div>
          <h2 id="admin-tools-summary-title">{admin.summaryTitle}</h2>
          <p>{admin.summaryBody}</p>
        </div>
        <Button onClick={onBackToDashboard} variant="secondary">
          {admin.actions.backToDashboard}
        </Button>
      </section>

      {savedToolName ? (
        <p className="form-notice" role="status">
          {admin.savedNotice} <strong>{savedToolName}</strong>
        </p>
      ) : null}

      <Card className="admin-tools-list">
        <div className="dashboard-list__header">
          <h2>{admin.listTitle}</h2>
          <p className="muted">{admin.tableCaption}</p>
        </div>
        <div className="table-scroll">
          <table className="case-table ai-tools-table">
            <caption>{admin.tableCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{admin.columns.tool}</th>
                <th scope="col">{admin.columns.provider}</th>
                <th scope="col">{admin.columns.status}</th>
                <th scope="col">{admin.columns.deployment}</th>
                <th scope="col">{admin.columns.dataSensitivity}</th>
                <th scope="col">{admin.columns.humanReview}</th>
                <th scope="col">{admin.columns.lastReviewed}</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id}>
                  <td data-label={admin.columns.tool}>
                    <span className="case-table__title">{tool.name}</span>
                    <span className="case-table__meta">{tool.shortDescription}</span>
                    <span className="case-table__meta">
                      {admin.labels.useCases}: {formatList(tool.suitableUseCases, admin.labels.noItems)}
                    </span>
                    <span className="case-table__meta">
                      {admin.fields.capabilities.label}: {formatList(displayCapabilities(tool, admin), admin.labels.noItems)}
                    </span>
                    <span className="case-table__meta">
                      {admin.labels.inputs}: {formatList(displayInputTypes(tool, admin), admin.labels.noItems)}
                    </span>
                    <span className="case-table__meta">
                      {admin.labels.outputs}: {formatList(displayOutputTypes(tool, admin), admin.labels.noItems)}
                    </span>
                  </td>
                  <td data-label={admin.columns.provider}>{tool.provider}</td>
                  <td data-label={admin.columns.status}>
                    <Badge variant="status">{admin.statuses[tool.status]}</Badge>
                  </td>
                  <td data-label={admin.columns.deployment}>
                    {displayDeploymentModel(tool, admin)}
                    <span className="case-table__meta">
                      {admin.labels.integrations}: {formatList(displayIntegrationOptions(tool, admin), admin.labels.noItems)}
                    </span>
                  </td>
                  <td data-label={admin.columns.dataSensitivity}>
                    {formatList(
                      tool.dataSensitivitySuitability.map((item) => admin.dataSensitivitySuitability[item]),
                      admin.labels.noItems,
                    )}
                  </td>
                  <td data-label={admin.columns.humanReview}>
                    {tool.riskProfile.requiresHumanReview
                      ? admin.reviewRequirement.required
                      : admin.reviewRequirement.notRequired}
                    <span className="case-table__meta">
                      {admin.labels.languages}: {formatLanguages(tool, admin)}
                    </span>
                  </td>
                  <td data-label={admin.columns.lastReviewed}>{formatDate(tool.lastReviewedAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <form className="intake-form" noValidate onSubmit={submitForm}>
        <Card className="form-section">
          <div>
            <h2>{admin.formTitle}</h2>
            <p className="muted">{admin.formDescription}</p>
          </div>

          {errors.length > 0 ? (
            <div
              ref={errorSummaryRef}
              aria-labelledby="ai-tool-error-summary-title"
              className="error-summary"
              role="alert"
              tabIndex={-1}
            >
              <h2 id="ai-tool-error-summary-title">{admin.validation.summaryTitle}</h2>
              <p>{admin.validation.summaryIntro}</p>
              <ul>
                {errors.map((error) => (
                  <li key={`${error.field}-${error.code}`}>
                    <a href={`#field-${error.field}`}>{validationMessage(error, dictionary)}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="form-grid form-grid--two">
            {renderTextInput({ field: "name", values, dictionary, errorsByField, onChange: updateTextField })}
            {renderTextInput({ field: "provider", values, dictionary, errorsByField, onChange: updateTextField })}
          </div>

          {renderTextArea({ field: "shortDescription", values, dictionary, errorsByField, onChange: updateTextField })}
          {renderCheckboxGroup({
            field: "capabilities",
            values: values.capabilities,
            dictionary,
            errorsByField,
            options: aiToolCapabilityOptions,
            labels: dictionary.adminTools.capabilities,
            onChange: toggleArrayValue,
          })}
          {renderTextArea({ field: "suitableUseCases", values, dictionary, errorsByField, onChange: updateTextField })}

          <div className="form-grid form-grid--two">
            {renderCheckboxGroup({
              field: "supportedInputTypes",
              values: values.supportedInputTypes,
              dictionary,
              errorsByField,
              options: aiToolInputTypeOptions,
              labels: dictionary.adminTools.inputTypes,
              onChange: toggleArrayValue,
            })}
            {renderCheckboxGroup({
              field: "supportedOutputTypes",
              values: values.supportedOutputTypes,
              dictionary,
              errorsByField,
              options: aiToolOutputTypeOptions,
              labels: dictionary.adminTools.outputTypes,
              onChange: toggleArrayValue,
            })}
          </div>

          <div className="form-grid form-grid--two">
            <label className="form-field" htmlFor="field-deploymentModel">
              {fieldLabel("deploymentModel", dictionary)}
              <select
                aria-describedby={describedBy("deploymentModel", dictionary, errorsByField)}
                aria-invalid={Boolean(errorsByField.deploymentModel)}
                className="select form-control"
                id="field-deploymentModel"
                onChange={(event) => updateSingleChoice("deploymentModel", event.target.value)}
                required
                value={values.deploymentModel}
              >
                <option value=""></option>
                {aiToolDeploymentModelOptions.map((option) => (
                  <option key={option} value={option}>
                    {dictionary.adminTools.deploymentModels[option]}
                  </option>
                ))}
              </select>
              {renderFieldError("deploymentModel", dictionary, errorsByField)}
            </label>

            <label className="form-field" htmlFor="field-status">
              {fieldLabel("status", dictionary)}
              <select
                aria-describedby={describedBy("status", dictionary, errorsByField)}
                aria-invalid={Boolean(errorsByField.status)}
                className="select form-control"
                id="field-status"
                onChange={(event) => updateSingleChoice("status", event.target.value)}
                required
                value={values.status}
              >
                <option value=""></option>
                {aiToolStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {dictionary.adminTools.statuses[option]}
                  </option>
                ))}
              </select>
              {renderFieldError("status", dictionary, errorsByField)}
            </label>
          </div>

          <div className="form-grid form-grid--two">
            {renderCheckboxGroup({
              field: "dataSensitivitySuitability",
              values: values.dataSensitivitySuitability,
              dictionary,
              errorsByField,
              options: aiToolDataSensitivityOptions,
              labels: dictionary.adminTools.dataSensitivitySuitability,
              onChange: toggleArrayValue,
            })}
            {renderCheckboxGroup({
              field: "integrationOptions",
              values: values.integrationOptions,
              dictionary,
              errorsByField,
              options: aiToolIntegrationOptionOptions,
              labels: dictionary.adminTools.integrationOptions,
              onChange: toggleArrayValue,
            })}
          </div>

          <div className="form-grid form-grid--two">
            <fieldset className="choice-field">
              <legend>{fieldLabel("requiresHumanReview", dictionary)}</legend>
              {renderHelp("requiresHumanReview", dictionary)}
              <label className="checkbox-option" htmlFor="field-requiresHumanReview">
                <input
                  checked={values.requiresHumanReview}
                  id="field-requiresHumanReview"
                  onChange={(event) => updateBooleanField("requiresHumanReview", event.target.checked)}
                  type="checkbox"
                />
                <span>{dictionary.adminTools.reviewRequirement.required}</span>
              </label>
            </fieldset>

            <fieldset
              aria-describedby={describedBy("supportsEnglish", dictionary, errorsByField)}
              aria-invalid={Boolean(errorsByField.supportsEnglish)}
              className="choice-field"
            >
              <legend>{dictionary.adminTools.labels.languages}</legend>
              <div className="checkbox-grid">
                <label className="checkbox-option" htmlFor="field-supportsEnglish">
                  <input
                    checked={values.supportsEnglish}
                    id="field-supportsEnglish"
                    onChange={(event) => updateBooleanField("supportsEnglish", event.target.checked)}
                    type="checkbox"
                  />
                  <span>{dictionary.adminTools.labels.english}</span>
                </label>
                <label className="checkbox-option" htmlFor="field-supportsFrench">
                  <input
                    checked={values.supportsFrench}
                    id="field-supportsFrench"
                    onChange={(event) => updateBooleanField("supportsFrench", event.target.checked)}
                    type="checkbox"
                  />
                  <span>{dictionary.adminTools.labels.french}</span>
                </label>
              </div>
              {renderFieldError("supportsEnglish", dictionary, errorsByField)}
            </fieldset>
          </div>

          <div className="form-grid form-grid--two">
            {renderTextArea({ field: "accessibilityConsiderations", values, dictionary, errorsByField, onChange: updateTextField })}
            {renderTextArea({ field: "responsibleAiNotes", values, dictionary, errorsByField, onChange: updateTextField })}
          </div>

          <div className="form-grid form-grid--two">
            {renderTextArea({ field: "securityPrivacyNotes", values, dictionary, errorsByField, onChange: updateTextField })}
            {renderTextInput({
              field: "lastReviewedAt",
              values,
              dictionary,
              errorsByField,
              onChange: updateTextField,
            })}
          </div>

          <div className="form-submit-row">
            <Button type="submit">{admin.actions.save}</Button>
            <Button onClick={clearForm} variant="secondary">
              {admin.actions.clear}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

function renderTextInput({
  field,
  values,
  dictionary,
  errorsByField,
  onChange,
  type = "text",
}: {
  field: AIToolFormField;
  values: AIToolFormValues;
  dictionary: Dictionary;
  errorsByField: Partial<Record<AIToolFormField, AIToolValidationError[]>>;
  onChange: (field: AIToolFormField, nextValue: string) => void;
  type?: string;
}) {
  return (
    <label className="form-field" htmlFor={`field-${field}`}>
      {fieldLabel(field, dictionary)}
      {renderHelp(field, dictionary)}
      <input
        aria-describedby={describedBy(field, dictionary, errorsByField)}
        aria-invalid={Boolean(errorsByField[field])}
        className="form-control"
        id={`field-${field}`}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={dictionary.adminTools.fields[field].placeholder}
        required
        type={type}
        value={String(values[field])}
      />
      {renderFieldError(field, dictionary, errorsByField)}
    </label>
  );
}

function renderTextArea({
  field,
  values,
  dictionary,
  errorsByField,
  onChange,
}: {
  field: AIToolFormField;
  values: AIToolFormValues;
  dictionary: Dictionary;
  errorsByField: Partial<Record<AIToolFormField, AIToolValidationError[]>>;
  onChange: (field: AIToolFormField, nextValue: string) => void;
}) {
  return (
    <label className="form-field" htmlFor={`field-${field}`}>
      {fieldLabel(field, dictionary)}
      {renderHelp(field, dictionary)}
      <textarea
        aria-describedby={describedBy(field, dictionary, errorsByField)}
        aria-invalid={Boolean(errorsByField[field])}
        className="form-control"
        id={`field-${field}`}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={dictionary.adminTools.fields[field].placeholder}
        required
        rows={3}
        value={String(values[field])}
      />
      {renderFieldError(field, dictionary, errorsByField)}
    </label>
  );
}

function renderCheckboxGroup<T extends string>({
  field,
  values,
  dictionary,
  errorsByField,
  options,
  labels,
  onChange,
}: {
  field:
    | "supportedInputTypes"
    | "supportedOutputTypes"
    | "capabilities"
    | "dataSensitivitySuitability"
    | "integrationOptions";
  values: T[];
  dictionary: Dictionary;
  errorsByField: Partial<Record<AIToolFormField, AIToolValidationError[]>>;
  options: T[];
  labels: Record<T, string>;
  onChange: (
    field:
      | "supportedInputTypes"
      | "supportedOutputTypes"
      | "capabilities"
      | "dataSensitivitySuitability"
      | "integrationOptions",
    option: T,
    checked: boolean,
  ) => void;
}) {
  return (
    <fieldset
      aria-describedby={describedBy(field, dictionary, errorsByField)}
      aria-invalid={Boolean(errorsByField[field])}
      className="choice-field"
      id={`field-${field}`}
    >
      <legend>{fieldLabel(field, dictionary)}</legend>
      <div className="checkbox-grid">
        {options.map((option) => (
          <label className="checkbox-option" htmlFor={`field-${field}-${option}`} key={option}>
            <input
              checked={values.includes(option)}
              id={`field-${field}-${option}`}
              onChange={(event) => onChange(field, option, event.target.checked)}
              type="checkbox"
            />
            <span>{labels[option]}</span>
          </label>
        ))}
      </div>
      {renderFieldError(field, dictionary, errorsByField)}
    </fieldset>
  );
}

function fieldLabel(field: AIToolFormField, dictionary: Dictionary) {
  return (
    <span className="form-label">
      {dictionary.adminTools.fields[field].label}{" "}
      <span className="required-label">({dictionary.intake.requiredIndicator})</span>
    </span>
  );
}

function renderHelp(field: AIToolFormField, dictionary: Dictionary) {
  const help = dictionary.adminTools.fields[field].help;

  return help ? (
    <span className="field-help" id={`help-${field}`}>
      {help}
    </span>
  ) : null;
}

function describedBy(
  field: AIToolFormField,
  dictionary: Dictionary,
  errorsByField: Partial<Record<AIToolFormField, AIToolValidationError[]>>,
) {
  const ids = [];

  if (dictionary.adminTools.fields[field].help) {
    ids.push(`help-${field}`);
  }

  if (errorsByField[field]) {
    ids.push(`error-${field}`);
  }

  return ids.length > 0 ? ids.join(" ") : undefined;
}

function renderFieldError(
  field: AIToolFormField,
  dictionary: Dictionary,
  errorsByField: Partial<Record<AIToolFormField, AIToolValidationError[]>>,
) {
  const error = errorsByField[field]?.[0];

  return error ? (
    <span className="field-error" id={`error-${field}`}>
      {validationMessage(error, dictionary)}
    </span>
  ) : null;
}

function validationMessage(error: AIToolValidationError, dictionary: Dictionary): string {
  const fieldLabelText = dictionary.adminTools.fields[error.field].label;
  const template = dictionary.adminTools.validation[error.code];

  return template.replace("{field}", fieldLabelText);
}

function formatList(values: string[], emptyLabel: string): string {
  return values.length > 0 ? values.join(", ") : emptyLabel;
}

function displayCapabilities(tool: AITool, admin: Dictionary["adminTools"]): string[] {
  return tool.catalogueMetadata?.capabilities ?? tool.capabilities.map((item) => admin.capabilities[item]);
}

function displayInputTypes(tool: AITool, admin: Dictionary["adminTools"]): string[] {
  return tool.catalogueMetadata?.supportedInputTypes ?? tool.supportedInputTypes.map((item) => admin.inputTypes[item]);
}

function displayOutputTypes(tool: AITool, admin: Dictionary["adminTools"]): string[] {
  return tool.catalogueMetadata?.supportedOutputTypes ?? tool.supportedOutputTypes.map((item) => admin.outputTypes[item]);
}

function displayDeploymentModel(tool: AITool, admin: Dictionary["adminTools"]): string {
  return tool.catalogueMetadata?.deploymentModel ?? admin.deploymentModels[tool.deploymentModel];
}

function displayIntegrationOptions(tool: AITool, admin: Dictionary["adminTools"]): string[] {
  return tool.catalogueMetadata?.integrationOptions ?? tool.integrationOptions.map((item) => admin.integrationOptions[item]);
}

function formatLanguages(tool: AITool, admin: Dictionary["adminTools"]): string {
  return formatList(
    [
      tool.supportedLanguages.english ? admin.labels.english : "",
      tool.supportedLanguages.french ? admin.labels.french : "",
    ].filter(Boolean),
    admin.labels.noItems,
  );
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "ai-tool";
}
