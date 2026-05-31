import type {
  AITool,
  BusinessArea,
  BusinessCase,
  BusinessCaseAssessment,
  BusinessCasePriority,
  BusinessCaseStatus,
  DataSensitivityLevel,
  EvaluationRiskLevel,
  ExpectedBenefit,
  ResponsibleAIPillar,
} from "../domain/types";
import type { EvaluationService } from "../evaluation";

export type DashboardPriority = "high" | "medium" | "low";
export type DashboardSort = "newest" | "urgency" | "priority";
export type DashboardFilterValue<T extends string> = "all" | T;

export type DashboardFilters = {
  status: DashboardFilterValue<BusinessCaseStatus>;
  businessArea: DashboardFilterValue<BusinessArea | "unassigned">;
  urgency: DashboardFilterValue<BusinessCasePriority>;
};

export type DashboardRow = {
  businessCase: BusinessCase;
  assessment: BusinessCaseAssessment;
  assessmentSource: "stored" | "generated";
  assessmentReady: boolean;
  priority: DashboardPriority;
  score: number;
  riskLevel: EvaluationRiskLevel;
  topRecommendedToolName?: string;
  recommendedToolsCount: number;
};

export type DashboardSummary = {
  totalRequests: number;
  readyForReview: number;
  highUrgency: number;
  strongFit: number;
  highestPriority?: DashboardRow;
};

export const dashboardStatusOptions: BusinessCaseStatus[] = [
  "draft",
  "submitted",
  "ready",
  "assessed",
  "reviewed",
];

export const dashboardUrgencyOptions: BusinessCasePriority[] = ["low", "medium", "high"];

export const emptyDashboardFilters: DashboardFilters = {
  status: "all",
  businessArea: "all",
  urgency: "all",
};

export function buildDashboardRows(input: {
  businessCases: BusinessCase[];
  assessments: BusinessCaseAssessment[];
  evaluator: EvaluationService;
  tools: AITool[];
  pillars: ResponsibleAIPillar[];
}): DashboardRow[] {
  const storedAssessmentsByCaseId = new Map(
    input.assessments.map((assessment) => [assessment.businessCaseId, assessment]),
  );

  return input.businessCases.map((businessCase) => {
    const storedAssessment = storedAssessmentsByCaseId.get(businessCase.id);
    const assessment =
      storedAssessment ??
      input.evaluator.evaluate({
        businessCase,
        tools: input.tools,
        pillars: input.pillars,
      });
    const topRecommendedTool = input.tools.find(
      (tool) => tool.id === assessment.recommendedTools[0]?.toolId,
    );

    return {
      businessCase,
      assessment,
      assessmentSource: storedAssessment ? "stored" : "generated",
      assessmentReady: isAssessmentReady(businessCase.status),
      priority: priorityFor(businessCase, assessment),
      score: assessment.overallScore.value,
      riskLevel: highestRiskLevel(assessment),
      topRecommendedToolName: topRecommendedTool?.name,
      recommendedToolsCount: assessment.recommendedTools.length,
    };
  });
}

export function summarizeDashboard(rows: DashboardRow[]): DashboardSummary {
  const prioritizedRows = sortDashboardRows(rows, "priority");

  return {
    totalRequests: rows.length,
    readyForReview: rows.filter((row) => row.assessmentReady).length,
    highUrgency: rows.filter((row) => row.businessCase.urgency === "high").length,
    strongFit: rows.filter((row) => row.score >= 70).length,
    highestPriority: prioritizedRows[0],
  };
}

export function filterDashboardRows(
  rows: DashboardRow[],
  filters: DashboardFilters,
): DashboardRow[] {
  return rows.filter((row) => {
    const businessArea = row.businessCase.businessArea ?? areaFromTeam(row.businessCase.team);

    return (
      (filters.status === "all" || row.businessCase.status === filters.status) &&
      (filters.businessArea === "all" || businessArea === filters.businessArea) &&
      (filters.urgency === "all" || row.businessCase.urgency === filters.urgency)
    );
  });
}

