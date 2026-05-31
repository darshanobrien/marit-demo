export type DemoRole = "businessUser" | "aiBuilder" | "admin";

export type BusinessCaseStatus = "draft" | "submitted" | "ready" | "assessed" | "reviewed";
export type BusinessCasePriority = "low" | "medium" | "high";
export type DataSensitivityLevel = "low" | "medium" | "high" | "unknown";
export type IntakeUrgency = "low" | "medium" | "high" | "critical";
export type BusinessArea =
  | "finance"
  | "hrPeople"
  | "legal"
  | "risk"
  | "marketing"
  | "sales"
  | "operations"
  | "its"
  | "audit"
  | "financialTransformation"
  | "clientService"
  | "knowledgeManagement"
  | "other";
export type IntakeDataSensitivity = "public" | "confidential" | "restricted" | "pii" | "unknown";
export type ExpectedBenefit =
  | "saveTime"
  | "reduceManualEffort"
  | "improveQualityConsistency"
  | "reduceRisk"
  | "improveDecisionMaking"
  | "improveEmployeeExperience"
  | "improveClientServiceExperience"
  | "reduceCost"
  | "increaseRevenue"
  | "other";
export type ImplementationComplexity = "low" | "medium" | "high";
export type EvaluationRiskLevel = "low" | "moderate" | "high" | "critical";
export type EvaluationRecommendation =
  | "proceedToDiscovery"
  | "clarifyBusinessNeed"
  | "prototypeCandidate"
  | "needsRiskReview"
  | "notRecommendedYet";
export type AIToolInputType =
  | "text"
  | "documents"
  | "images"
  | "structuredData"
  | "email"
  | "code"
  | "audio";
export type AIToolOutputType =
  | "text"
  | "classification"
  | "summary"
  | "extractedData"
  | "recommendations"
  | "generatedContent";
export type AIToolDeploymentModel =
  | "saas"
  | "internalPlatform"
  | "azureService"
  | "localPrivate"
  | "approvedVendor";
export type AIToolDataSensitivitySuitability =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";
export type AIToolIntegrationOption =
  | "api"
  | "uiOnly"
  | "microsoft365"
  | "workflowAutomation"
  | "customConnector";
export type AIToolStatus = "available" | "pilot" | "restricted" | "deprecated";

export type AIToolCapability =
  | "documentExtraction"
  | "knowledgeSearch"
  | "summarization"
  | "translation"
  | "workflowTriage"
  | "dataQuality"
  | "policyQuestionAnswering"
  | "drafting";

export type EvaluationScore = {
  value: number;
  level: EvaluationRiskLevel;
  explanation: string;
};

export type DemoUser = {
  id: string;
  displayName: string;
  role: DemoRole;
  team: string;
  localePreference: "en-CA" | "fr-CA";
};

export type BusinessCase = {
  id: string;
  title: string;
  businessArea?: BusinessArea;
  team: string;
  submitterUserId: string;
  painPoint: string;
  currentProcess?: string;
  desiredOutcome: string;
  impactStatement: string;
  affectedPeople?: string;
  estimatedVolume?: string;
  knownDataSources: string[];
  dataSensitivity: DataSensitivityLevel;
  dataSensitivitySelections?: IntakeDataSensitivity[];
  urgency: BusinessCasePriority;
  urgencySelection?: IntakeUrgency;
  currentTools?: string;
  expectedBenefits?: ExpectedBenefit[];
  expectedUsers?: string;
  constraints?: string[];
  imaginedAiSolution?: string;
  status: BusinessCaseStatus;
  createdAt: string;
  updatedAt: string;
};

export type AIToolRiskProfile = {
  supportedDataSensitivity: DataSensitivityLevel[];
  riskNotes: string[];
  requiresHumanReview: boolean;
};

export type AITool = {
  id: string;
  name: string;
  provider: string;
  shortDescription: string;
  capabilities: AIToolCapability[];
  suitableUseCases: string[];
  supportedInputTypes: AIToolInputType[];
  supportedOutputTypes: AIToolOutputType[];
  deploymentModel: AIToolDeploymentModel;
  dataSensitivitySuitability: AIToolDataSensitivitySuitability[];
  integrationOptions: AIToolIntegrationOption[];
  supportedLanguages: {
    english: boolean;
    french: boolean;
  };
  accessibilityConsiderations: string;
  responsibleAiNotes: string;
  securityPrivacyNotes: string;
  status: AIToolStatus;
  lastReviewedAt: string;
  limitations: string[];
  riskProfile: AIToolRiskProfile;
  implementationComplexity: ImplementationComplexity;
};

export type ResponsibleAIPillar = {
  id: string;
  order: number;
  name: string;
  description: string;
};

export type EvaluationConcern = {
  id: string;
  severity: EvaluationRiskLevel;
  description: string;
};

export type EvaluationProCon = {
  id: string;
  description: string;
};

export type PillarAssessment = {
  pillarId: string;
  riskScore: EvaluationScore;
  explanation: string;
  concerns: EvaluationConcern[];
  pros: EvaluationProCon[];
  cons: EvaluationProCon[];
  mitigationIdeas: string[];
};

export type FeasibilityAssessment = {
  score: EvaluationScore;
  summary: string;
  positiveSignals: string[];
  gaps: string[];
};

export type ToolRecommendation = {
  toolId: string;
  fitScore: EvaluationScore;
  rationale: string;
  limitations: string[];
};

export type BusinessCaseAssessment = {
  id: string;
  businessCaseId: string;
  generatedAt: string;
  generatedBy: "deterministicMock";
  feasibility: FeasibilityAssessment;
  recommendedTools: ToolRecommendation[];
  pillarAssessments: PillarAssessment[];
  concerns: EvaluationConcern[];
  pros: EvaluationProCon[];
  cons: EvaluationProCon[];
  mitigationIdeas: string[];
  recommendation: EvaluationRecommendation;
  recommendedNextStep: string;
  overallScore: EvaluationScore;
  confidence: "low" | "medium" | "high";
};
