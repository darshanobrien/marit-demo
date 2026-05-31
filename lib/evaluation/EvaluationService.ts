import type {
  AITool,
  BusinessCase,
  BusinessCaseAssessment,
  ResponsibleAIPillar,
} from "../domain/types";

export type EvaluationInput = {
  businessCase: BusinessCase;
  tools: AITool[];
  pillars: ResponsibleAIPillar[];
};

export interface EvaluationService {
  evaluate(input: EvaluationInput): BusinessCaseAssessment;
}
