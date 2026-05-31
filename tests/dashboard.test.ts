import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDashboardRows,
  emptyDashboardFilters,
  filterDashboardRows,
  sortDashboardRows,
  summarizeDashboard,
} from "../lib/dashboard/businessCaseDashboard";
import { aiTools, businessCases, responsibleAiPillars } from "../lib/data";
import type { BusinessCaseAssessment } from "../lib/domain/types";
import { DeterministicEvaluationService } from "../lib/evaluation";

const evaluator = new DeterministicEvaluationService();

describe("business case dashboard model", () => {
  it("builds display rows for seeded cases", () => {
    const rows = buildRows();

    assert.equal(rows.length, businessCases.length);
    assert.ok(rows.every((row) => row.assessment.businessCaseId === row.businessCase.id));
  });

  it("uses stored assessments before generated fallback assessments", () => {
    const storedAssessment = {
      ...evaluator.evaluate({
        businessCase: businessCases[0],
        tools: aiTools,
        pillars: responsibleAiPillars,
      }),
      overallScore: {
        value: 99,
        level: "low",
        explanation: "Stored assessment should win.",
      },
    } satisfies BusinessCaseAssessment;

    const rows = buildRows([storedAssessment]);
    const storedRow = rows.find((row) => row.businessCase.id === businessCases[0].id);
    const generatedRow = rows.find((row) => row.businessCase.id === businessCases[1].id);

    assert.equal(storedRow?.assessmentSource, "stored");
    assert.equal(storedRow?.score, 99);
    assert.equal(generatedRow?.assessmentSource, "generated");
  });

  it("summarizes ready, high-urgency, and strong-fit requests", () => {
    const rows = buildRows();
    const summary = summarizeDashboard(rows);

    assert.equal(summary.totalRequests, businessCases.length);
    assert.equal(summary.readyForReview, 1);
    assert.equal(summary.highUrgency, 1);
    assert.ok(summary.strongFit >= 1);
    assert.ok(summary.highestPriority);
  });

  it("filters by status, business area, and urgency", () => {
    const rows = buildRows();

    assert.ok(filterDashboardRows(rows, { ...emptyDashboardFilters, status: "assessed" }).length >= 1);
    assert.ok(filterDashboardRows(rows, { ...emptyDashboardFilters, businessArea: "finance" }).length >= 1);
    assert.ok(filterDashboardRows(rows, { ...emptyDashboardFilters, urgency: "high" }).length >= 1);
  });

  it("sorts newest, urgency, and priority", () => {
    const rows = buildRows();

    assert.deepEqual(
      sortDashboardRows(rows, "newest").map((row) => row.businessCase.id),
      [
        "case-bilingual-updates",
        "case-data-readiness",
        "case-policy-search",
        "case-operations-triage",
      ],
    );
    assert.equal(sortDashboardRows(rows, "urgency")[0].businessCase.urgency, "high");
    assert.equal(sortDashboardRows(rows, "priority")[0].priority, "high");
  });
});

function buildRows(assessments: BusinessCaseAssessment[] = []) {
  return buildDashboardRows({
    businessCases,
    assessments,
    evaluator,
    tools: aiTools,
    pillars: responsibleAiPillars,
  });
}
