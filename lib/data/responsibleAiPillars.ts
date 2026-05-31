import type { ResponsibleAIPillar } from "../domain/types";

export const responsibleAiPillars: ResponsibleAIPillar[] = [
  {
    id: "human-oversight",
    order: 1,
    name: "Human oversight",
    description: "People remain meaningfully involved in review, escalation, and final decisions.",
  },
  {
    id: "fairness-non-discrimination",
    order: 2,
    name: "Fairness and non-discrimination",
    description: "The idea should not create or amplify unfair outcomes for people or groups.",
  },
  {
    id: "privacy-data-protection",
    order: 3,
    name: "Privacy and data protection",
    description: "Personal and confidential data use should be limited, justified, and protected.",
  },
  {
    id: "security-robustness",
    order: 4,
    name: "Security and robustness",
    description: "The solution should resist misuse, data leakage, prompt injection, and fragile failure modes.",
  },
  {
    id: "transparency-explainability",
    order: 5,
    name: "Transparency and explainability",
    description: "Users should understand when AI is used, what it considered, and how much to trust it.",
  },
  {
    id: "accountability-governance",
    order: 6,
    name: "Accountability and governance",
    description: "Ownership, review responsibilities, and governance fit should be clear.",
  },
  {
    id: "legal-regulatory-compliance",
    order: 7,
    name: "Legal and regulatory compliance",
    description: "The idea should be checked against legal, regulatory, contractual, and policy constraints.",
  },
  {
    id: "data-quality-provenance",
    order: 8,
    name: "Data quality and provenance",
    description: "Input data should be available, usable, representative, traceable, and maintainable.",
  },
  {
    id: "reliability-performance",
    order: 9,
    name: "Reliability and performance",
    description: "The solution should have clear quality expectations, failure handling, and performance needs.",
  },
  {
    id: "social-environmental-reputational-impact",
    order: 10,
    name: "Social, environmental, and reputational impact",
    description: "Broader stakeholder, trust, environmental, and reputational impacts should be considered.",
  },
];
