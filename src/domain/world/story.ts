import { WORLD_SCENARIOS } from "../../data/npcWorldPage.ts";
import type { ScenarioId, WorldScenario } from "./model.ts";

export function getScenario(id: ScenarioId): WorldScenario {
  return WORLD_SCENARIOS.find((scenario) => scenario.id === id)!;
}
