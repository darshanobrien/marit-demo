import type {
  AITool,
  AIToolCapability,
  AIToolDataSensitivitySuitability,
  AIToolDeploymentModel,
  AIToolInputType,
  AIToolIntegrationOption,
  AIToolOutputType,
  AIToolStatus,
  DemoRole,
} from "../domain/types";

export const aiToolInputTypeOptions: AIToolInputType[] = [
  "text",
  "documents",
  "images",
  "structuredData",
  "email",
  "code",
  "audio",
];

export const aiToolCapabilityOptions: AIToolCapability[] = [
  "documentExtraction",
  "knowledgeSearch",
  "summarization",
  "translation",
  "workflowTriage",
  "dataQuality",
  "policyQuestionAnswering",
  "drafting",
];

export const aiToolOutputTypeOptions: AIToolOutputType[] = [
  "text",
  "classification",
  "summary",
  "extractedData",
  "recommendations",
  "generatedContent",
];

export const aiToolDeploymentModelOptions: AIToolDeploymentModel[] = [
  "saas",
  "internalPlatform",
  "azureService",
  "localPrivate",
  "approvedVendor",
];

export const aiToolDataSensitivityOptions: AIToolDataSensitivitySuitability[] = [
  "public",
  "internal",
  "confidential",
  "restricted",
];

export const aiToolIntegrationOptionOptions: AIToolIntegrationOption[] = [
  "api",
  "uiOnly",
  "microsoft365",
  "workflowAutomation",
  "customConnector",
];

export const aiToolStatusOptions: AIToolStatus[] = [
  "available",
  "pilot",
  "restricted",
  "deprecated",
];

export type AIToolFormValues = {
  name: string;
  provider: string;
  shortDescription: string;
  capabilities: AIToolCapability[];
  suitableUseCases: string;
  supportedInputTypes: AIToolInputType[];
  supportedOutputTypes: AIToolOutputType[];
  deploymentModel: AIToolDeploymentModel | "";
  dataSensitivitySuitability: AIToolDataSensitivitySuitability[];
  requiresHumanReview: boolean;
  integrationOptions: AIToolIntegrationOption[];
  supportsEnglish: boolean;
  supportsFrench: boolean;
  accessibilityConsiderations: string;
  responsibleAiNotes: string;
  securityPrivacyNotes: string;
  status: AIToolStatus | "";
  lastReviewedAt: string;
};

export type AIToolFormField = keyof AIToolFormValues;
export type AIToolValidationCode = "required" | "minSelected" | "languageRequired";

export type AIToolValidationError = {
  field: AIToolFormField;
  code: AIToolValidationCode;
};

export const emptyAIToolFormValues: AIToolFormValues = {
  name: "",
  provider: "",
  shortDescription: "",
  capabilities: [],
  suitableUseCases: "",
  supportedInputTypes: [],
  supportedOutputTypes: [],
  deploymentModel: "",
  dataSensitivitySuitability: [],
  requiresHumanReview: true,
  integrationOptions: [],
  supportsEnglish: true,
  supportsFrench: false,
  accessibilityConsiderations: "",
  responsibleAiNotes: "",
  securityPrivacyNotes: "",
  status: "available",
  lastReviewedAt: "",
};

export function canAccessAdminTools(role: DemoRole): boolean {
  return role === "admin";
}

export function visiblePagesForRole<T extends string>(pages: T[], role: DemoRole): T[] {
  if (canAccessAdminTools(role)) {
    return pages;
  }

  return pages.filter((page) => page !== "adminTools");
}

export function validateAIToolForm(values: AIToolFormValues): AIToolValidationError[] {
  const errors: AIToolValidationError[] = [];

  addRequiredTextError(errors, values, "name");
  addRequiredTextError(errors, values, "provider");
  addRequiredTextError(errors, values, "shortDescription");
  addMinSelectedError(errors, values, "capabilities");
  addRequiredTextError(errors, values, "suitableUseCases");
  addMinSelectedError(errors, values, "supportedInputTypes");
  addMinSelectedError(errors, values, "supportedOutputTypes");
  addRequiredChoiceError(errors, values, "deploymentModel");
  addMinSelectedError(errors, values, "dataSensitivitySuitability");
  addMinSelectedError(errors, values, "integrationOptions");
  addLanguageError(errors, values);
  addRequiredTextError(errors, values, "accessibilityConsiderations");
  addRequiredTextError(errors, values, "responsibleAiNotes");
  addRequiredTextError(errors, values, "securityPrivacyNotes");
  addRequiredChoiceError(errors, values, "status");
  addRequiredTextError(errors, values, "lastReviewedAt");

  return errors;
}

export function createAIToolFromForm(
  values: AIToolFormValues,
  options: {
    id: string;
  },
): AITool {
  return {
    id: options.id,
    name: values.name.trim(),
    provider: values.provider.trim(),
    shortDescription: values.shortDescription.trim(),
    capabilities: values.capabilities,
    suitableUseCases: splitList(values.suitableUseCases),
    supportedInputTypes: values.supportedInputTypes,
    supportedOutputTypes: values.supportedOutputTypes,
    deploymentModel: values.deploymentModel || "internalPlatform",
    dataSensitivitySuitability: values.dataSensitivitySuitability,
    integrationOptions: values.integrationOptions,
    supportedLanguages: {
      english: values.supportsEnglish,
      french: values.supportsFrench,
    },
    accessibilityConsiderations: values.accessibilityConsiderations.trim(),
    responsibleAiNotes: values.responsibleAiNotes.trim(),
    securityPrivacyNotes: values.securityPrivacyNotes.trim(),
    status: values.status || "available",
    lastReviewedAt: values.lastReviewedAt,
    limitations: [],
    riskProfile: {
      supportedDataSensitivity: mapSensitivitySuitability(values.dataSensitivitySuitability),
      riskNotes: [values.securityPrivacyNotes.trim(), values.responsibleAiNotes.trim()].filter(Boolean),
      requiresHumanReview: values.requiresHumanReview,
    },
    implementationComplexity: "medium",
  };
}

function addRequiredTextError(
  errors: AIToolValidationError[],
  values: AIToolFormValues,
  field: AIToolFormField,
) {
  const value = values[field];

  if (typeof value === "string" && value.trim().length === 0) {
    errors.push({ field, code: "required" });
  }
}

function addRequiredChoiceError(
  errors: AIToolValidationError[],
  values: AIToolFormValues,
  field: AIToolFormField,
) {
  if (!values[field]) {
    errors.push({ field, code: "required" });
  }
}

function addMinSelectedError(
  errors: AIToolValidationError[],
  values: AIToolFormValues,
  field: AIToolFormField,
) {
  const value = values[field];

  if (Array.isArray(value) && value.length === 0) {
    errors.push({ field, code: "minSelected" });
  }
}

function addLanguageError(errors: AIToolValidationError[], values: AIToolFormValues) {
  if (!values.supportsEnglish && !values.supportsFrench) {
    errors.push({ field: "supportsEnglish", code: "languageRequired" });
  }
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapSensitivitySuitability(values: AIToolDataSensitivitySuitability[]) {
  const levels = new Set<AITool["riskProfile"]["supportedDataSensitivity"][number]>();

  if (values.includes("public")) {
    levels.add("low");
  }

  if (values.includes("internal") || values.includes("confidential")) {
    levels.add("medium");
  }

  if (values.includes("restricted")) {
    levels.add("high");
  }

  return Array.from(levels);
}
