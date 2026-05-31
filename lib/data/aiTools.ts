import type { AITool } from "../domain/types";

type SeedAITool = Omit<
  AITool,
  | "provider"
  | "supportedInputTypes"
  | "supportedOutputTypes"
  | "deploymentModel"
  | "dataSensitivitySuitability"
  | "integrationOptions"
  | "supportedLanguages"
  | "accessibilityConsiderations"
  | "responsibleAiNotes"
  | "securityPrivacyNotes"
  | "status"
  | "lastReviewedAt"
> &
  Partial<
    Pick<
      AITool,
      | "provider"
      | "supportedInputTypes"
      | "supportedOutputTypes"
      | "deploymentModel"
      | "dataSensitivitySuitability"
      | "integrationOptions"
      | "supportedLanguages"
      | "accessibilityConsiderations"
      | "responsibleAiNotes"
      | "securityPrivacyNotes"
      | "status"
      | "lastReviewedAt"
    >
  >;

function seedTool(tool: SeedAITool): AITool {
  return {
    provider: "Internal AI Platform",
    supportedInputTypes: ["text", "documents"],
    supportedOutputTypes: ["summary", "recommendations"],
    deploymentModel: "internalPlatform",
    dataSensitivitySuitability: ["public", "internal", "confidential"],
    integrationOptions: ["api", "microsoft365"],
    supportedLanguages: {
      english: true,
      french: true,
    },
    accessibilityConsiderations:
      "Review generated outputs in accessible Microsoft 365 or web experiences before sharing.",
    responsibleAiNotes:
      "Use as decision support only; accountable teams must review outputs before acting.",
    securityPrivacyNotes:
      "Use approved data handling controls and avoid restricted data unless explicitly cleared.",
    status: "available",
    lastReviewedAt: "2026-05-30",
    ...tool,
  };
}

