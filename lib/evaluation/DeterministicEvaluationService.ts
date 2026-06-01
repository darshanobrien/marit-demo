import type {
  AITool,
  AIToolCapability,
  AIToolStatus,
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

type PillarContent = {
  explanation: string;
  concerns: string[];
  pros: string[];
  cons: string[];
  mitigationIdeas: string[];
};

type CaseContext = {
  title: string;
  affectedUsers: string;
  dataSources: string;
  primaryDataSource: string;
  currentProcess: string;
  desiredOutcome: string;
  constraints: string;
  toolFit: string;
};

type ToolCandidate = {
  tool: AITool;
  recommendation: ToolRecommendation;
  availableNow: boolean;
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
  const text = searchableText(businessCase);
  const candidates = tools
    .filter((tool) => tool.status !== "deprecated")
    .map((tool) => {
      const capabilityFit = average(tool.capabilities.map((capability) => profile.capabilityScores[capability]));
      const sensitivityFit = toolSupportsSensitivity(tool, businessCase.dataSensitivity) ? 12 : -18;
      const complexityPenalty = tool.implementationComplexity === "high" ? 8 : tool.implementationComplexity === "medium" ? 3 : 0;
      const statusPenalty = statusPenaltyFor(tool.status);
      const domainFit = domainFitFor(text, tool);
      const fitValue = clamp(
        Math.round(
          capabilityFit +
            profile.dataSignal * 0.18 +
            sensitivityFit +
            domainFit -
            complexityPenalty -
            statusPenalty,
        ),
      );

      return {
        tool,
        availableNow: tool.status === "available",
        recommendation: {
          toolId: tool.id,
          fitScore: score(
            fitValue,
            `${tool.name} fit is based on approved catalogue capability signals, data readiness, data sensitivity, status, deployment fit, and integration fit.`,
            true,
          ),
          rationale: buildToolRationale(tool),
          limitations: buildToolLimitations(tool),
        },
      } satisfies ToolCandidate;
    })
    .filter((candidate) => candidate.recommendation.fitScore.value >= 35)
    .sort((a, b) => b.recommendation.fitScore.value - a.recommendation.fitScore.value);

  const availableCandidates = candidates.filter((candidate) => candidate.availableNow);

  if (availableCandidates.length > 0) {
    return availableCandidates.slice(0, 3).map((candidate) => candidate.recommendation);
  }

  return candidates.slice(0, 2).map((candidate) => candidate.recommendation);
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
    ...(recommendedTools.length === 0
      ? [
          "No approved available tool is clearly appropriate yet; clarify whether the gap is classification, summarization, extraction, retrieval, workflow integration, or a bespoke application need.",
        ]
      : []),
  ];

  return {
    score: score(value, "Feasibility reflects clarity, data readiness, tool fit, and risk constraints.", true),
    summary:
      value >= 70
        ? "The opportunity appears feasible for structured discovery, provided the AI Lab confirms data access, controls, and human review expectations."
        : "The opportunity needs more discovery before it is a strong prototype candidate.",
    positiveSignals: [
      `${businessCase.knownDataSources.length} relevant data source(s) were identified.`,
      recommendedTools.length > 0
        ? `${recommendedTools.length} relevant AI tool recommendation(s) were found.`
        : "No approved available tool match was found yet; the capability gap should be clarified before selecting a solution.",
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
  const content = contentForPillar(pillar.id, pillar.name, businessCase, recommendedTools);

  return {
    pillarId: pillar.id,
    riskScore: score(riskValue, `${pillar.name} risk is estimated from sensitivity, clarity, data readiness, and tool-fit signals.`),
    explanation: content.explanation,
    concerns: content.concerns.map((description, index) => ({
      id: `${pillar.id}-concern-${index + 1}`,
      severity: level,
      description,
    })),
    pros: content.pros.map((description, index) => ({
      id: `${pillar.id}-pro-${index + 1}`,
      description,
    })),
    cons: content.cons.map((description, index) => ({
      id: `${pillar.id}-con-${index + 1}`,
      description,
    })),
    mitigationIdeas: content.mitigationIdeas,
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
      description: "Data sensitivity requires clear access, minimization, and retention controls.",
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
      id: "con-validation-needed",
      description: "The current assessment is based on intake details and rule-based scoring, so it should be validated through discovery before decisions are made.",
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
    "Start with approved, minimized, or redacted representative examples before using operational records.",
    "Require AI Builder review before sharing assessment conclusions.",
    "Define success measures before building a prototype.",
    profile.sensitivityRisk >= 65
      ? "Confirm privacy, access, and retention expectations before any production design."
      : "Document why data sensitivity is manageable and which controls are still required.",
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
      return "Schedule an AI Lab discovery session and prepare a constrained prototype plan with approved data and controls.";
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

function statusPenaltyFor(status: AIToolStatus): number {
  switch (status) {
    case "available":
      return 0;
    case "restricted":
      return 12;
    case "underReview":
      return 20;
    case "requiresDevelopment":
      return 28;
    case "pilot":
      return 8;
    case "deprecated":
      return 100;
  }
}

function domainFitFor(text: string, tool: AITool): number {
  const name = tool.name.toLowerCase();

  if (hasAny(text, ["support", "ticket", "helpdesk", "troubleshoot", "teams", "employee technology"])) {
    if (name.includes("nimo")) {
      return 34;
    }

    if (name.includes("m365 copilot")) {
      return 8;
    }
  }

  if (hasAny(text, ["policy", "manager", "employee", "handbook", "faq", "guidance"])) {
    if (name.includes("m365 copilot")) {
      return 28;
    }

    if (name.includes("azure open ai")) {
      return 12;
    }
  }

  if (hasAny(text, ["spreadsheet", "data quality", "missing", "duplicate", "planning", "profile"])) {
    if (name.includes("azure open ai")) {
      return 26;
    }

    if (name.includes("custom web app") || name.includes("foundry")) {
      return 16;
    }
  }

  if (hasAny(text, ["bilingual", "french", "translation", "terminology", "communications", "updates"])) {
    if (name.includes("m365 copilot")) {
      return 30;
    }

    if (name.includes("claude cowork")) {
      return 18;
    }

    if (name.includes("azure open ai")) {
      return 10;
    }
  }

  if (hasAny(text, ["code", "repository", "software", "defect", "refactor", "test", "developer"])) {
    if (
      name.includes("github copilot") ||
      name.includes("codex (desktop app)") ||
      name.includes("claude code")
    ) {
      return 32;
    }

    if (name.includes("codex plugins")) {
      return 12;
    }
  }

  if (hasAny(text, ["triage", "classify", "routing", "queue", "request", "urgency", "priority"])) {
    if (name.includes("nimo")) {
      return 16;
    }

    if (name.includes("azure open ai")) {
      return 14;
    }

    if (name.includes("custom web app") || name.includes("foundry")) {
      return 14;
    }
  }

  return 0;
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function buildToolRationale(tool: AITool): string {
  return [
    `${tool.name} ${statusRationale(tool.status)}.`,
    `Input fit: ${formatCatalogueList(tool.catalogueMetadata?.supportedInputTypes)}.`,
    `Output fit: ${formatCatalogueList(tool.catalogueMetadata?.supportedOutputTypes)}.`,
    `Deployment and integration fit: ${tool.catalogueMetadata?.deploymentModel ?? tool.deploymentModel}; integrations include ${formatCatalogueList(tool.catalogueMetadata?.integrationOptions)}.`,
    `Data sensitivity fit: suitable for ${formatSensitivity(tool)} data with human review ${tool.riskProfile.requiresHumanReview ? "required" : "not required"}.`,
    `Security and privacy review: ${firstSentence(tool.securityPrivacyNotes)}`,
  ].join(" ");
}

function buildToolLimitations(tool: AITool): string[] {
  return [
    statusLimitation(tool.status),
    firstSentence(tool.securityPrivacyNotes),
    ...tool.limitations.slice(0, 1),
  ].filter(Boolean);
}

function statusRationale(status: AIToolStatus): string {
  switch (status) {
    case "available":
      return "is available in the approved AI tools catalogue and can be considered for discovery subject to normal AI Builder review";
    case "underReview":
      return "is under review and should not be treated as production-ready";
    case "requiresDevelopment":
      return "requires development and should be treated as a future or custom option, not an immediately available solution";
    case "pilot":
      return "is in pilot and should be considered only with pilot constraints and explicit owner approval";
    case "restricted":
      return "is restricted and should be considered only where the restriction conditions are satisfied";
    case "deprecated":
      return "is deprecated and should not be selected for new work";
  }
}

function statusLimitation(status: AIToolStatus): string {
  switch (status) {
    case "available":
      return "Available status still requires AI Builder review, data validation, and security/privacy confirmation before business use.";
    case "underReview":
      return "Under Review status means this tool is not production-ready and should not be treated as an approved operational solution.";
    case "requiresDevelopment":
      return "Requires Development status means this is a future/custom option, not an immediately available solution.";
    case "pilot":
      return "Pilot status requires explicit pilot controls, ownership, and evaluation criteria.";
    case "restricted":
      return "Restricted status requires confirmation that the use case satisfies catalogue restrictions.";
    case "deprecated":
      return "Deprecated status means this tool should not be used for new business cases.";
  }
}

function formatCatalogueList(values: string[] | undefined): string {
  return values && values.length > 0 ? values.join(", ") : "not specified in catalogue metadata";
}

function formatSensitivity(tool: AITool): string {
  return tool.dataSensitivitySuitability.join(", ");
}

function firstSentence(value: string): string {
  return value.split(/(?<=\.)\s+/)[0] ?? value;
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

function contentForPillar(
  pillarId: string,
  pillarName: string,
  businessCase: BusinessCase,
  recommendedTools: ToolRecommendation[],
): PillarContent {
  const context = buildCaseContext(businessCase, recommendedTools);
  const sensitivityText =
    businessCase.dataSensitivity === "high"
      ? "The request involves higher-sensitivity information, so access, retention, and data minimization controls would need to be defined early."
      : businessCase.dataSensitivity === "unknown"
        ? "The request does not yet establish data sensitivity, so discovery should confirm what information is actually needed."
        : "The stated data sensitivity appears manageable, but the AI Lab should still confirm the fields and records needed before piloting.";

  switch (pillarId) {
    case "human-oversight":
      return {
        explanation: `${context.title} would support ${context.affectedUsers} by suggesting classifications, priorities, or draft outputs connected to ${context.desiredOutcome}. Human oversight matters because the output could influence sequencing, escalation, or follow-up work even when the system is advisory.`,
        concerns: [
          `The current process (${context.currentProcess}) should define exactly where human review occurs and who can override the AI suggestion.`,
          "Reviewers may over-trust repeated recommendations if confidence, rationale, and uncertainty are not visible.",
          "Escalation paths are not fully defined for ambiguous, high-impact, or sensitive cases.",
        ],
        pros: [
          "The desired outcome is decision support rather than autonomous execution.",
          context.constraints,
          "A structured review step can capture disagreements and improve evaluation criteria before piloting.",
        ],
        cons: [
          "Human review alone is not sufficient unless reviewers have enough context, time, and authority to challenge the output.",
          "If review queues are high volume, oversight quality may degrade without sampling, escalation, and audit expectations.",
        ],
        mitigationIdeas: [
          "Define which role reviews AI output, which actions require explicit approval, and which cases must be escalated.",
          "Show rationale, confidence, and source signals beside each recommendation.",
          "Track reviewer overrides and disagreement reasons during pilot evaluation.",
          "Keep the system advisory until quality thresholds and operating procedures are validated.",
        ],
      };
    case "fairness-non-discrimination":
      return {
        explanation: `${pillarName} matters because the request could shape how work, attention, or service quality is distributed across requestors, teams, or topics. The AI Lab should confirm whether any protected or sensitive attributes could appear directly or indirectly in ${context.primaryDataSource}.`,
        concerns: [
          "Historical routing, triage, or quality patterns may encode inconsistent treatment across teams or request types.",
          "Free-text descriptions can include names, roles, locations, or other proxies that should not influence prioritization.",
          "Urgency or fit labels may disadvantage less common request patterns if evaluation data is not representative.",
        ],
        pros: [
          "Using approved categories and guidelines can reduce ad hoc judgement if the taxonomy is well governed.",
          "Human review can identify edge cases where the suggested category or priority appears unfair or unsupported.",
          "A pilot can compare AI suggestions against reviewer decisions before the workflow affects service outcomes.",
        ],
        cons: [
          "Fairness risk depends on the distribution and history of source records, which should be validated before piloting.",
          "A narrow sample of examples may make the solution appear more consistent than it would be across real operating conditions.",
        ],
        mitigationIdeas: [
          "Review the proposed taxonomy for categories that could create unequal treatment or hidden proxies.",
          "Evaluate performance across request types, business areas, and urgency levels.",
          "Exclude fields that are not justified for the task, especially names or attributes unrelated to routing quality.",
          "Document an appeal or correction path for users affected by incorrect classification.",
        ],
      };
    case "privacy-data-protection":
      return {
        explanation: `This request would likely process ${context.dataSources}. Privacy risk is driven not only by intended classification fields, but also by incidental information that can appear in free text, attachments, comments, or historical records.`,
        concerns: [
          `${context.primaryDataSource} may include personal information, confidential business context, or content unrelated to the task.`,
          "The request does not yet define which fields are necessary for classification versus which should be excluded, masked, or summarized.",
          "Retention expectations for prompts, examples, evaluation sets, and generated classifications should be defined before piloting.",
          sensitivityText,
        ],
        pros: [
          "The intended use is analytical support and can likely begin with minimized examples.",
          "Existing process guidance may help constrain the output to approved categories and reduce unnecessary data exposure.",
          "Keeping final decisions with accountable staff provides a checkpoint for sensitive or unusual requests.",
        ],
        cons: [
          "Free-text operational data can contain more sensitive information than expected.",
          "Data minimization will be important; the solution may not need full message bodies, attachments, or complete records for every scenario.",
          "Access controls for the AI workflow must align with source-system permissions.",
        ],
        mitigationIdeas: [
          "Define an approved field list before prototyping.",
          "Use redacted, minimized, or synthetic examples for early evaluation where feasible.",
          "Exclude attachments and unrelated free-text fields unless a specific need is justified.",
          "Define retention, access, and audit expectations for prompts, examples, and generated outputs.",
          "Add a pre-processing step to detect and mask sensitive content where feasible.",
        ],
      };
    case "security-robustness":
      return {
        explanation: `${context.title} would introduce an AI-assisted layer around ${context.dataSources}. Security and robustness matter because source content could be incomplete, manipulated, or include instructions that should not affect the system's behavior.`,
        concerns: [
          "Free-text inputs may include prompt-injection-style instructions, copied content, or malformed records.",
          "The workflow should prevent generated recommendations from exposing source data to users who lack permission.",
          "System failure modes are not yet defined for missing fields, conflicting categories, or unavailable source systems.",
        ],
        pros: [
          "The proposed output can be constrained to classification, prioritization, and rationale rather than direct system action.",
          "Existing source systems and guidelines can provide boundaries for allowed categories and routing options.",
          "A staged pilot can test robustness against edge cases before broader use.",
        ],
        cons: [
          "Security controls must cover both input handling and generated output, especially where records contain sensitive context.",
          "Robustness depends on clear fallback behavior when confidence is low or inputs are ambiguous.",
        ],
        mitigationIdeas: [
          "Constrain model instructions and outputs to an approved schema with allowed categories.",
          "Strip or ignore user-provided instructions embedded in source records.",
          "Apply source-system access controls to both input records and generated outputs.",
          "Define fallback behavior for low-confidence, malformed, or policy-sensitive cases.",
          "Test adversarial and unusual examples before piloting.",
        ],
      };
    case "transparency-explainability":
      return {
        explanation: `${context.affectedUsers} would need to understand why Marit recommends a category, priority, tool fit, or next step. Transparency is important because reviewers must be able to challenge the suggestion without reconstructing the analysis from scratch.`,
        concerns: [
          "The request does not yet specify what rationale should be shown to reviewers or requestors.",
          "If only a label or score is shown, reviewers may not know which inputs influenced the recommendation.",
          "Explanations may become misleading if they are too generic or do not cite the relevant business facts.",
        ],
        pros: [
          "The business case includes a clear pain point and desired outcome that can anchor explanations.",
          "Structured categories and guidelines can make rationale easier to review.",
          "Reviewers can compare the AI rationale against existing process expectations.",
        ],
        cons: [
          "Explanations should not imply certainty beyond the available intake details and representative data.",
          "A score without supporting evidence may create a false sense of precision.",
        ],
        mitigationIdeas: [
          "Show the main evidence used for each recommendation, such as category signals, urgency indicators, and data gaps.",
          "Label AI output clearly as advisory and subject to AI Builder review.",
          "Include confidence or uncertainty notes where inputs are incomplete.",
          "Use consistent explanation templates so reviewers can compare cases fairly.",
        ],
      };
    case "accountability-governance":
      return {
        explanation: `${context.title} would require clear ownership across the business area, AI Lab, data owners, and any tool owners involved in ${context.toolFit}. Governance matters because the assessment may influence prioritization and future prototype decisions.`,
        concerns: [
          "Accountable owners for data, model behavior, reviewer decisions, and operational outcomes are not fully defined.",
          "The handoff between business requestor, AI Builder, and technical owner should be clarified before piloting.",
          "Ongoing monitoring responsibilities would need to be assigned if the solution moves beyond discovery.",
        ],
        pros: [
          "The request is structured enough to identify likely business and AI Lab owners.",
          "Existing process constraints can be converted into governance checkpoints.",
          "The AI Builder review step creates a natural control point before prototype approval.",
        ],
        cons: [
          "Governance gaps can lead to unclear responsibility when outputs are wrong, disputed, or outdated.",
          "A pilot without documented ownership may be difficult to evaluate or retire safely.",
        ],
        mitigationIdeas: [
          "Name accountable business, AI Lab, data, and tool owners before prototyping.",
          "Define review criteria, sign-off expectations, and escalation paths.",
          "Document what the system is allowed to recommend and what remains outside scope.",
          "Set monitoring and revalidation expectations before production use.",
        ],
      };
    case "legal-regulatory-compliance":
      return {
        explanation: `${pillarName} should be considered because ${context.title} may affect operational handling, prioritization, communications, or records management. The AI Lab should confirm applicable policy, regulatory, contractual, and retention requirements before piloting.`,
        concerns: [
          "The request does not yet identify all policies or obligations that govern the source records and generated outputs.",
          "If recommendations influence urgency or routing, auditability and dispute handling may be required.",
          "Generated summaries or categories may become business records depending on how they are stored and used.",
        ],
        pros: [
          "The solution can remain advisory while legal, compliance, and policy constraints are clarified.",
          "Existing routing guidelines and process documentation can help define allowed outputs.",
          "Human review provides a point to catch cases requiring specialist interpretation.",
        ],
        cons: [
          "The assessment should not be treated as legal or regulatory approval.",
          "Compliance expectations may vary by data source, geography, business area, or record type.",
        ],
        mitigationIdeas: [
          "Confirm applicable policies, retention rules, and audit obligations with accountable owners.",
          "Define whether generated classifications or summaries become records of decision.",
          "Include escalation criteria for cases that require legal, compliance, privacy, or risk review.",
          "Keep output advisory until compliance obligations and controls are validated.",
        ],
      };
    case "data-quality-provenance":
      return {
        explanation: `${context.title} depends on the quality and representativeness of ${context.dataSources}. Data quality and provenance matter because inconsistent labels, incomplete records, or outdated guidelines could directly affect classification and prioritization quality.`,
        concerns: [
          "Historical records may reflect inconsistent categorization or routing practices from the current process.",
          "The request does not yet define a representative evaluation set or quality benchmark.",
          "Source lineage should be clear enough to explain where each recommendation came from.",
        ],
        pros: [
          `${businessCase.knownDataSources.length} source area(s) have been identified, which gives discovery a practical starting point.`,
          "Existing guidelines may provide a reference taxonomy for evaluation.",
          "Reviewer overrides can create useful feedback about label quality and ambiguous cases.",
        ],
        cons: [
          "Poor source labels could make the AI appear consistent while reproducing historical inconsistency.",
          "A narrow sample may miss rare, sensitive, or high-impact request types.",
        ],
        mitigationIdeas: [
          "Profile source examples for missing fields, duplicates, conflicting labels, and outdated categories.",
          "Create a representative evaluation set reviewed by business owners.",
          "Document source provenance and version of any guideline used for classification.",
          "Track data-quality gaps separately from model-quality issues during pilot evaluation.",
        ],
      };
    case "reliability-performance":
      return {
        explanation: `${context.affectedUsers} would rely on the solution to provide consistent, timely, and reviewable support for ${context.desiredOutcome}. Reliability risk depends on how often recommendations are wrong, delayed, incomplete, or difficult to override.`,
        concerns: [
          "Quality thresholds for acceptable classification, prioritization, or summarization have not been defined.",
          "The workflow should specify what happens when confidence is low or recommended tools disagree.",
          "Performance expectations may differ during peak volume, urgent requests, or unusual categories.",
        ],
        pros: [
          "The requested output can be evaluated against reviewer decisions before it affects downstream actions.",
          "A constrained taxonomy and clear success measures can make reliability measurable.",
          "The AI Lab can compare recommendations to current process outcomes during discovery.",
        ],
        cons: [
          "Reliability cannot be inferred from intake details alone; it should be validated with representative, approved data.",
          "High urgency may amplify the impact of incorrect recommendations if reviewers are under time pressure.",
        ],
        mitigationIdeas: [
          "Define quality metrics such as category accuracy, urgency agreement, reviewer override rate, and time saved.",
          "Set confidence thresholds and fallback behavior for uncertain cases.",
          "Pilot with a parallel-run period before relying on recommendations operationally.",
          "Monitor errors by request type and urgency level.",
        ],
      };
    case "social-environmental-reputational-impact":
      return {
        explanation: `${pillarName} is relevant because ${context.title} could affect stakeholder trust, service quality, workload distribution, and perceptions of how AI is used in internal processes.`,
        concerns: [
          "Users may perceive prioritization suggestions as final decisions if the advisory nature is not clear.",
          "Incorrect or unexplained recommendations could reduce trust in the AI Lab and the underlying business process.",
          "Workload or service impacts should be considered if the tool changes which requests receive attention first.",
        ],
        pros: [
          "The request aims to improve consistency and reduce manual effort rather than replace accountable staff.",
          "Keeping reviewers involved can support trust if outputs are transparent and correctable.",
          "A focused pilot can gather stakeholder feedback before broader rollout.",
        ],
        cons: [
          "Perceived unfairness or opacity can create reputational risk even if the technical model performs well.",
          "Efficiency gains should be balanced against user experience and accountability expectations.",
        ],
        mitigationIdeas: [
          "Communicate that AI output is advisory and reviewed by accountable staff.",
          "Collect feedback from affected users during pilot evaluation.",
          "Monitor whether recommendations shift response quality or workload in unintended ways.",
          "Define success measures that include quality, trust, and operational impact, not only time savings.",
        ],
      };
    default:
      return {
        explanation: `${pillarName} should be reviewed for ${context.title} because the request may affect business decisions, data handling, or operational workflows.`,
        concerns: ["The specific control expectations for this pillar should be clarified before piloting."],
        pros: ["The structured intake provides a starting point for AI Builder review."],
        cons: ["Additional discovery is needed before production use."],
        mitigationIdeas: ["Define review criteria, ownership, and controls before piloting."],
      };
  }
}

function buildCaseContext(
  businessCase: BusinessCase,
  recommendedTools: ToolRecommendation[],
): CaseContext {
  return {
    title: `"${businessCase.title}"`,
    affectedUsers: businessCase.affectedPeople ?? businessCase.expectedUsers ?? "the affected business users",
    dataSources:
      businessCase.knownDataSources.length > 0
        ? businessCase.knownDataSources.join(", ")
        : "the relevant business records",
    primaryDataSource: businessCase.knownDataSources[0] ?? "the source records",
    currentProcess: businessCase.currentProcess ?? "the current manual process",
    desiredOutcome: businessCase.desiredOutcome,
    constraints:
      businessCase.constraints && businessCase.constraints.length > 0
        ? `The request already notes constraints that should inform controls: ${businessCase.constraints.join("; ")}.`
        : "The intake should be expanded to capture explicit constraints and control expectations.",
    toolFit:
      recommendedTools.length > 0
        ? recommendedTools.map((tool) => tool.toolId).join(", ")
        : "the candidate AI tooling",
  };
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
