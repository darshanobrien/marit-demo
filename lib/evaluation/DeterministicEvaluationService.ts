import type {
  AITool,
  AIToolCapability,
  BusinessCase,
  BusinessCaseAssessment,
  DataSensitivityLevel,
  EvaluationConcern,
  EvaluationProCon,
  EvaluationRecommendation,
  EvaluationRiskLevel,
  EvaluationScore,
  FeasibilityAssessment,
  PillarAssessment,
  ResponsibleAIPillar,
  ToolRecommendation,
} from "../domain/types";
import type { EvaluationInput, EvaluationService } from "./EvaluationService";

type SignalProfile = {
  capabilityScores: Record<AIToolCapability, number>;
  dataSignal: number;
  claritySignal: number;
  urgencySignal: number;
  sensitivityRisk: number;
};

const capabilityKeywords: Record<AIToolCapability, string[]> = {
  documentExtraction: ["document", "field", "extract", "invoice", "contract", "form", "file"],
  knowledgeSearch: ["search", "find", "lookup", "knowledge", "source", "research"],
  summarization: ["summarize", "summary", "summarise", "meeting", "transcript", "read", "review"],
  translation: ["translation", "translate", "bilingual", "french", "francais", "terminology"],
  workflowTriage: ["triage", "classify", "routing", "queue", "request", "urgency", "priority"],
  dataQuality: ["data quality", "missing", "duplicate", "spreadsheet", "consistency", "profile"],
  policyQuestionAnswering: ["policy", "question", "answer", "faq", "compliance", "guidance"],
  drafting: ["draft", "write", "communication", "update", "template", "notes"],
};

const generatedAt = "2026-05-30T12:00:00.000Z";

export class DeterministicEvaluationService implements EvaluationService {
  evaluate({ businessCase, tools, pillars }: EvaluationInput): BusinessCaseAssessment {
    const profile = buildSignalProfile(businessCase);
    const recommendedTools = recommendTools(businessCase, tools, profile);
    const feasibility = buildFeasibility(businessCase, profile, recommendedTools);
    const pillarAssessments = pillars
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((pillar) => assessPillar(pillar, businessCase, profile, recommendedTools));
    const concerns = buildConcerns(businessCase, profile, recommendedTools);
    const pros = buildPros(businessCase, profile, recommendedTools);
    const cons = buildCons(businessCase, profile, recommendedTools);
    const mitigationIdeas = buildMitigations(businessCase, profile);
    const overallValue = clamp(
      Math.round(
        feasibility.score.value * 0.55 +
          average(recommendedTools.map((tool) => tool.fitScore.value)) * 0.25 +
          (100 - average(pillarAssessments.map((pillar) => pillar.riskScore.value))) * 0.2,
      ),
    );
    const recommendation = chooseRecommendation(feasibility.score.value, profile, recommendedTools);

    return {
      id: `assessment-${businessCase.id}`,
      businessCaseId: businessCase.id,
      generatedAt,
      generatedBy: "deterministicMock",
      feasibility,
      recommendedTools,
      pillarAssessments,
      concerns,
      pros,
      cons,
      mitigationIdeas,
      recommendation,
      recommendedNextStep: nextStepFor(recommendation),
      overallScore: score(
        overallValue,
        `Overall score combines feasibility, tool fit, and responsible AI risk for ${businessCase.title}.`,
        true,
      ),
      confidence: confidenceFor(businessCase, recommendedTools),
    };
  }
}

function buildSignalProfile(businessCase: BusinessCase): SignalProfile {
  const text = searchableText(businessCase);
  const capabilityScores = Object.fromEntries(
    Object.entries(capabilityKeywords).map(([capability, keywords]) => [
      capability,
      scoreKeywords(text, keywords),
    ]),
  ) as Record<AIToolCapability, number>;

  const dataSignal = clamp(30 + businessCase.knownDataSources.length * 16);
  const claritySignal = clamp(
    30 +
      filledTextScore(businessCase.painPoint) +
      filledTextScore(businessCase.desiredOutcome) +
      filledTextScore(businessCase.impactStatement),
  );
  const urgencySignal = businessCase.urgency === "high" ? 88 : businessCase.urgency === "medium" ? 62 : 38;
  const sensitivityRisk = sensitivityRiskFor(businessCase.dataSensitivity);

  return {
    capabilityScores,
    dataSignal,
    claritySignal,
    urgencySignal,
    sensitivityRisk,
  };
}

