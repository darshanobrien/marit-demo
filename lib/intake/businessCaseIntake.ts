import type {
  BusinessArea,
  BusinessCase,
  BusinessCasePriority,
  ExpectedBenefit,
  IntakeDataSensitivity,
  IntakeUrgency,
  DataSensitivityLevel,
} from "../domain/types";

export const businessAreaOptions: BusinessArea[] = [
  "finance",
  "hrPeople",
  "legal",
  "risk",
  "marketing",
  "sales",
  "operations",
  "its",
  "audit",
  "financialTransformation",
  "clientService",
  "knowledgeManagement",
  "other",
];

export const dataSensitivityOptions: IntakeDataSensitivity[] = [
  "public",
  "confidential",
  "restricted",
  "pii",
  "unknown",
];

export const urgencyOptions: IntakeUrgency[] = ["low", "medium", "high", "critical"];

export const expectedBenefitOptions: ExpectedBenefit[] = [
  "saveTime",
  "reduceManualEffort",
  "improveQualityConsistency",
  "reduceRisk",
  "improveDecisionMaking",
  "improveEmployeeExperience",
  "improveClientServiceExperience",
  "reduceCost",
  "increaseRevenue",
  "other",
];

export type IntakeFormValues = {
  title: string;
  businessArea: BusinessArea | "";
  painPoint: string;
  currentProcess: string;
  desiredOutcome: string;
  affectedPeople: string;
  estimatedVolume: string;
  dataInvolved: string;
  dataSensitivity: IntakeDataSensitivity[];
  currentTools: string;
  urgency: IntakeUrgency | "";
  expectedBenefits: ExpectedBenefit[];
  constraints: string;
  imaginedAiSolution: string;
};

export type IntakeField = keyof IntakeFormValues;

export type IntakeValidationCode = "required" | "minLength" | "minSelected";

export type IntakeValidationError = {
  field: IntakeField;
  code: IntakeValidationCode;
  min?: number;
};

export const emptyIntakeFormValues: IntakeFormValues = {
  title: "",
  businessArea: "",
  painPoint: "",
  currentProcess: "",
  desiredOutcome: "",
  affectedPeople: "",
  estimatedVolume: "",
  dataInvolved: "",
  dataSensitivity: [],
  currentTools: "",
  urgency: "",
  expectedBenefits: [],
  constraints: "",
  imaginedAiSolution: "",
};

export const sampleIntakeFormValues: IntakeFormValues = {
  title: "Prioritize internal service desk requests",
  businessArea: "operations",
  painPoint:
    "Team coordinators manually read a shared inbox and decide which fictional requests need urgent attention, which creates inconsistent routing and delayed follow-up.",
  currentProcess:
    "Coordinators review the inbox several times a day, copy request summaries into a tracker, and assign owners based on local judgement.",
  desiredOutcome:
    "Create a suggested queue that groups requests by topic and urgency so coordinators can review and route work more consistently.",
  affectedPeople: "Operations coordinators, team leads, and internal service desk requestors.",
  estimatedVolume: "About 120 fictional internal requests per week during peak planning periods.",
  dataInvolved:
    "Fictional request summaries, mock routing guidelines, synthetic topic labels, and demo-only status history.",
  dataSensitivity: ["public"],
  currentTools: "Shared mailbox, spreadsheet tracker, and internal guidance pages.",
  urgency: "high",
  expectedBenefits: ["saveTime", "reduceManualEffort", "improveQualityConsistency"],
  constraints:
    "Use fictional examples only, keep a human coordinator in the loop, and do not connect to real mailboxes.",
  imaginedAiSolution:
    "A triage assistant that suggests topic, urgency, and next owner for human review.",
};

