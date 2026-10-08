import type { NpcForm } from "@/domain/npc";
import type { WorldCityId } from "@/data/npcWorld";
import type { SemanticTone } from "@/types/ui";

export type WorldNpc = {
  handle: string;
  persona: string;
  trait: string;
  tone: SemanticTone;
  form?: NpcForm;
};

/** Story actors always have a known body; globe placeholders may not. */
export type StoryActor = WorldNpc & { form: NpcForm };

export type WorldCity = {
  readonly id: string;
  readonly city: string;
  readonly country: string;
  readonly lat: number;
  readonly lng: number;
  readonly npcs: readonly WorldNpc[];
};

export type ScenarioId = "leisure" | "business" | "community";
export const PERMISSION_ORDER = ["location", "interest", "memory"] as const;
export type PermissionId = (typeof PERMISSION_ORDER)[number];
export type StoryEnding = "accepted" | "declined";
/** What a step shows in the scene: the opening detail, the NPC exchange, the pending invitation, or its outcome. */
export type StoryKind = "discover" | "connect" | "invite" | "continue";
export type StoryStep = { kind: StoryKind; label: string; title: string; detail: string };
export type PermissionOption = {
  label: string;
  value: string;
  audience: string;
  retention: string;
  benefit: string;
  boundary: string;
};
export type WorldScenario = {
  id: ScenarioId;
  tone: SemanticTone;
  label: string;
  cityId: WorldCityId;
  /** Derived from the city record; never written by hand. */
  city: string;
  time: string;
  teaser: string;
  actors: readonly [StoryActor, StoryActor];
  exchange: readonly [string, string];
  steps: readonly StoryStep[];
  invitation: string;
  invitationDetail: string;
  memory: string;
  nextTime: string;
  nextTimeContext: string;
  /** Where the human meets the NPC next time. */
  device: "phone" | "laptop";
  permissions: Readonly<Record<PermissionId, PermissionOption>>;
};