function recommendTools(
  businessCase: BusinessCase,
  tools: AITool[],
  profile: SignalProfile,
): ToolRecommendation[] {
  return tools
    .map((tool) => {
      const capabilityFit = average(tool.capabilities.map((capability) => profile.capabilityScores[capability]));
      const sensitivityFit = toolSupportsSensitivity(tool, businessCase.dataSensitivity) ? 12 : -18;
      const complexityPenalty = tool.implementationComplexity === "high" ? 8 : tool.implementationComplexity === "medium" ? 3 : 0;
      const fitValue = clamp(Math.round(capabilityFit + profile.dataSignal * 0.18 + sensitivityFit - complexityPenalty));

      return {
        toolId: tool.id,
        fitScore: score(fitValue, `${tool.name} fit is based on capability keywords, data readiness, and demo risk fit.`, true),
        rationale: `${tool.name} is relevant because it supports ${tool.capabilities.join(", ")} and matches the submitted pain point signals.`,
        limitations: tool.limitations.slice(0, 2),
      };
    })
    .filter((tool) => tool.fitScore.value >= 35)
    .sort((a, b) => b.fitScore.value - a.fitScore.value)
    .slice(0, 3);
}

function buildFeasibility(
  businessCase: BusinessCase,
  profile: SignalProfile,
  recommendedTools: ToolRecommendation[],
): FeasibilityAssessment {
  const toolFit = average(recommendedTools.map((tool) => tool.fitScore.value));
  const sensitivityPenalty = businessCase.dataSensitivity === "high" ? 12 : businessCase.dataSensitivity === "unknown" ? 8 : 0;
  const value = clamp(Math.round(profile.claritySignal * 0.35 + profile.dataSignal * 0.25 + toolFit * 0.35 - sensitivityPenalty));
  const gaps = [
    ...(businessCase.knownDataSources.length === 0 ? ["Confirm representative data sources."] : []),
    ...(businessCase.dataSensitivity === "high" ? ["Define masking, access, and review expectations for sensitive data."] : []),
    ...(recommendedTools.length === 0 ? ["Clarify the AI capability needed before selecting a tool."] : []),
  ];

  return {
    score: score(value, "Feasibility reflects clarity, data readiness, tool fit, and demo risk constraints.", true),
    summary:
      value >= 70
        ? "The opportunity looks feasible for a weekend-demo assessment with mock data and human review."
        : "The opportunity needs more discovery before it is a strong demo candidate.",
    positiveSignals: [
      `${businessCase.knownDataSources.length} known mock data source(s) were identified.`,
      recommendedTools.length > 0
        ? `${recommendedTools.length} relevant AI tool recommendation(s) were found.`
        : "No strong tool match was found yet.",
    ],
    gaps,
  };
}

function assessPillar(
  pillar: ResponsibleAIPillar,
  businessCase: BusinessCase,
  profile: SignalProfile,
  recommendedTools: ToolRecommendation[],
): PillarAssessment {
  const riskValue = riskForPillar(pillar.id, businessCase, profile, recommendedTools);
  const level = riskLevel(riskValue);

  return {
    pillarId: pillar.id,
    riskScore: score(riskValue, `${pillar.name} risk is deterministically estimated from sensitivity, clarity, data, and tool-fit signals.`),
    explanation: explanationForPillar(pillar.name, riskValue, businessCase),
    concerns: [
      {
        id: `${pillar.id}-concern`,
        severity: level,
        description:
          riskValue >= 50
            ? `Review ${pillar.name.toLowerCase()} before prototyping this opportunity.`
            : `${pillar.name} appears manageable for a mock-data demo with human review.`,
      },
    ],
    pros: [
      {
        id: `${pillar.id}-pro`,
        description: "The demo keeps AI analytical only and keeps AI Builder review in the loop.",
      },
    ],
    cons: [
      {
        id: `${pillar.id}-con`,
        description:
          businessCase.dataSensitivity === "high"
            ? "High data sensitivity increases review expectations even with mock data."
            : "Production use would need stronger evidence than the weekend demo provides.",
      },
    ],
    mitigationIdeas: mitigationForPillar(pillar.id, businessCase),
  };
}

