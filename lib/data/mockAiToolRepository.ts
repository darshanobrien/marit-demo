import type { AITool } from "../domain/types";
import { aiTools } from "./aiTools";
import { mergeSeededAndStored, readStoredArray } from "./mockBusinessCaseRepository";

const aiToolsStorageKey = "marit.aiTools.v1";

export type MockAIToolRepository = {
  listTools: () => AITool[];
  saveTool: (tool: AITool) => void;
};

export function createLocalStorageAIToolRepository(storage: Storage): MockAIToolRepository {
  return {
    listTools() {
      return mergeSeededAndStored(aiTools, readStoredArray<AITool>(storage, aiToolsStorageKey));
    },
    saveTool(tool) {
      const storedTools = upsertById(readStoredArray<AITool>(storage, aiToolsStorageKey), tool);
      storage.setItem(aiToolsStorageKey, JSON.stringify(storedTools));
    },
  };
}

function upsertById<T extends { id: string }>(items: T[], nextItem: T): T[] {
  const existingIndex = items.findIndex((item) => item.id === nextItem.id);

  if (existingIndex === -1) {
    return [...items, nextItem];
  }

  return items.map((item, index) => (index === existingIndex ? nextItem : item));
}
