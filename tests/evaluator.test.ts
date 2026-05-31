import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiTools, businessCases, responsibleAiPillars } from "../lib/data";
import { DeterministicEvaluationService } from "../lib/evaluation";

const service = new DeterministicEvaluationService();
const plausibleBusinessCase = businessCases[0];

describe("DeterministicEvaluationService", () => {
  it("returns all 10 responsible AI pillar assessments", () => {
    const assessment = service.evaluate({
      businessCase: plausibleBusinessCase,
      tools: aiTools,
      pillars: responsibleAiPillars,
    });

    assert.equal(assessment.pillarAssessments.length, 10);
    assert.deepEqual(
      assessment.pillarAssessments.map((pillar) => pillar.pillarId),
      responsibleAiPillars.map((pillar) => pillar.id),
    );
  });

  it("returns stable output for the same input", () => {
    const first = service.evaluate({
      businessCase: plausibleBusinessCase,
      tools: aiTools,
      pillars: responsibleAiPillars,
    });
    const second = service.evaluate({
      businessCase: plausibleBusinessCase,
      tools: aiTools,
      pillars: responsibleAiPillars,
    });

    assert.deepEqual(first, second);
  });

  it("recommends at least one relevant tool for a plausible business case", () => {
    const assessment = service.evaluate({
      businessCase: plausibleBusinessCase,
      tools: aiTools,
      pillars: responsibleAiPillars,
    });

    assert.ok(assessment.recommendedTools.length >= 1);
    assert.ok(
      assessment.recommendedTools.some((tool) => tool.toolId === "tool-workflow-triage-copilot"),
      "expected workflow triage case to recommend the Workflow Triage Copilot",
    );
  });

  it("keeps scores in the expected 0 to 100 range", () => {
    const assessment = service.evaluate({
      businessCase: plausibleBusinessCase,
      tools: aiTools,
      pillars: responsibleAiPillars,
    });

    const scores = [
      assessment.feasibility.score.value,
      assessment.overallScore.value,
      ...assessment.recommendedTools.map((tool) => tool.fitScore.value),
      ...assessment.pillarAssessments.map((pillar) => pillar.riskScore.value),
    ];

    for (const value of scores) {
      assert.ok(value >= 0 && value <= 100, `score ${value} should be between 0 and 100`);
    }
  });
});