function buildConcerns(
  businessCase: BusinessCase,
  profile: SignalProfile,
  recommendedTools: ToolRecommendation[],
): EvaluationConcern[] {
  const concerns: EvaluationConcern[] = [];

  if (businessCase.dataSensitivity === "high" || businessCase.dataSensitivity === "unknown") {
    concerns.push({
      id: "concern-data-sensitivity",
      severity: businessCase.dataSensitivity === "high" ? "high" : "moderate",
      description: "Data sensitivity requires clear mock-data boundaries and future access controls.",
    });
  }

  if (recommendedTools.length === 0) {
    concerns.push({
      id: "concern-tool-fit",
      severity: "high",
      description: "No strong internal AI tool fit was found from the current request details.",
    });
  }

  if (profile.claritySignal < 60) {
    concerns.push({
      id: "concern-request-clarity",
      severity: "moderate",
      description: "The request would benefit from a sharper outcome and success measure.",
    });
  }

  return concerns.length > 0
    ? concerns
    : [
        {
          id: "concern-human-review",
          severity: "low",
          description: "Keep AI Builder review before treating any recommendation as final.",
        },
      ];
}

function buildPros(
  businessCase: BusinessCase,
  profile: SignalProfile,
  recommendedTools: ToolRecommendation[],
): EvaluationProCon[] {
  return [
    {
      id: "pro-business-impact",
      description: `The stated impact is clear enough for discovery: ${businessCase.impactStatement}`,
    },
    {
      id: "pro-data-sources",
      description: `${businessCase.knownDataSources.length} known data source(s) support early feasibility review.`,
    },
    {
      id: "pro-tool-fit",
      description:
        recommendedTools.length > 0
          ? "At least one internal AI tool appears relevant."
          : "The request can still be used to clarify the needed AI capability.",
    },
    {
      id: "pro-urgency",
      description: `Urgency signal is ${profile.urgencySignal >= 80 ? "strong" : "manageable"} for prioritization.`,
    },
  ];
}

function buildCons(
  businessCase: BusinessCase,
  profile: SignalProfile,
  recommendedTools: ToolRecommendation[],
): EvaluationProCon[] {
  return [
    {
      id: "con-demo-only",
      description: "The current assessment uses mock data and deterministic rules, not production evidence.",
    },
    {
      id: "con-risk-review",
      description:
        profile.sensitivityRisk >= 65
          ? "Sensitive data would require stricter production controls."
          : "Future production use would still require security, privacy, and governance review.",
    },
    {
      id: "con-tool-limitations",
      description:
        recommendedTools[0]?.limitations[0] ?? "Tool limitations need to be clarified during discovery.",
    },
  ];
}

function buildMitigations(businessCase: BusinessCase, profile: SignalProfile): string[] {
  return [
    "Use mock or masked data for all prototype work.",
    "Require AI Builder review before sharing assessment conclusions.",
    "Define success measures before building a prototype.",
    profile.sensitivityRisk >= 65
      ? "Confirm privacy, access, and retention expectations before any production design."
      : "Document why data sensitivity is manageable for the demo.",
  ];
}

function chooseRecommendation(
  feasibilityScore: number,
  profile: SignalProfile,
  recommendedTools: ToolRecommendation[],
): EvaluationRecommendation {
  if (recommendedTools.length === 0 || profile.claritySignal < 50) {
    return "clarifyBusinessNeed";
  }

  if (profile.sensitivityRisk >= 75) {
    return "needsRiskReview";
  }

  if (feasibilityScore >= 75 && recommendedTools[0]?.fitScore.value >= 65) {
    return "prototypeCandidate";
  }

  if (feasibilityScore >= 55) {
    return "proceedToDiscovery";
  }

  return "notRecommendedYet";
}

function nextStepFor(recommendation: EvaluationRecommendation): string {
  switch (recommendation) {
    case "prototypeCandidate":
      return "Schedule an AI Lab discovery session and prepare a small mock-data prototype plan.";
    case "proceedToDiscovery":
      return "Run a short discovery session to confirm data, users, controls, and success measures.";
    case "needsRiskReview":
      return "Review data sensitivity, privacy, security, and human oversight before prototyping.";
    case "clarifyBusinessNeed":
      return "Clarify the pain point, desired outcome, data sources, and decision points before evaluation.";
    case "notRecommendedYet":
      return "Do not prototype yet; gather more evidence and refine the opportunity.";
  }
}

function confidenceFor(businessCase: BusinessCase, recommendedTools: ToolRecommendation[]): "low" | "medium" | "high" {
  if (businessCase.knownDataSources.length >= 3 && recommendedTools.length >= 2) {
    return "high";
  }

  if (businessCase.knownDataSources.length >= 1 && recommendedTools.length >= 1) {
    return "medium";
  }

  return "low";
}

