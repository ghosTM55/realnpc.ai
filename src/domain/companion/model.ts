import { DEFAULT_CAPABILITIES, type SoulCapabilities } from "./capabilities.ts";
import type { NpcForm } from "@/domain/npc";

import { getSoul, type SoulId } from "./souls.ts";
export { SOULS, getSoul, type SoulId } from "./souls.ts";

/** Every NPC form, plus the configurator's option to decide later. */
export type VesselForm = NpcForm | "undecided";

// Each choice's allowed values, in display order. Types, draft validation and
// the option lists all derive from these arrays, so they cannot drift apart.
export const VESSEL_FORMS = ["digital-human", "robot", "undecided"] as const satisfies readonly VesselForm[];
export const RHYTHMS = ["unhurried", "playful", "direct"] as const;
export type Rhythm = (typeof RHYTHMS)[number];

export const GENDERS = ["female", "male", "nonbinary"] as const;
export const ASSEMBLIES = ["software", "preset", "custom"] as const;
export const PERSONALITY_STYLES = ["warm", "playful", "thoughtful", "direct"] as const;
export const RELATIONSHIPS = ["friends", "strangers", "partner"] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];
export type PersonalityStyle = (typeof PERSONALITY_STYLES)[number];
export const PERSONALITY_LABELS: Record<PersonalityStyle, string> = {
  warm: "Warm & caring", playful: "Playful & curious", thoughtful: "Quiet & thoughtful", direct: "Honest & direct",
};
export const ASSEMBLY_LABELS = {
  software: "Pure Soul", preset: "Soul + Preset Hardware", custom: "Soul + Custom Hardware",
} as const;
export const SOUL_IDENTITIES = {
  anchor: { gender: "female", age: 28, background: "A bookshop owner who collects stories, makes excellent tea, and always notices when something is on your mind.", personality: { friends: "warm", strangers: "thoughtful", partner: "warm" } },
  scout: { gender: "female", age: 25, background: "A travel photographer with a pocket full of tickets and a habit of turning an ordinary afternoon into a small adventure.", personality: { friends: "playful", strangers: "warm", partner: "playful" } },
  instigator: { gender: "male", age: 34, background: "An architect who loves old jazz records, long walks, and finding a fresh perspective on the questions that stay with you.", personality: { friends: "thoughtful", strangers: "direct", partner: "warm" } },
} as const;

export const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (values as readonly string[]).includes(value);

export type CompanionConfig = {
  soulId: SoulId;
  capabilities: SoulCapabilities;
  name: string;
  gender: (typeof GENDERS)[number];
  age: number;
  background: string;
  personality: Record<Relationship, PersonalityStyle>;
  assembly: (typeof ASSEMBLIES)[number];
  rhythm: Rhythm;
  form: VesselForm;
  takesInitiative: boolean;
  rememberPreferences: boolean;
  rememberMoments: boolean;
  worldVisible: boolean;
};

export const DEFAULT_CONFIG: CompanionConfig = {
  soulId: "anchor",
  capabilities: DEFAULT_CAPABILITIES,
  name: "",
  ...SOUL_IDENTITIES.anchor,
  assembly: "software",
  rhythm: "unhurried",
  form: "digital-human",
  takesInitiative: true,
  rememberPreferences: true,
  rememberMoments: false,
  worldVisible: false,
};

export function getSoulName(config: CompanionConfig) {
  return config.name.trim() || getSoul(config.soulId).name;
}
