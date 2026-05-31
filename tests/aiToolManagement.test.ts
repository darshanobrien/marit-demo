import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type AIToolFormValues,
  canAccessAdminTools,
  createAIToolFromForm,
  emptyAIToolFormValues,
  validateAIToolForm,
  visiblePagesForRole,
} from "../lib/admin/aiToolManagement";
import { aiTools } from "../lib/data";
import { createLocalStorageAIToolRepository } from "../lib/data/mockAiToolRepository";

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

describe("AI tools admin access", () => {
  it("allows admins to access the AI tools page", () => {
    assert.equal(canAccessAdminTools("admin"), true);
    assert.deepEqual(visiblePagesForRole(["home", "dashboard", "adminTools"], "admin"), [
      "home",
      "dashboard",
      "adminTools",
    ]);
  });

  it("prevents non-admin roles from accessing the AI tools page", () => {
    assert.equal(canAccessAdminTools("businessUser"), false);
    assert.equal(canAccessAdminTools("aiBuilder"), false);
    assert.deepEqual(visiblePagesForRole(["home", "dashboard", "adminTools"], "aiBuilder"), [
      "home",
      "dashboard",
    ]);
  });
});

describe("AI tools repository", () => {
  it("lists seeded AI tools", () => {
    const repository = createLocalStorageAIToolRepository(new MemoryStorage());

    assert.equal(repository.listTools().length, aiTools.length);
    assert.ok(repository.listTools().some((tool) => tool.name === "Knowledge Search Assistant"));
  });

  it("saves a valid AI tool and returns it in the list", () => {
    const repository = createLocalStorageAIToolRepository(new MemoryStorage());
    const tool = createAIToolFromForm(validFormValues(), {
      id: "tool-test-contract-review",
    });

    repository.saveTool(tool);

    assert.ok(repository.listTools().some((item) => item.id === "tool-test-contract-review"));
  });
});

describe("AI tools form validation", () => {
  it("requires mandatory AI tool fields", () => {
    const errors = validateAIToolForm({
      ...emptyAIToolFormValues,
      supportsEnglish: false,
      status: "",
    });

    assert.deepEqual(
      errors.map((error) => error.field),
      [
        "name",
        "provider",
        "shortDescription",
        "capabilities",
        "suitableUseCases",
        "supportedInputTypes",
        "supportedOutputTypes",
        "deploymentModel",
        "dataSensitivitySuitability",
        "integrationOptions",
        "supportsEnglish",
        "accessibilityConsiderations",
        "responsibleAiNotes",
        "securityPrivacyNotes",
        "status",
        "lastReviewedAt",
      ],
    );
  });

  it("accepts a valid AI tool form", () => {
    const values = validFormValues();

    assert.deepEqual(validateAIToolForm(values), []);
    assert.equal(createAIToolFromForm(values, { id: "tool-under-review" }).status, "underReview");
  });
});

function validFormValues(): AIToolFormValues {
  return {
    name: "Contract Review Assistant",
    provider: "Internal AI Platform",
    shortDescription: "Supports contract review preparation with summaries and extracted fields.",
    capabilities: ["documentExtraction", "summarization"],
    suitableUseCases: "contract review, obligation summary",
    supportedInputTypes: ["documents"],
    supportedOutputTypes: ["summary", "extractedData"],
    deploymentModel: "internalPlatform",
    dataSensitivitySuitability: ["public", "internal", "confidential"],
    requiresHumanReview: true,
    integrationOptions: ["api", "microsoft365"],
    supportsEnglish: true,
    supportsFrench: true,
    accessibilityConsiderations: "Outputs must be reviewed in accessible document formats.",
    responsibleAiNotes: "Review uncertainty and extracted fields before use.",
    securityPrivacyNotes: "Use approved workspaces and avoid restricted data until cleared.",
    status: "underReview",
    lastReviewedAt: "2026-05-31",
  };
}
