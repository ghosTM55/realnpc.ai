import { LAST_STEP } from "../../data/configuratorSteps.ts";
import {
  BUDGETS,
  CHARACTER_SOURCES,
  DEFAULT_CONFIG,
  DEFAULT_REVIEW,
  PRIORITIES,
  RHYTHMS,
  SERVICES,
  SOULS,
  VESSEL_FORMS,
  isOneOf,
  type CompanionConfig,
  type ReviewOptions,
} from "./model.ts";

// Stored drafts outlive deploys: parsing and the v1/v2 migrations change rarely and carefully.
export type DemoDraft = {
  version: 3;
  step: number;
  unlockedStep: number;
  review: ReviewOptions;
  config: CompanionConfig;
};

export const DEFAULT_DRAFT: DemoDraft = {
  version: 3,
  step: 0,
  unlockedStep: 0,
  review: DEFAULT_REVIEW,
  config: DEFAULT_CONFIG,
};

export function parseDemoDraft(serialized: string | null): DemoDraft {
  try {
    if (serialized && serialized.length > 4096) return DEFAULT_DRAFT;
    const value = JSON.parse(serialized ?? "null");
    const config = value?.config;
    const review = value?.review;
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
      : value?.version === 2 || value?.version === 3
        ? value.step
        : undefined;
    if (
      !Number.isInteger(step) ||
      step < 0 ||
      step > LAST_STEP ||
      !review ||
      !isOneOf(PRIORITIES, review.priority) ||
      !isOneOf(CHARACTER_SOURCES, review.characterSource) ||
      !isOneOf(BUDGETS, review.budget) ||
      !isOneOf(SERVICES, review.service) ||
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
      value.version === 3 &&
      Number.isInteger(value.unlockedStep) &&
      value.unlockedStep >= 0 &&
      value.unlockedStep <= LAST_STEP
        ? value.unlockedStep
        : 0;
    return {
      version: 3,
      step: Math.min(step, unlockedStep),
      unlockedStep,
      review: {
        priority: review.priority,
        characterSource: review.characterSource,
        budget: review.budget,
        service: review.service,
      },
      config: {
        soulId: config.soulId,
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
