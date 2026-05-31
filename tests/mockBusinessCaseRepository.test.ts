import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BusinessCase, BusinessCaseAssessment } from "../lib/domain/types";
import {
  createLocalStorageBusinessCaseRepository,
  mergeSeededAndStored,
  readStoredArray,
} from "../lib/data/mockBusinessCaseRepository";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("mock business case repository helpers", () => {
  it("reads invalid stored arrays as empty arrays", () => {
    const storage = new MemoryStorage();
    storage.setItem("bad", "{");

    assert.deepEqual(readStoredArray(storage, "bad"), []);
  });

  it("keeps stored items after seeded items and avoids duplicate ids", () => {
    const merged = mergeSeededAndStored([{ id: "seed" }, { id: "duplicate" }], [
      { id: "duplicate" },
      { id: "stored" },
    ]);

    assert.deepEqual(merged, [{ id: "seed" }, { id: "duplicate" }, { id: "stored" }]);
  });

  it("persists submitted cases and assessments", () => {
    const storage = new MemoryStorage();
    const repository = createLocalStorageBusinessCaseRepository(storage);
    const businessCase = {
      id: "case-submitted",
      title: "Submitted case",
      team: "operations",
      submitterUserId: "user-business-operations",
      painPoint: "A sufficiently detailed fictional pain point for repository testing.",
      desiredOutcome: "A sufficiently detailed desired outcome.",
      impactStatement: "Expected benefits: saveTime.",
      knownDataSources: ["mock data"],
      dataSensitivity: "low",
      urgency: "medium",
      status: "ready",
      createdAt: "2026-05-30T12:00:00.000Z",
      updatedAt: "2026-05-30T12:00:00.000Z",
    } satisfies BusinessCase;
    const assessment = {
      id: "assessment-case-submitted",
      businessCaseId: businessCase.id,
      generatedAt: "2026-05-30T12:00:00.000Z",
      generatedBy: "deterministicMock",
      feasibility: {
        score: { value: 50, level: "moderate", explanation: "test" },
        summary: "test",
        positiveSignals: [],
        gaps: [],
      },
      recommendedTools: [],
      pillarAssessments: [],
      concerns: [],
      pros: [],
      cons: [],
      mitigationIdeas: [],
      recommendation: "proceedToDiscovery",
      recommendedNextStep: "test",
      overallScore: { value: 50, level: "moderate", explanation: "test" },
      confidence: "medium",
    } satisfies BusinessCaseAssessment;

    repository.saveBusinessCaseWithAssessment(businessCase, assessment);

    assert.ok(repository.listBusinessCases().some((item) => item.id === businessCase.id));
    assert.deepEqual(repository.listAssessments(), [assessment]);
  });
});
