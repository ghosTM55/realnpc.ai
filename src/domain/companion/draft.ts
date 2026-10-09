import { parseCapabilities } from "./capabilities.ts";
import { LAST_STEP } from "../../data/configuratorSteps.ts";
import {
  ASSEMBLIES, GENDERS, PERSONALITY_STYLES, RELATIONSHIPS, SOUL_IDENTITIES,
  DEFAULT_CONFIG,
  RHYTHMS,
  SOULS,
  VESSEL_FORMS,
  isOneOf,
  type CompanionConfig,
} from "./model.ts";

// Stored drafts outlive deploys: parsing and the v1/v2 migrations change rarely and carefully.
export type DemoDraft = {
  version: 5;
  step: number;
  unlockedStep: number;
  config: CompanionConfig;
};

export const DEFAULT_DRAFT: DemoDraft = {
  version: 5,
  step: 0,
  unlockedStep: 0,
  config: DEFAULT_CONFIG,
};

export function parseDemoDraft(serialized: string | null): DemoDraft {
  try {
    if (serialized && serialized.length > 16384) return DEFAULT_DRAFT;
    const value = JSON.parse(serialized ?? "null");
    const config = value?.config;
    // Older drafts allowed arbitrary jumps, so their step is not completion evidence.
    // The 3 and 2 below are v1's own two-flow bounds (lab 0-3, review 0-2), not current step ids.
    const legacyStepsValid =
      value?.version === 1 &&
      Number.isInteger(value.labStep) &&
      value.labStep >= 0 &&
      value.labStep <= 3 &&
      Number.isInteger(value.reviewStep) &&
      value.reviewStep >= 0 &&
      value.reviewStep <= 2;
    const step = legacyStepsValid
      ? value.labStep < 3
        ? value.labStep
        : 3 + value.reviewStep
      : value?.version === 2 || value?.version === 3 || value?.version === 5
        ? value.step
        : undefined;
    if (
      !Number.isInteger(step) ||
      step < 0 ||
      step > (value.version === 5 ? LAST_STEP : 5) ||
      !config ||
      !SOULS.some((soul) => soul.id === config.soulId) ||
      !isOneOf(RHYTHMS, config.rhythm) ||
      !isOneOf(VESSEL_FORMS, config.form) ||
      ![
        "takesInitiative",
        "rememberPreferences",
        "rememberMoments",
        "worldVisible",
      ].every((key) => typeof config[key] === "boolean")
    )
      return DEFAULT_DRAFT;
    const unlockedStep =
      value.version === 5 &&
      Number.isInteger(value.unlockedStep) &&
      value.unlockedStep >= 0 &&
      value.unlockedStep <= LAST_STEP
        ? value.unlockedStep
        : 0;
    const identity = SOUL_IDENTITIES[config.soulId as keyof typeof SOUL_IDENTITIES];
    const modern = value.version === 5;
    if (modern && (
      typeof config.name !== "string" || config.name.length > 40 ||
      !isOneOf(GENDERS, config.gender) || !Number.isInteger(config.age) || config.age < 18 || config.age > 100 ||
      typeof config.background !== "string" || config.background.length > 1200 ||
      !isOneOf(ASSEMBLIES, config.assembly) || !config.personality ||
      !RELATIONSHIPS.every(key => isOneOf(PERSONALITY_STYLES, config.personality[key]))
    )) return DEFAULT_DRAFT;
    const capabilities = parseCapabilities(config.capabilities);
    if (!capabilities) return DEFAULT_DRAFT;
    return {
      version: 5,
      step: Math.min(step, unlockedStep),
      unlockedStep,
      config: {
        soulId: config.soulId,
        capabilities,
        // Character selection replaces previously editable identity.
        name: "",
        gender: identity.gender,
        age: identity.age,
        background: identity.background,
        personality: Object.fromEntries(RELATIONSHIPS.map(key => [key, modern ? config.personality[key] : identity.personality[key]])) as CompanionConfig["personality"],
        assembly: modern ? config.assembly : config.form === "robot" ? "preset" : "software",
        rhythm: config.rhythm,
        form: config.form,
        takesInitiative: config.takesInitiative,
        rememberPreferences: config.rememberPreferences,
        rememberMoments: config.rememberMoments,
        worldVisible: config.worldVisible,
      },
    };
  } catch {
    return DEFAULT_DRAFT;
  }
}

/** Round-trips a draft through the same validation used when loading from storage. */
export function normalizeDemoDraft(draft: DemoDraft): DemoDraft {
  return parseDemoDraft(JSON.stringify(draft));
}

export function serializeDemoDraft(draft: DemoDraft) {
  return JSON.stringify(normalizeDemoDraft(draft));
}
