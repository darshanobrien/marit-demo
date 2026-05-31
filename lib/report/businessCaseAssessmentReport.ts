import type {
  AITool,
  BusinessCase,
  BusinessCaseAssessment,
  ResponsibleAIPillar,
  ToolRecommendation,
} from "../domain/types";
import type { EvaluationService } from "../evaluation";

export type ReportToolRecommendation = ToolRecommendation & {
  tool?: AITool;
};

export type ReportPillarAssessment = BusinessCaseAssessment["pillarAssessments"][number] & {
  pillar?: ResponsibleAIPillar;
};

export type AssessmentReportModel =
  | {
      state: "found";
      businessCase: BusinessCase;
      assessment: BusinessCaseAssessment;
      assessmentSource: "stored" | "generated";
      recommendedTools: ReportToolRecommendation[];
      pillarAssessments: ReportPillarAssessment[];
    }
  | {
      state: "notFound";
      businessCaseId: string;
    };

export function buildAssessmentReportModel(input: {
  businessCaseId: string;
  businessCases: BusinessCase[];
  assessments: BusinessCaseAssessment[];
  evaluator: EvaluationService;
  tools: AITool[];
  pillars: ResponsibleAIPillar[];
}): AssessmentReportModel {
  const businessCase = input.businessCases.find((item) => item.id === input.businessCaseId);

  if (!businessCase) {
    return {
      state: "notFound",
      businessCaseId: input.businessCaseId,
    };
  }

  const storedAssessment = input.assessments.find(
    (assessment) => assessment.businessCaseId === businessCase.id,
  );
  const assessment =
    storedAssessment ??
    input.evaluator.evaluate({
      businessCase,
      tools: input.tools,
      pillars: input.pillars,
    });
  const toolsById = new Map(input.tools.map((tool) => [tool.id, tool]));
  const pillarsById = new Map(input.pillars.map((pillar) => [pillar.id, pillar]));

  return {
    state: "found",
    businessCase,
    assessment,
    assessmentSource: storedAssessment ? "stored" : "generated",
    recommendedTools: assessment.recommendedTools.map((recommendation) => ({
      ...recommendation,
      tool: toolsById.get(recommendation.toolId),
    })),
    pillarAssessments: assessment.pillarAssessments.map((pillarAssessment) => ({
      ...pillarAssessment,
      pillar: pillarsById.get(pillarAssessment.pillarId),
    })),
  };
}
