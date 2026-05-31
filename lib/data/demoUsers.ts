import type { DemoUser } from "../domain/types";

export const demoUsers: DemoUser[] = [
  {
    id: "user-business-operations",
    displayName: "Maya Chen",
    role: "businessUser",
    team: "Operations",
    localePreference: "en-CA",
  },
  {
    id: "user-ai-builder",
    displayName: "Olivier Tremblay",
    role: "aiBuilder",
    team: "AI Lab",
    localePreference: "fr-CA",
  },
  {
    id: "user-admin",
    displayName: "Priya Shah",
    role: "admin",
    team: "AI Lab Enablement",
    localePreference: "en-CA",
  },
];