function riskForPillar(
  pillarId: string,
  businessCase: BusinessCase,
  profile: SignalProfile,
  recommendedTools: ToolRecommendation[],
): number {
  const highSensitivity = profile.sensitivityRisk;
  const weakData = 100 - profile.dataSignal;
  const weakClarity = 100 - profile.claritySignal;
  const weakToolFit = 100 - average(recommendedTools.map((tool) => tool.fitScore.value));

  const baseByPillar: Record<string, number> = {
    "human-oversight": 28,
    "fairness-non-discrimination": 32,
    "privacy-data-protection": 24 + highSensitivity * 0.55,
    "security-robustness": 30 + highSensitivity * 0.35,
    "transparency-explainability": 34 + weakClarity * 0.25,
    "accountability-governance": 36 + weakClarity * 0.2,
    "legal-regulatory-compliance": 32 + highSensitivity * 0.35,
    "data-quality-provenance": 28 + weakData * 0.45,
    "reliability-performance": 30 + weakToolFit * 0.25,
    "social-environmental-reputational-impact": 30 + (businessCase.urgency === "high" ? 8 : 0),
  };

  return clamp(Math.round(baseByPillar[pillarId] ?? 45));
}

function explanationForPillar(pillarName: string, riskValue: number, businessCase: BusinessCase): string {
  const level = riskLevel(riskValue);
  return `${pillarName} is assessed as ${level} risk for "${businessCase.title}" using deterministic demo scoring.`;
}

function mitigationForPillar(pillarId: string, businessCase: BusinessCase): string[] {
  const common = "Keep a human reviewer accountable for final interpretation.";
  const byPillar: Record<string, string> = {
    "human-oversight": "Define which AI Builder reviews and signs off on the assessment.",
    "fairness-non-discrimination": "Check whether routing, classification, or prioritization could affect groups unfairly.",
    "privacy-data-protection": "Use mock, masked, or minimized data during prototype work.",
    "security-robustness": "Document prompt injection, access, and data leakage controls before production.",
    "transparency-explainability": "Show users when content is AI-generated and provide clear rationale.",
    "accountability-governance": "Assign accountable business and AI Lab owners before prototyping.",
    "legal-regulatory-compliance": "Confirm policy and regulatory constraints with accountable owners.",
    "data-quality-provenance": "Validate representative data samples and document source provenance.",
    "reliability-performance": "Define quality checks and acceptable failure modes before pilot use.",
    "social-environmental-reputational-impact": "Consider stakeholder trust and reputational impact before scaling.",
  };

  return [byPillar[pillarId] ?? common, common, `Keep "${businessCase.title}" limited to mock data until approved.`];
}

function searchableText(businessCase: BusinessCase): string {
  return [
    businessCase.title,
    businessCase.painPoint,
    businessCase.currentProcess,
    businessCase.desiredOutcome,
    businessCase.impactStatement,
    businessCase.knownDataSources.join(" "),
    businessCase.expectedUsers,
    businessCase.constraints?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreKeywords(text: string, keywords: string[]): number {
  const hits = keywords.filter((keyword) => text.includes(keyword)).length;
  return clamp(20 + hits * 18);
}

function filledTextScore(value?: string): number {
  if (!value) {
    return 0;
  }

  return value.length > 120 ? 24 : value.length > 60 ? 18 : 12;
}

function sensitivityRiskFor(level: DataSensitivityLevel): number {
  switch (level) {
    case "low":
      return 25;
    case "medium":
      return 50;
    case "high":
      return 82;
    case "unknown":
      return 70;
  }
}

function toolSupportsSensitivity(tool: AITool, sensitivity: DataSensitivityLevel): boolean {
  if (sensitivity === "unknown") {
    return false;
  }

  return tool.riskProfile.supportedDataSensitivity.includes(sensitivity);
}

function score(value: number, explanation: string, higherIsBetter = false): EvaluationScore {
  return {
    value: clamp(value),
    level: higherIsBetter ? positiveLevel(value) : riskLevel(value),
    explanation,
  };
}

function riskLevel(value: number): EvaluationRiskLevel {
  if (value >= 75) {
    return "critical";
  }

  if (value >= 50) {
    return "high";
  }

  if (value >= 25) {
    return "moderate";
  }

  return "low";
}

function positiveLevel(value: number): EvaluationRiskLevel {
  if (value >= 75) {
    return "low";
  }

  if (value >= 50) {
    return "moderate";
  }

  if (value >= 25) {
    return "high";
  }

  return "critical";
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
