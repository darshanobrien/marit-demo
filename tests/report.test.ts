import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAssessmentReportModel } from "../lib/report/businessCaseAssessmentReport";
import { aiTools, businessCases, responsibleAiPillars } from "../lib/data";
import type { BusinessCaseAssessment } from "../lib/domain/types";
import { DeterministicEvaluationService } from "../lib/evaluation";

const evaluator = new DeterministicEvaluationService();

describe("assessment report model", () => {
  it("resolves a seeded case with a generated deterministic assessment", () => {
    const model = buildModel(businessCases[0].id);

    assert.equal(model.state, "found");
    if (model.state === "found") {
      assert.equal(model.businessCase.id, businessCases[0].id);
      assert.equal(model.assessmentSource, "generated");
      assert.equal(model.assessment.businessCaseId, businessCases[0].id);
    }
  });

  it("uses a stored assessment for submitted cases", () => {
    const storedAssessment = {
      ...evaluator.evaluate({
        businessCase: businessCases[0],
        tools: aiTools,
        pillars: responsibleAiPillars,
      }),
      id: "assessment-stored",
      overallScore: {
        value: 99,
        level: "low",
        explanation: "Stored assessment should be used.",
      },
    } satisfies BusinessCaseAssessment;
    const model = buildModel(businessCases[0].id, [storedAssessment]);

    assert.equal(model.state, "found");
    if (model.state === "found") {
      assert.equal(model.assessmentSource, "stored");
      assert.equal(model.assessment.id, "assessment-stored");
      assert.equal(model.assessment.overallScore.value, 99);
    }
  });

  it("returns not found for an unknown case id", () => {
    const model = buildModel("case-missing");

    assert.deepEqual(model, {
      state: "notFound",
      businessCaseId: "case-missing",
    });
  });

  it("includes all responsible AI pillars", () => {
    const model = buildModel(businessCases[0].id);

    assert.equal(model.state, "found");
    if (model.state === "found") {
      assert.equal(model.pillarAssessments.length, 10);
      assert.deepEqual(
        model.pillarAssessments.map((pillar) => pillar.pillar?.id),
        responsibleAiPillars.map((pillar) => pillar.id),
      );
    }
  });

  it("joins recommended tools to tool metadata", () => {
    const model = buildModel(businessCases[0].id);

    assert.equal(model.state, "found");
    if (model.state === "found") {
      assert.ok(model.recommendedTools.length >= 1);
      assert.ok(model.recommendedTools.every((recommendation) => recommendation.tool));
    }
  });
});

function buildModel(businessCaseId: string, assessments: BusinessCaseAssessment[] = []) {
  return buildAssessmentReportModel({
    businessCaseId,
    businessCases,
    assessments,
    evaluator,
    tools: aiTools,
    pillars: responsibleAiPillars,
  });
}
