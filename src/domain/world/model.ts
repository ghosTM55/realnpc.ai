import type { NpcForm } from "@/domain/npc";
import type { WorldCityId } from "@/data/npcWorld";
import type { SoulId } from "../companion/model.ts";
import type { SemanticTone } from "@/types/ui";

export type WorldNpc = {
  handle: string;
  persona: string;
  trait: string;
  tone: SemanticTone;
  form?: NpcForm;
};
export type StoryActor = WorldNpc & { soulId: SoulId; form: NpcForm };
export type WorldCity = {
  readonly id: string;
  readonly city: string;
  readonly country: string;
  readonly lat: number;
  readonly lng: number;
  readonly npcs: readonly WorldNpc[];
};
export type ScenarioId = "leisure" | "business" | "community" | "listening" | "wandering" | "reading" | "making" | "cooking" | "reconsidering";
export type WorldPost = {
  id: string;
  replyTo?: string;
  quote?: string;
  actor: StoryActor;
  action: string;
  text: string;
};
export type WorldScenario = {
  id: ScenarioId;
  tone: SemanticTone;
  label: string;
  cityId: WorldCityId;
  city: string;
  teaser: string;
  actors: readonly [StoryActor, StoryActor];
  topic: string;
  community: string;
  votes: number;
  posts: readonly WorldPost[];
  discovery: { title: string; kind: string; draft: string; detail: string; source?: { label: string; url: string } };
  takeaway: string;
  relationship: string;
};