export function sortDashboardRows(rows: DashboardRow[], sort: DashboardSort): DashboardRow[] {
  const sorted = [...rows];

  switch (sort) {
    case "urgency":
      return sorted.sort((a, b) => {
        const urgencyDelta = urgencyRank(b.businessCase.urgency) - urgencyRank(a.businessCase.urgency);
        return urgencyDelta || scoreDelta(a, b) || newestDelta(a, b);
      });
    case "priority":
      return sorted.sort((a, b) => {
        const priorityDelta = priorityRank(b.priority) - priorityRank(a.priority);
        return priorityDelta || scoreDelta(a, b) || newestDelta(a, b);
      });
    case "newest":
      return sorted.sort((a, b) => newestDelta(a, b));
  }
}

export function getAvailableBusinessAreas(rows: DashboardRow[]): Array<BusinessArea | "unassigned"> {
  return Array.from(
    new Set(rows.map((row) => row.businessCase.businessArea ?? areaFromTeam(row.businessCase.team))),
  ).sort();
}

export function displayBusinessArea(businessCase: BusinessCase): BusinessArea | "unassigned" {
  return businessCase.businessArea ?? areaFromTeam(businessCase.team);
}

export function displayExpectedBenefits(businessCase: BusinessCase): ExpectedBenefit[] {
  return businessCase.expectedBenefits ?? [];
}

export function isAssessmentReady(status: BusinessCaseStatus): boolean {
  return status === "ready" || status === "assessed" || status === "reviewed";
}

export function priorityFor(
  businessCase: BusinessCase,
  assessment: BusinessCaseAssessment,
): DashboardPriority {
  const score = assessment.overallScore.value;

  if (score >= 75 || (score >= 65 && businessCase.urgency === "high")) {
    return "high";
  }

  if (score >= 50 || businessCase.urgency === "high") {
    return "medium";
  }

  return "low";
}

export function areaFromTeam(team: string): BusinessArea | "unassigned" {
  const normalizedTeam = team.trim().toLowerCase();

  if (!normalizedTeam) {
    return "unassigned";
  }

  if (normalizedTeam.includes("finance")) {
    return "finance";
  }

  if (normalizedTeam.includes("people") || normalizedTeam.includes("hr")) {
    return "hrPeople";
  }

  if (normalizedTeam.includes("operation")) {
    return "operations";
  }

  if (normalizedTeam.includes("transform")) {
    return "financialTransformation";
  }

  return "other";
}

function highestRiskLevel(assessment: BusinessCaseAssessment): EvaluationRiskLevel {
  const highestRisk = assessment.pillarAssessments.reduce(
    (current, pillar) =>
      riskRank(pillar.riskScore.level) > riskRank(current) ? pillar.riskScore.level : current,
    "low" as EvaluationRiskLevel,
  );

  return assessment.concerns.reduce(
    (current, concern) => (riskRank(concern.severity) > riskRank(current) ? concern.severity : current),
    highestRisk,
  );
}

function newestDelta(a: DashboardRow, b: DashboardRow): number {
  return Date.parse(b.businessCase.createdAt) - Date.parse(a.businessCase.createdAt);
}

function scoreDelta(a: DashboardRow, b: DashboardRow): number {
  return b.score - a.score;
}

function urgencyRank(urgency: BusinessCasePriority): number {
  return urgency === "high" ? 3 : urgency === "medium" ? 2 : 1;
}

function priorityRank(priority: DashboardPriority): number {
  return priority === "high" ? 3 : priority === "medium" ? 2 : 1;
}

function riskRank(risk: DataSensitivityLevel | EvaluationRiskLevel): number {
  switch (risk) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "moderate":
    case "medium":
      return 2;
    case "low":
      return 1;
    case "unknown":
      return 0;
  }
}
