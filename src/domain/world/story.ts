import { WORLD_SCENARIOS } from "../../data/npcWorldPage.ts";
import type { PermissionId, ScenarioId, StoryStep, WorldScenario } from "./model.ts";

export function getScenario(id: ScenarioId): WorldScenario {
  return WORLD_SCENARIOS.find((scenario) => scenario.id === id)!;
}

export function permissionCapabilities(ids: readonly PermissionId[]) {
  return {
    nearby: ids.includes("location"),
    matching: ids.includes("interest"),
    continuity: ids.includes("memory"),
  };
}

/** The copy a step's scene shows; rendering and reading time both use it. */
export function storySceneText(scenario: WorldScenario, step: StoryStep): string {
  switch (step.kind) {
    case "discover": return scenario.permissions.interest.value;
    case "connect": return scenario.exchange.join(" ");
    case "invite":
    case "continue": return scenario.invitation + " " + scenario.invitationDetail;
  }
}

export function storyReadingDuration(scenario: WorldScenario, index: number): number {
  const step = scenario.steps[index];
  const words = (step.title + " " + step.detail + " " + storySceneText(scenario, step)).trim().split(/\s+/).length;
  return Math.max(9000, Math.min(20000, words * 280 + 2500));
}
