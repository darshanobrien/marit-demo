import type { BusinessCase, BusinessCaseAssessment } from "../domain/types";
import { businessCases } from "./businessCases";

const businessCasesStorageKey = "marit.businessCases.v1";
const assessmentsStorageKey = "marit.assessments.v1";

export type MockBusinessCaseRepository = {
  listBusinessCases: () => BusinessCase[];
  listAssessments: () => BusinessCaseAssessment[];
  saveBusinessCaseWithAssessment: (
    businessCase: BusinessCase,
    assessment: BusinessCaseAssessment,
  ) => void;
};

export function createLocalStorageBusinessCaseRepository(
  storage: Storage,
): MockBusinessCaseRepository {
  return {
    listBusinessCases() {
      return mergeSeededAndStored(businessCases, readStoredArray<BusinessCase>(storage, businessCasesStorageKey));
    },
    listAssessments() {
      return readStoredArray<BusinessCaseAssessment>(storage, assessmentsStorageKey);
    },
    saveBusinessCaseWithAssessment(businessCase, assessment) {
      const storedCases = upsertById(
        readStoredArray<BusinessCase>(storage, businessCasesStorageKey),
        businessCase,
      );
      const storedAssessments = upsertById(
        readStoredArray<BusinessCaseAssessment>(storage, assessmentsStorageKey),
        assessment,
      );

      storage.setItem(businessCasesStorageKey, JSON.stringify(storedCases));
      storage.setItem(assessmentsStorageKey, JSON.stringify(storedAssessments));
    },
  };
}

export function mergeSeededAndStored<T extends { id: string }>(seeded: T[], stored: T[]): T[] {
  const storedIds = new Set(stored.map((item) => item.id));
  return [...seeded.filter((item) => !storedIds.has(item.id)), ...stored];
}

export function readStoredArray<T>(storage: Storage, key: string): T[] {
  const stored = storage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function upsertById<T extends { id: string }>(items: T[], nextItem: T): T[] {
  const existingIndex = items.findIndex((item) => item.id === nextItem.id);

  if (existingIndex === -1) {
    return [...items, nextItem];
  }

  return items.map((item, index) => (index === existingIndex ? nextItem : item));
}
