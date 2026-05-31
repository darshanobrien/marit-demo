import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiTools, businessCases, responsibleAiPillars } from "../lib/data";
import type { BusinessCaseAssessment } from "../lib/domain/types";
import { DeterministicEvaluationService } from "../lib/evaluation";

const service = new DeterministicEvaluationService();
const plausibleBusinessCase = businessCases[0];
const bannedAssessmentPhrases = [
  ["weekend", "demo"].join(" "),
  ["demo", "scoring"].join(" "),
  ["deterministic", "demo", "scoring"].join(" "),
  ["the", "demo", "keeps"].join(" "),
  ["limited", "to", "mock", "data", "until", "approved"].join(" "),
  ["production", "use", "would", "need", "stronger", "evidence"].join(" "),
];

function assessmentText(assessment: BusinessCaseAssessment): string {
  return JSON.stringify(assessment).toLowerCase();
}

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

  it("does not include banned demo wording in generated assessment content", () => {
    for (const businessCase of businessCases) {
      const assessment = service.evaluate({
        businessCase,
        tools: aiTools,
        pillars: responsibleAiPillars,
      });
      const text = assessmentText(assessment);

      for (const phrase of bannedAssessmentPhrases) {
        assert.equal(text.includes(phrase), false, `${businessCase.id} should not include "${phrase}"`);
      }
    }
  });

  it("returns richer pillar content for every seeded business case", () => {
    for (const businessCase of businessCases) {
      const assessment = service.evaluate({
        businessCase,
        tools: aiTools,
        pillars: responsibleAiPillars,
      });

      for (const pillar of assessment.pillarAssessments) {
        assert.ok(pillar.explanation.length >= 120, `${businessCase.id} ${pillar.pillarId} needs a detailed explanation`);
        assert.ok(pillar.concerns.length >= 3, `${businessCase.id} ${pillar.pillarId} needs specific concerns`);
        assert.ok(pillar.pros.length >= 3, `${businessCase.id} ${pillar.pillarId} needs positive indicators`);
        assert.ok(pillar.cons.length >= 2, `${businessCase.id} ${pillar.pillarId} needs risks or caveats`);
        assert.ok(pillar.mitigationIdeas.length >= 3, `${businessCase.id} ${pillar.pillarId} needs mitigation ideas`);
      }
    }
  });
});
