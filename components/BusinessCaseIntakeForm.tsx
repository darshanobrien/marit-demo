"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { Dictionary, ShellPageKey } from "@/lib/i18n/dictionaries";
import {
  businessAreaOptions,
  createBusinessCaseFromIntake,
  dataSensitivityOptions,
  emptyIntakeFormValues,
  expectedBenefitOptions,
  sampleIntakeFormValues,
  urgencyOptions,
  validateIntakeForm,
  type IntakeField,
  type IntakeFormValues,
  type IntakeValidationError,
} from "@/lib/intake/businessCaseIntake";
import { aiTools, responsibleAiPillars } from "@/lib/data";
import { createLocalStorageBusinessCaseRepository } from "@/lib/data/mockBusinessCaseRepository";
import { DeterministicEvaluationService } from "@/lib/evaluation";

type BusinessCaseIntakeFormProps = {
  dictionary: Dictionary;
  onNavigate: (page: ShellPageKey) => void;
};

const submitterUserId = "user-business-operations";

export function BusinessCaseIntakeForm({ dictionary, onNavigate }: BusinessCaseIntakeFormProps) {
  const [values, setValues] = useState<IntakeFormValues>(emptyIntakeFormValues);
  const [errors, setErrors] = useState<IntakeValidationError[]>([]);
  const [sampleLoaded, setSampleLoaded] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState<string | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const evaluator = useMemo(() => new DeterministicEvaluationService(), []);
  const intake = dictionary.intake;

  const errorsByField = useMemo(() => {
    return errors.reduce<Partial<Record<IntakeField, IntakeValidationError[]>>>((acc, error) => {
      acc[error.field] = [...(acc[error.field] ?? []), error];
      return acc;
    }, {});
  }, [errors]);

  if (submittedTitle) {
    return (
      <Card className="success-panel">
        <div className="success-panel__content">
          <Badge variant="status">{intake.success.readyBadge}</Badge>
          <h2>{intake.success.title}</h2>
          <p className="muted">{intake.success.description}</p>
          <p className="muted">
            <strong>{submittedTitle}</strong>
          </p>
          <p>{intake.success.assessmentReady}</p>
          <div className="actions">
            <Button
              onClick={() => {
                setSubmittedTitle(null);
                setValues(emptyIntakeFormValues);
                setErrors([]);
                setSampleLoaded(false);
              }}
            >
              {intake.actions.submitAnother}
            </Button>
            <Button onClick={() => onNavigate("dashboard")} variant="secondary">
              {intake.actions.viewRequests}
            </Button>
            <Button onClick={() => onNavigate("assessments")} variant="secondary">
              {intake.actions.viewAssessments}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  function updateTextField(field: IntakeField, nextValue: string) {
    setValues((current) => ({ ...current, [field]: nextValue }));
    clearFieldErrors(field);
  }

  function updateSingleChoice(field: "businessArea" | "urgency", nextValue: string) {
    setValues((current) => ({ ...current, [field]: nextValue }));
    clearFieldErrors(field);
  }

  function toggleArrayValue<T extends string>(
    field: "dataSensitivity" | "expectedBenefits",
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
  }

  function clearFieldErrors(field: IntakeField) {
    setErrors((current) => current.filter((error) => error.field !== field));
  }

  function loadSampleRequest() {
    setValues(sampleIntakeFormValues);
    setErrors([]);
    setSampleLoaded(true);
  }

  function clearForm() {
    setValues(emptyIntakeFormValues);
    setErrors([]);
    setSampleLoaded(false);
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateIntakeForm(values);
    setErrors(nextErrors);
    setSampleLoaded(false);

    if (nextErrors.length > 0) {
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    const now = new Date().toISOString();
    const businessCase = createBusinessCaseFromIntake(values, {
      id: `case-${Date.now()}`,
      now,
      submitterUserId,
    });
    const assessment = evaluator.evaluate({
      businessCase,
      tools: aiTools,
      pillars: responsibleAiPillars,
    });

    createLocalStorageBusinessCaseRepository(window.localStorage).saveBusinessCaseWithAssessment(
      businessCase,
      assessment,
    );
    setSubmittedTitle(businessCase.title);
  }

  return (
    <form className="intake-form" noValidate onSubmit={submitForm}>
      <section className="demo-warning" aria-labelledby="demo-warning-title">
        <div className="demo-warning__label">{dictionary.badges.mockData}</div>
        <div>
          <h2 id="demo-warning-title">{intake.warningTitle}</h2>
          <p>{intake.warningBody}</p>
        </div>
      </section>

      {sampleLoaded ? (
        <p className="form-notice" role="status">
          {intake.sampleNotice}
        </p>
      ) : null}

      {errors.length > 0 ? (
        <div
          ref={errorSummaryRef}
          aria-labelledby="error-summary-title"
          className="error-summary"
          role="alert"
          tabIndex={-1}
        >
          <h2 id="error-summary-title">{intake.validation.summaryTitle}</h2>
          <p>{intake.validation.summaryIntro}</p>
          <ul>
            {errors.map((error) => (
              <li key={`${error.field}-${error.code}`}>
                <a href={`#field-${error.field}`}>{validationMessage(error, dictionary)}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="form-toolbar">
        <Button onClick={loadSampleRequest} variant="secondary">
          {intake.actions.loadSample}
        </Button>
        <Button onClick={clearForm} variant="secondary">
          {intake.actions.clearForm}
        </Button>
      </div>

      <Card className="form-section">
        <h2>{intake.sections.overview}</h2>
        <div className="form-grid form-grid--two">
          {renderTextInput({
            field: "title",
            values,
            dictionary,
            errorsByField,
            onChange: updateTextField,
          })}

          <label className="form-field" htmlFor="field-businessArea">
            {fieldLabel("businessArea", dictionary)}
            {renderHelp("businessArea", dictionary)}
            <select
              aria-describedby={describedBy("businessArea", dictionary, errorsByField)}
              aria-invalid={Boolean(errorsByField.businessArea)}
              className="select form-control"
              id="field-businessArea"
              onChange={(event) => updateSingleChoice("businessArea", event.target.value)}
              required
              value={values.businessArea}
            >
              <option value="">{intake.fields.businessArea.label}</option>
              {businessAreaOptions.map((option) => (
                <option key={option} value={option}>
                  {intake.businessAreas[option]}
                </option>
              ))}
            </select>
            {renderFieldErrors("businessArea", dictionary, errorsByField)}
          </label>
        </div>

        {renderTextarea({
          field: "painPoint",
          values,
          dictionary,
          errorsByField,
          onChange: updateTextField,
          rows: 5,
        })}

        {renderTextarea({
          field: "desiredOutcome",
          values,
          dictionary,
          errorsByField,
          onChange: updateTextField,
          rows: 4,
        })}
      </Card>

      <Card className="form-section">
        <h2>{intake.sections.context}</h2>
        {renderTextarea({
          field: "currentProcess",
          values,
          dictionary,
          errorsByField,
          onChange: updateTextField,
          rows: 4,
        })}
        <div className="form-grid form-grid--two">
          {renderTextInput({
            field: "affectedPeople",
            values,
            dictionary,
            errorsByField,
            onChange: updateTextField,
          })}
          {renderTextInput({
            field: "estimatedVolume",
            values,
            dictionary,
            errorsByField,
            onChange: updateTextField,
          })}
        </div>
      </Card>

      <Card className="form-section">
        <h2>{intake.sections.dataRisk}</h2>
        {renderTextarea({
          field: "dataInvolved",
          values,
          dictionary,
          errorsByField,
          onChange: updateTextField,
          rows: 4,
        })}
        <fieldset
          aria-describedby={describedBy("dataSensitivity", dictionary, errorsByField)}
          aria-invalid={Boolean(errorsByField.dataSensitivity)}
          className="choice-field"
          id="field-dataSensitivity"
        >
          <legend>{fieldLabel("dataSensitivity", dictionary)}</legend>
          {renderHelp("dataSensitivity", dictionary)}
          <div className="checkbox-grid">
            {dataSensitivityOptions.map((option) => (
              <label className="checkbox-option" key={option}>
                <input
                  checked={values.dataSensitivity.includes(option)}
                  onChange={(event) =>
                    toggleArrayValue("dataSensitivity", option, event.target.checked)
                  }
                  type="checkbox"
                />
                <span>{intake.dataSensitivity[option]}</span>
              </label>
            ))}
          </div>
          {renderFieldErrors("dataSensitivity", dictionary, errorsByField)}
        </fieldset>
        {renderTextInput({
          field: "currentTools",
          values,
          dictionary,
          errorsByField,
          onChange: updateTextField,
        })}
      </Card>

      <Card className="form-section">
        <h2>{intake.sections.value}</h2>
        <label className="form-field" htmlFor="field-urgency">
          {fieldLabel("urgency", dictionary)}
          {renderHelp("urgency", dictionary)}
          <select
            aria-describedby={describedBy("urgency", dictionary, errorsByField)}
            aria-invalid={Boolean(errorsByField.urgency)}
            className="select form-control"
            id="field-urgency"
            onChange={(event) => updateSingleChoice("urgency", event.target.value)}
            required
            value={values.urgency}
          >
            <option value="">{intake.fields.urgency.label}</option>
            {urgencyOptions.map((option) => (
              <option key={option} value={option}>
                {intake.urgency[option]}
              </option>
            ))}
          </select>
          {renderFieldErrors("urgency", dictionary, errorsByField)}
        </label>

        <fieldset
          aria-describedby={describedBy("expectedBenefits", dictionary, errorsByField)}
          aria-invalid={Boolean(errorsByField.expectedBenefits)}
          className="choice-field"
          id="field-expectedBenefits"
        >
          <legend>{fieldLabel("expectedBenefits", dictionary)}</legend>
          {renderHelp("expectedBenefits", dictionary)}
          <div className="checkbox-grid">
            {expectedBenefitOptions.map((option) => (
              <label className="checkbox-option" key={option}>
                <input
                  checked={values.expectedBenefits.includes(option)}
                  onChange={(event) =>
                    toggleArrayValue("expectedBenefits", option, event.target.checked)
                  }
                  type="checkbox"
                />
                <span>{intake.expectedBenefits[option]}</span>
              </label>
            ))}
          </div>
          {renderFieldErrors("expectedBenefits", dictionary, errorsByField)}
        </fieldset>
      </Card>

      <Card className="form-section">
        <h2>{intake.sections.review}</h2>
        {renderTextarea({
          field: "constraints",
          values,
          dictionary,
          errorsByField,
          onChange: updateTextField,
          rows: 4,
        })}
        {renderTextarea({
          field: "imaginedAiSolution",
          values,
          dictionary,
          errorsByField,
          onChange: updateTextField,
          rows: 4,
        })}
        <div className="form-submit-row">
          <Button type="submit">{intake.actions.submit}</Button>
        </div>
      </Card>
    </form>
  );
}

function renderTextInput({
  field,
  values,
  dictionary,
  errorsByField,
  onChange,
}: {
  field: IntakeField;
  values: IntakeFormValues;
  dictionary: Dictionary;
  errorsByField: Partial<Record<IntakeField, IntakeValidationError[]>>;
  onChange: (field: IntakeField, value: string) => void;
}) {
  const inputValue = values[field];

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
        placeholder={dictionary.intake.fields[field].placeholder}
        type="text"
        value={typeof inputValue === "string" ? inputValue : ""}
      />
      {renderFieldErrors(field, dictionary, errorsByField)}
    </label>
  );
}

function renderTextarea({
  field,
  values,
  dictionary,
  errorsByField,
  onChange,
  rows,
}: {
  field: IntakeField;
  values: IntakeFormValues;
  dictionary: Dictionary;
  errorsByField: Partial<Record<IntakeField, IntakeValidationError[]>>;
  onChange: (field: IntakeField, value: string) => void;
  rows: number;
}) {
  const inputValue = values[field];

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
        placeholder={dictionary.intake.fields[field].placeholder}
        rows={rows}
        value={typeof inputValue === "string" ? inputValue : ""}
      />
      {renderFieldErrors(field, dictionary, errorsByField)}
    </label>
  );
}

function fieldLabel(field: IntakeField, dictionary: Dictionary) {
  return (
    <span className="form-label">
      {dictionary.intake.fields[field].label}
      {requiredFields.has(field) ? (
        <span className="required-label"> {dictionary.intake.requiredIndicator}</span>
      ) : null}
    </span>
  );
}

function renderHelp(field: IntakeField, dictionary: Dictionary) {
  const help = dictionary.intake.fields[field].help;

  return help ? (
    <span className="field-help" id={`field-${field}-help`}>
      {help}
    </span>
  ) : null;
}

function renderFieldErrors(
  field: IntakeField,
  dictionary: Dictionary,
  errorsByField: Partial<Record<IntakeField, IntakeValidationError[]>>,
) {
  const fieldErrors = errorsByField[field];

  if (!fieldErrors?.length) {
    return null;
  }

  return (
    <span className="field-error" id={`field-${field}-error`}>
      {fieldErrors.map((error) => validationMessage(error, dictionary)).join(" ")}
    </span>
  );
}

function describedBy(
  field: IntakeField,
  dictionary: Dictionary,
  errorsByField: Partial<Record<IntakeField, IntakeValidationError[]>>,
) {
  return [
    dictionary.intake.fields[field].help ? `field-${field}-help` : "",
    errorsByField[field]?.length ? `field-${field}-error` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function validationMessage(error: IntakeValidationError, dictionary: Dictionary): string {
  const field = dictionary.intake.fields[error.field].label;
  return dictionary.intake.validation[error.code]
    .replace("{field}", field)
    .replace("{min}", String(error.min ?? ""));
}

const requiredFields = new Set<IntakeField>([
  "title",
  "businessArea",
  "painPoint",
  "desiredOutcome",
  "affectedPeople",
  "dataInvolved",
  "dataSensitivity",
  "urgency",
  "expectedBenefits",
]);
