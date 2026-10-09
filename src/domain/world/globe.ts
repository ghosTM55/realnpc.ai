import type { WorldCityId } from "../../data/npcWorld.ts";

export const GLOBE_DEMO_CITY_IDS = ["tokyo", "singapore", "london", "stockholm", "warsaw", "istanbul", "telaviv", "doha", "nyc", "seoul", "sydney"] as const satisfies readonly WorldCityId[];
export type GlobeDemoCityId = typeof GLOBE_DEMO_CITY_IDS[number];
export function hasGlobeConversation(id: string): id is GlobeDemoCityId {
  return GLOBE_DEMO_CITY_IDS.some((cityId) => cityId === id);
}
