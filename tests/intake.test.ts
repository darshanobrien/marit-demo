import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createBusinessCaseFromIntake,
  emptyIntakeFormValues,
  mapIntakeDataSensitivity,
  sampleIntakeFormValues,
  validateIntakeForm,
} from "../lib/intake/businessCaseIntake";

describe("business case intake validation", () => {
  it("requires all mandatory intake fields", () => {
    const errors = validateIntakeForm(emptyIntakeFormValues);

    assert.deepEqual(
      errors.map((error) => error.field),
      [
        "title",
        "businessArea",
        "painPoint",
        "desiredOutcome",
        "affectedPeople",
        "dataInvolved",
        "dataSensitivity",
        "urgency",
        "expectedBenefits",
      ],
    );
  });

  it("enforces minimum pain point and desired outcome lengths", () => {
    const errors = validateIntakeForm({
      ...sampleIntakeFormValues,
      painPoint: "Too short",
      desiredOutcome: "Also short",
    });

    assert.ok(errors.some((error) => error.field === "painPoint" && error.code === "minLength"));
    assert.ok(
      errors.some((error) => error.field === "desiredOutcome" && error.code === "minLength"),
    );
  });

  it("accepts the sample request", () => {
    assert.deepEqual(validateIntakeForm(sampleIntakeFormValues), []);
  });
});

describe("business case intake mapping", () => {
  it("maps high-risk sensitivity selections to evaluator sensitivity", () => {
    assert.equal(mapIntakeDataSensitivity(["public"]), "low");
    assert.equal(mapIntakeDataSensitivity(["confidential"]), "medium");
    assert.equal(mapIntakeDataSensitivity(["restricted"]), "high");
    assert.equal(mapIntakeDataSensitivity(["pii"]), "high");
    assert.equal(mapIntakeDataSensitivity(["unknown", "public"]), "unknown");
  });

  it("creates a ready business case compatible with the evaluator", () => {
    const businessCase = createBusinessCaseFromIntake(sampleIntakeFormValues, {
      id: "case-test",
      now: "2026-05-30T12:00:00.000Z",
      submitterUserId: "user-business-operations",
    });

    assert.equal(businessCase.id, "case-test");
    assert.equal(businessCase.status, "ready");
    assert.equal(businessCase.urgency, "high");
    assert.equal(businessCase.urgencySelection, "high");
    assert.equal(businessCase.dataSensitivity, "low");
    assert.deepEqual(businessCase.knownDataSources, [
      "Fictional request summaries",
      "synthetic routing guidelines",
      "synthetic topic labels",
      "and sample status history.",
    ]);
  });
});