export const aiTools: AITool[] = [
  seedTool({
    id: "tool-document-intelligence-extractor",
    name: "Document Intelligence Extractor",
    provider: "Azure AI Document Intelligence",
    shortDescription: "Extracts structured fields and summaries from standardized business documents.",
    capabilities: ["documentExtraction", "summarization"],
    suitableUseCases: ["contract review preparation", "invoice field extraction", "document intake triage"],
    supportedInputTypes: ["documents", "images"],
    supportedOutputTypes: ["extractedData", "summary"],
    deploymentModel: "azureService",
    integrationOptions: ["api", "customConnector"],
    limitations: ["Works best with consistent document formats", "Requires sampled documents for validation"],
    riskProfile: {
      supportedDataSensitivity: ["low", "medium"],
      riskNotes: ["Review extracted fields before business use", "Avoid highly sensitive documents unless controls are approved"],
      requiresHumanReview: true,
    },
    implementationComplexity: "medium",
  }),
  seedTool({
    id: "tool-knowledge-search-assistant",
    name: "Knowledge Search Assistant",
    shortDescription: "Searches approved internal knowledge sources and returns cited summaries.",
    capabilities: ["knowledgeSearch", "summarization", "policyQuestionAnswering"],
    suitableUseCases: ["internal knowledge discovery", "policy lookup", "research acceleration"],
    supportedInputTypes: ["text", "documents", "structuredData"],
    supportedOutputTypes: ["text", "summary", "recommendations"],
    integrationOptions: ["api", "microsoft365", "customConnector"],
    limitations: ["Requires curated source collections", "Answers are limited by indexed content quality"],
    riskProfile: {
      supportedDataSensitivity: ["low", "medium"],
      riskNotes: ["Citations should be checked", "Access controls matter before production use"],
      requiresHumanReview: true,
    },
    implementationComplexity: "medium",
  }),
  seedTool({
    id: "tool-meeting-summarization-assistant",
    name: "Meeting Summarization Assistant",
    provider: "Microsoft 365 Copilot",
    shortDescription: "Summarizes meeting transcripts into decisions, actions, risks, and follow-ups.",
    capabilities: ["summarization", "drafting"],
    suitableUseCases: ["project meeting notes", "workshop synthesis", "action item drafting"],
    supportedInputTypes: ["text", "audio"],
    supportedOutputTypes: ["summary", "generatedContent"],
    deploymentModel: "approvedVendor",
    integrationOptions: ["microsoft365", "uiOnly"],
    limitations: ["Transcript quality affects output", "Sensitive discussions need clear handling rules"],
    riskProfile: {
      supportedDataSensitivity: ["low", "medium"],
      riskNotes: ["Participants should know transcripts are summarized", "Review actions before sharing"],
      requiresHumanReview: true,
    },
    implementationComplexity: "low",
  }),
  seedTool({
    id: "tool-translation-terminology-assistant",
    name: "Translation and Terminology Assistant",
    shortDescription: "Drafts English and Canadian French translations using approved terminology.",
    capabilities: ["translation", "drafting"],
    suitableUseCases: ["bilingual communications", "terminology alignment", "first-pass content translation"],
    supportedInputTypes: ["text", "documents"],
    supportedOutputTypes: ["text", "generatedContent"],
    integrationOptions: ["api", "uiOnly", "microsoft365"],
    limitations: ["Needs human review for nuance", "Not suitable for legal final copy without review"],
    riskProfile: {
      supportedDataSensitivity: ["low", "medium"],
      riskNotes: ["Human review is required for public or regulated content"],
      requiresHumanReview: true,
    },
    implementationComplexity: "low",
  }),
  seedTool({
    id: "tool-workflow-triage-copilot",
    name: "Workflow Triage Copilot",
    shortDescription: "Classifies incoming requests and recommends routing based on known patterns.",
    capabilities: ["workflowTriage", "summarization"],
    suitableUseCases: ["support queue triage", "request classification", "priority suggestion"],
    supportedInputTypes: ["text", "email", "structuredData"],
    supportedOutputTypes: ["classification", "recommendations", "summary"],
    integrationOptions: ["api", "workflowAutomation", "customConnector"],
    limitations: ["Requires labelled examples", "Should not auto-approve or auto-reject requests"],
    riskProfile: {
      supportedDataSensitivity: ["low", "medium"],
      riskNotes: ["Bias in historical labels can affect routing", "Use human oversight for edge cases"],
      requiresHumanReview: true,
    },
    implementationComplexity: "medium",
  }),
  seedTool({
    id: "tool-data-quality-analyzer",
    name: "Data Quality Analyzer",
    shortDescription: "Profiles datasets for completeness, consistency, duplicates, and quality concerns.",
    capabilities: ["dataQuality"],
    suitableUseCases: ["data readiness checks", "quality issue discovery", "migration preparation"],
    supportedInputTypes: ["structuredData", "documents"],
    supportedOutputTypes: ["classification", "recommendations", "extractedData"],
    dataSensitivitySuitability: ["public", "internal", "confidential", "restricted"],
    integrationOptions: ["api", "customConnector"],
    limitations: ["Requires access to representative data samples", "Does not resolve quality issues automatically"],
    riskProfile: {
      supportedDataSensitivity: ["low", "medium", "high"],
      riskNotes: ["Use aggregated or masked data where possible", "Confirm access rules before data profiling"],
      requiresHumanReview: true,
    },
    implementationComplexity: "medium",
  }),
  seedTool({
    id: "tool-policy-qa-assistant",
    name: "Policy Q&A Assistant",
    shortDescription: "Answers questions from approved policies with citations and uncertainty notes.",
    capabilities: ["policyQuestionAnswering", "knowledgeSearch"],
    suitableUseCases: ["policy interpretation support", "employee self-service", "control lookup"],
    supportedInputTypes: ["text", "documents"],
    supportedOutputTypes: ["text", "summary", "recommendations"],
    integrationOptions: ["api", "microsoft365", "uiOnly"],
    limitations: ["Cannot replace formal policy advice", "Needs curated and current policy sources"],
    riskProfile: {
      supportedDataSensitivity: ["low", "medium"],
      riskNotes: ["Answers need citations", "Escalate ambiguous policy questions to accountable owners"],
      requiresHumanReview: true,
    },
    implementationComplexity: "medium",
  }),
];