export function validateIntakeForm(values: IntakeFormValues): IntakeValidationError[] {
  const errors: IntakeValidationError[] = [];

  addRequiredTextError(errors, values, "title");
  addRequiredChoiceError(errors, values, "businessArea");
  addRequiredTextError(errors, values, "painPoint");
  addMinLengthError(errors, values, "painPoint", 40);
  addRequiredTextError(errors, values, "desiredOutcome");
  addMinLengthError(errors, values, "desiredOutcome", 20);
  addRequiredTextError(errors, values, "affectedPeople");
  addRequiredTextError(errors, values, "dataInvolved");
  addMinSelectedError(errors, values, "dataSensitivity");
  addRequiredChoiceError(errors, values, "urgency");
  addMinSelectedError(errors, values, "expectedBenefits");

  return errors;
}

export function createBusinessCaseFromIntake(
  values: IntakeFormValues,
  options: {
    id: string;
    now: string;
    submitterUserId: string;
  },
): BusinessCase {
  const knownDataSources = splitList(values.dataInvolved);
  const constraints = splitList(values.constraints);

  return {
    id: options.id,
    title: values.title.trim(),
    businessArea: values.businessArea || undefined,
    team: values.businessArea || "other",
    submitterUserId: options.submitterUserId,
    painPoint: values.painPoint.trim(),
    currentProcess: optionalText(values.currentProcess),
    desiredOutcome: values.desiredOutcome.trim(),
    impactStatement: buildImpactStatement(values),
    affectedPeople: values.affectedPeople.trim(),
    estimatedVolume: optionalText(values.estimatedVolume),
    knownDataSources,
    dataSensitivity: mapIntakeDataSensitivity(values.dataSensitivity),
    dataSensitivitySelections: values.dataSensitivity,
    urgency: mapIntakeUrgency(values.urgency),
    urgencySelection: values.urgency || undefined,
    currentTools: optionalText(values.currentTools),
    expectedBenefits: values.expectedBenefits,
    expectedUsers: values.affectedPeople.trim(),
    constraints,
    imaginedAiSolution: optionalText(values.imaginedAiSolution),
    status: "ready",
    createdAt: options.now,
    updatedAt: options.now,
  };
}

export function mapIntakeDataSensitivity(values: IntakeDataSensitivity[]): DataSensitivityLevel {
  if (values.includes("unknown")) {
    return "unknown";
  }

  if (values.includes("restricted") || values.includes("pii")) {
    return "high";
  }

  if (values.includes("confidential")) {
    return "medium";
  }

  return "low";
}

export function mapIntakeUrgency(value: IntakeUrgency | ""): BusinessCasePriority {
  return value === "critical" ? "high" : value || "low";
}

function addRequiredTextError(
  errors: IntakeValidationError[],
  values: IntakeFormValues,
  field: IntakeField,
) {
  const value = values[field];

  if (typeof value === "string" && value.trim().length === 0) {
    errors.push({ field, code: "required" });
  }
}

function addRequiredChoiceError(
  errors: IntakeValidationError[],
  values: IntakeFormValues,
  field: IntakeField,
) {
  if (!values[field]) {
    errors.push({ field, code: "required" });
  }
}

function addMinLengthError(
  errors: IntakeValidationError[],
  values: IntakeFormValues,
  field: IntakeField,
  min: number,
) {
  const value = values[field];

  if (typeof value === "string" && value.trim().length > 0 && value.trim().length < min) {
    errors.push({ field, code: "minLength", min });
  }
}

function addMinSelectedError(
  errors: IntakeValidationError[],
  values: IntakeFormValues,
  field: IntakeField,
) {
  const value = values[field];

  if (Array.isArray(value) && value.length === 0) {
    errors.push({ field, code: "minSelected" });
  }
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildImpactStatement(values: IntakeFormValues): string {
  return [
    values.desiredOutcome.trim(),
    values.expectedBenefits.length > 0
      ? `Expected benefits: ${values.expectedBenefits.join(", ")}.`
      : "",
    values.estimatedVolume.trim() ? `Estimated volume: ${values.estimatedVolume.trim()}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
