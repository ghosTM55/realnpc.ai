import type { NpcForm } from "@/domain/npc";

export const SOULS = [
  {
    id: "anchor",
    name: "Morrow",
    archetype: "Quiet confidence",
    signature: "Makes room. Then makes a move.",
    behavior: {
      initiative: "Invites, then leads",
      warmth: "Steady and attentive",
      humor: "Dry, when you least expect it",
    },
  },
  {
    id: "instigator",
    name: "Vex",
    archetype: "A sharper kind of chemistry",
    signature: "Calls your bluff. Never your boundaries.",
    behavior: {
      initiative: "Direct and decisive",
      warmth: "Honest, not sugar-coated",
      humor: "A little provocation",
    },
  },
  {
    id: "scout",
    name: "Kite",
    archetype: "Playfully unpredictable",
    signature: "Finds the possibility you missed.",
    behavior: {
      initiative: "Invents things together",
      warmth: "Curious and expressive",
      humor: "Turns ordinary into a story",
    },
  },
] as const;

export type SoulId = (typeof SOULS)[number]["id"];
/** Every NPC form, plus the configurator's option to decide later. */
export type VesselForm = NpcForm | "undecided";
export type SceneId = "chemistry" | "everyday" | "boundary";

// Each choice's allowed values, in display order. Types, draft validation and
// the option lists all derive from these arrays, so they cannot drift apart.
export const VESSEL_FORMS = ["digital-human", "robot", "undecided"] as const satisfies readonly VesselForm[];
export const RHYTHMS = ["unhurried", "playful", "direct"] as const;
export const PRIORITIES = ["privacy", "presence", "everyday"] as const;
export const CHARACTER_SOURCES = ["original", "my-character", "licensed"] as const;
export const BUDGETS = ["discuss", "under-10k", "10-25k", "25-50k", "50k-plus"] as const;
export const SERVICES = ["discuss", "software", "ongoing"] as const;
export type Rhythm = (typeof RHYTHMS)[number];

export const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (values as readonly string[]).includes(value);

export type CompanionConfig = {
  soulId: SoulId;
  rhythm: Rhythm;
  form: VesselForm;
  takesInitiative: boolean;
  rememberPreferences: boolean;
  rememberMoments: boolean;
  worldVisible: boolean;
};

export const DEFAULT_CONFIG: CompanionConfig = {
  soulId: "anchor",
  rhythm: "unhurried",
  form: "digital-human",
  takesInitiative: true,
  rememberPreferences: true,
  rememberMoments: false,
  worldVisible: false,
};

export type ReviewOptions = {
  priority: (typeof PRIORITIES)[number];
  characterSource: (typeof CHARACTER_SOURCES)[number];
  budget: (typeof BUDGETS)[number];
  service: (typeof SERVICES)[number];
};

export const DEFAULT_REVIEW: ReviewOptions = {
  priority: "privacy",
  characterSource: "original",
  budget: "discuss",
  service: "discuss",
};

export function getSoul(soulId: SoulId) {
  return SOULS.find((soul) => soul.id === soulId)!;
}
