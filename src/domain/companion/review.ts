import { getCompanionProfile } from "./profile.ts";
import type { CompanionConfig, ReviewOptions } from "./model.ts";

export function createReviewCase(
  config: CompanionConfig,
  options: ReviewOptions,
) {
  const profile = getCompanionProfile(config);
  const path = {
    "digital-human": {
      title: "A private digital companion",
      description:
        "Explore a screen-based character first. Voice, expression and cross-device continuity are subjects for review, not features connected in this demo.",
      system: [
        "Screen-based presence",
        `${profile.soul.name} personality direction`,
        profile.memory.description,
        "Voice and expression feasibility review",
      ],
    },
    robot: {
      title: "A physical companion, carefully scoped",
      description:
        "Carry this personality into a physical Vessel. Body, sensing, movement, servicing and delivery need a separate feasibility assessment.",
      system: [
        "Physical Vessel feasibility assessment",
        `${profile.soul.name} personality direction`,
        profile.memory.description,
        "Hardware, maintenance and delivery review",
      ],
    },
    undecided: {
      title: "Personality first. Form still open.",
      description:
        "Keep the companion direction intact while comparing a digital presence with a physical Vessel. No hardware decision is required today.",
      system: [
        "Digital and physical paths compared",
        `${profile.soul.name} personality direction`,
        profile.memory.description,
        "Guided form and service review",
      ],
    },
  }[config.form];
  const why = {
    privacy:
      "Privacy is your priority, so memory permissions and data handling lead the review.",
    presence:
      "Presence is your priority, so appearance, expression and interaction feasibility lead the review.",
    everyday:
      "Everyday companionship is your priority, so continuity and useful routines lead the review.",
  }[options.priority];
  const reviewNotes = [
    "A preview, not a quote or order. Human review is required before any commitment.",
  ];
  if (config.form === "robot")
    reviewNotes.push(
      "Hardware feasibility, safety, maintenance and delivery must be confirmed. No walking or autonomous operation is promised.",
    );
  if (options.characterSource === "licensed")
    reviewNotes.push(
      "Character rights and adult-use permissions must be verified before this direction can proceed.",
    );
  if (options.characterSource === "my-character")
    reviewNotes.push(
      "Original character ownership and permitted use must be confirmed.",
    );
  if (config.form === "robot" && options.budget === "under-10k")
    reviewNotes.push(
      "Budget and physical scope need to be reconciled. A digital starting point may be more suitable; no price is inferred here.",
    );
  if (config.worldVisible)
    reviewNotes.push(
      "World visibility covers a public introduction only, never private dialogue or memory.",
    );
  return {
    version: 1,
    status: "local-draft" as const,
    submitted: false as const,
    mode: "scripted-demo" as const,
    companion: {
      name: profile.soul.name,
      soulId: config.soulId,
      relationship: profile.relationship,
      memory: profile.memory,
      powers: profile.powers,
      visibility: profile.visibility,
    },
    config: { ...config },
    preferences: { ...options },
    path: { ...path, why },
    reviewNotes,
  };
}
