import type { BusinessCase } from "../domain/types";

export const businessCases: BusinessCase[] = [
  {
    id: "case-operations-triage",
    title: "Prioritize incoming operations requests",
    team: "Operations",
    submitterUserId: "user-business-operations",
    painPoint:
      "Operations coordinators manually read shared mailbox requests and decide urgency, routing, and follow-up owners.",
    currentProcess:
      "Requests are reviewed several times per day and copied into a tracker with inconsistent categorization.",
    desiredOutcome:
      "Classify requests by topic and urgency so coordinators can review a suggested queue instead of starting from scratch.",
    impactStatement:
      "Faster triage could reduce response time and help the team focus on high-impact requests.",
    knownDataSources: ["shared mailbox samples", "request tracker", "routing guidelines"],
    dataSensitivity: "medium",
    urgency: "high",
    expectedUsers: "Operations coordinators and team leads",
    constraints: ["Human review required before routing changes", "Exclude client data from the prototype scope"],
    status: "submitted",
    createdAt: "2026-05-26T14:00:00.000Z",
    updatedAt: "2026-05-26T14:00:00.000Z",
  },
  {
    id: "case-policy-search",
    title: "Help managers find policy answers faster",
    team: "People Operations",
    submitterUserId: "user-business-operations",
    painPoint:
      "Managers spend time searching multiple policy documents for answers to common employee process questions.",
    desiredOutcome:
      "Provide cited answers from approved policy documents and show when an HR specialist should review the question.",
    impactStatement: "Could reduce repeated policy lookup effort and improve consistency of responses.",
    knownDataSources: ["employee handbook", "manager guidance", "policy FAQ"],
    dataSensitivity: "low",
    urgency: "medium",
    expectedUsers: "Managers and HR partners",
    constraints: ["Must cite source policy", "Must not provide legal advice"],
    status: "submitted",
    createdAt: "2026-05-27T15:30:00.000Z",
    updatedAt: "2026-05-27T15:30:00.000Z",
  },
  {
    id: "case-data-readiness",
    title: "Assess quality of quarterly planning data",
    team: "Finance",
    submitterUserId: "user-business-operations",
    painPoint:
      "Finance analysts manually inspect planning spreadsheets for missing fields, duplicates, and inconsistent naming.",
    currentProcess: "Analysts run ad hoc checks and document issues in a separate workbook.",
    desiredOutcome:
      "Profile submitted planning files and summarize quality issues before analysts begin review.",
    impactStatement: "Could reduce manual checking and improve confidence in planning data.",
    knownDataSources: ["planning spreadsheets", "data dictionary"],
    dataSensitivity: "high",
    urgency: "medium",
    expectedUsers: "Finance analysts",
    constraints: ["Use masked samples for early evaluation", "No automatic data correction"],
    status: "assessed",
    createdAt: "2026-05-28T12:15:00.000Z",
    updatedAt: "2026-05-28T12:15:00.000Z",
  },
  {
    id: "case-bilingual-updates",
    title: "Draft bilingual project updates",
    team: "Transformation Office",
    submitterUserId: "user-business-operations",
    painPoint:
      "Project teams need English and Canadian French updates, but translation review creates delays for low-risk internal updates.",
    desiredOutcome:
      "Create first-pass Canadian French drafts using approved terminology so reviewers can focus on nuance.",
    impactStatement: "Could speed up internal communications while keeping human review in the loop.",
    knownDataSources: ["approved glossary", "prior internal updates", "style guidance"],
    dataSensitivity: "low",
    urgency: "low",
    expectedUsers: "Project managers and communications reviewers",
    constraints: ["Human review before distribution"],
    status: "submitted",
    createdAt: "2026-05-29T09:45:00.000Z",
    updatedAt: "2026-05-29T09:45:00.000Z",
  },
];
