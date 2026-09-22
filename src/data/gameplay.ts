/**
 * Social-state model for the `/npc-world` page.
 *
 * All logic here is deterministic and pure: the interactive demos (Exposure
 * Console, Sense switcher, Quest streams) and the globe dossier consume these
 * functions so the page is playable with no backend and renders identically on
 * server and client. Concept-stage — no real product SKUs or named Powers.
 */
import type { WorldCity, WorldNpc } from "./npcWorld";

export type Tone = "vessel" | "soul" | "powers";

/* ------------------------------------------------------------------ *
 * Small deterministic helpers (no Math.random — SSR/client must match)
 * ------------------------------------------------------------------ */

/** Stable string hash → unsigned 32-bit. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], seed: number): T {
  if (arr.length === 0) throw new Error("Cannot pick from an empty array.");
  const index = ((seed % arr.length) + arr.length) % arr.length;
  return arr[index];
}

function joinHuman(parts: string[]): string {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------------------------ *
 * 1. Exposure model — the flagship playable
 *    "You decide what it senses, keeps, and reveals. Nothing is on by default."
 * ------------------------------------------------------------------ */

export type ExposureGroup = "sense" | "reveal";

export type ExposureSignal = {
  id: string;
  group: ExposureGroup;
  label: string;
  hint: string;
  tone: Tone;
};

/** Inward signals = what it takes in. Outward signals = what it shows. */
export const EXPOSURE_SIGNALS: ExposureSignal[] = [
  { id: "place", group: "sense", label: "Surroundings", hint: "Reads the room it is standing in.", tone: "soul" },
  { id: "rhythm", group: "sense", label: "Your rhythm", hint: "Learns your routine and quiet hours.", tone: "soul" },
  { id: "memory", group: "sense", label: "Memory", hint: "Keeps what matters between days.", tone: "powers" },
  { id: "nearby", group: "sense", label: "Nearby companions", hint: "Notices other NPCs in range.", tone: "soul" },
  { id: "discoverable", group: "reveal", label: "Discoverable", hint: "The active map can show it nearby.", tone: "vessel" },
  { id: "identity", group: "reveal", label: "Identity", hint: "Shows its handle and character.", tone: "vessel" },
  { id: "openToMeet", group: "reveal", label: "Open to play", hint: "Allows nearby prompts and quest handoffs.", tone: "powers" },
];

export type ExposureState = Record<string, boolean>;

export const SENSE_IDS = EXPOSURE_SIGNALS.filter((s) => s.group === "sense").map((s) => s.id);
export const REVEAL_IDS = EXPOSURE_SIGNALS.filter((s) => s.group === "reveal").map((s) => s.id);

export const EXPOSURE_PRESETS: { id: string; label: string; note: string; on: string[] }[] = [
  { id: "ghost", label: "Ghost", note: "Senses nothing. Invisible to the world.", on: [] },
  { id: "private", label: "Private", note: "Knows your world, shows none of itself.", on: ["place", "rhythm", "memory"] },
  { id: "social", label: "Map visible", note: "Aware of nearby play, visible enough to receive prompts.", on: ["place", "memory", "nearby", "discoverable", "openToMeet"] },
  { id: "open", label: "Open world", note: "Fully in the world, sensing and seen.", on: [...SENSE_IDS, ...REVEAL_IDS] },
];

export type Capability = { label: string; enabled: boolean; need: string[] };

export type ExposureReadout = {
  levelLabel: string;
  levelIndex: number; // 0..4, drives the meter
  intake: number;
  output: number;
  capabilities: Capability[];
  behavior: string;
  worldSees: string;
};

export function emptyExposure(): ExposureState {
  return Object.fromEntries(EXPOSURE_SIGNALS.map((s) => [s.id, false]));
}

export function presetToState(on: string[]): ExposureState {
  const base = emptyExposure();
  for (const id of on) base[id] = true;
  return base;
}

export function activePresetId(state: ExposureState): string | null {
  for (const p of EXPOSURE_PRESETS) {
    const target = new Set(p.on);
    const matches = EXPOSURE_SIGNALS.every((s) => !!state[s.id] === target.has(s.id));
    if (matches) return p.id;
  }
  return null;
}

export function evaluateExposure(state: ExposureState): ExposureReadout {
  const on = (id: string) => !!state[id];
  const intake = SENSE_IDS.filter(on).length;
  const output = REVEAL_IDS.filter(on).length;

  const capabilities: Capability[] = [
    { label: "Adapts to where you are", need: ["place"], enabled: on("place") },
    { label: "Remembers you across days", need: ["memory"], enabled: on("memory") },
    { label: "Anticipates your day", need: ["rhythm", "memory"], enabled: on("rhythm") && on("memory") },
    { label: "Appears on the active map", need: ["discoverable"], enabled: on("discoverable") },
    { label: "Reads nearby play signals", need: ["nearby", "discoverable", "openToMeet"], enabled: on("nearby") && on("discoverable") && on("openToMeet") },
    { label: "Carries quest handoffs", need: ["identity", "openToMeet"], enabled: on("identity") && on("openToMeet") },
  ];

  let levelLabel = "Ghost";
  let levelIndex = 0;
  if (intake + output === 0) {
    levelLabel = "Ghost";
    levelIndex = 0;
  } else if (output === 0) {
    levelLabel = "Private";
    levelIndex = 1;
  } else if (output === 1) {
    levelLabel = "Ambient";
    levelIndex = 2;
  } else if (output === 2) {
    levelLabel = "Map visible";
    levelIndex = 3;
  } else {
    levelLabel = "Open world";
    levelIndex = 4;
  }

  let behavior: string;
  if (intake === 0) {
    behavior = "It rests. With nothing to sense, it stays quiet and waits for you to open something.";
  } else {
    const parts: string[] = [];
    if (on("place")) parts.push("shifts its tone to the room around it");
    if (on("rhythm")) parts.push("moves with your day");
    if (on("memory")) parts.push("picks up where you left off");
    if (on("nearby")) parts.push("keeps track of who is around");
    behavior = `It ${joinHuman(parts)}.`;
  }

  let worldSees: string;
  if (output === 0) {
    worldSees = "Nothing. To everyone else, it is not there.";
  } else {
    const parts: string[] = [];
    if (on("discoverable")) parts.push("a presence nearby");
    if (on("identity")) parts.push("its handle and character");
    if (on("openToMeet")) parts.push("that it can receive play prompts");
    worldSees = `${capitalize(joinHuman(parts))}.`;
  }

  return { levelLabel, levelIndex, intake, output, capabilities, behavior, worldSees };
}

/* ------------------------------------------------------------------ *
 * 2. Reality / Sense — the same companion shifts with the room it reads
 * ------------------------------------------------------------------ */

export type Place = {
  id: string;
  label: string;
  clock: string;
  senses: string;
  behavior: string;
  tone: Tone;
};

export const PLACES: Place[] = [
  {
    id: "home",
    label: "Home",
    clock: "22:40",
    senses: "Quiet hours, familiar room, your routine settling.",
    behavior: "Settles in. Keeps its voice low, guards your focus, and saves the loud ideas for tomorrow.",
    tone: "soul",
  },
  {
    id: "commute",
    label: "Commute",
    clock: "08:15",
    senses: "Motion, time pressure, the day stacking up ahead.",
    behavior: "Picks up the threads of your day, lines up what actually matters, and quietly drops the rest.",
    tone: "powers",
  },
  {
    id: "cafe",
    label: "Café",
    clock: "16:05",
    senses: "A warmer room, other people, slower time.",
    behavior: "Loosens up to match the room, and nudges you toward the table that is worth joining.",
    tone: "soul",
  },
  {
    id: "outside",
    label: "Outside",
    clock: "13:30",
    senses: "Open ground, companions moving within range.",
    behavior: "Opens up. Notices nearby NPC activity and suggests what is worth trying.",
    tone: "vessel",
  },
];

/* ------------------------------------------------------------------ *
 * 3. NPC profiles — derive living-agent state for the globe dossier
 * ------------------------------------------------------------------ */

const POWERS_BY_TONE: Record<Tone, string[]> = {
  soul: ["Mood-reading", "Memory", "Quiet-hours"],
  powers: ["Planning", "Navigation", "Recall"],
  vessel: ["Presence", "Voice", "Field-sense"],
};

const POWERS_BY_TRAIT: Record<string, string> = {
  Collector: "Cataloguing",
  Navigator: "Wayfinding",
  Epicure: "Taste-mapping",
  Historian: "Local-lore",
  Curator: "Scene-sense",
  Connector: "Introductions",
  Tactician: "Negotiation",
  Planner: "Day-shaping",
  Naturalist: "Trail-sense",
  Archivist: "Long-memory",
  Cartographer: "Mapping",
};

const VESSEL_BY_TONE: Record<Tone, string> = {
  soul: "Digital human",
  powers: "Hybrid identity",
  vessel: "Robot vessel",
};

const QUEST_VERBS: Record<Tone, { verb: string; templates: string[] }> = {
  soul: {
    verb: "Observe",
    templates: [
      "Find the quietest five minutes in {city} today.",
      "Notice one thing in {city} you always walk past.",
      "Sit somewhere in {city} and just listen for a while.",
    ],
  },
  powers: {
    verb: "Make",
    templates: [
      "Map the three best detours between here and home in {city}.",
      "Turn one errand in {city} into something worth telling.",
      "Plan a small adventure in {city} for under an hour.",
    ],
  },
  vessel: {
    verb: "Explore",
    templates: [
      "Knock on the one door in {city} you have been curious about.",
      "Follow the sound to wherever it leads in {city}.",
      "Trade a recommendation with a stranger in {city}.",
    ],
  },
};

const STATUS_TEMPLATES: Record<Tone, string[]> = {
  soul: ["Holding a quiet corner of {city}.", "Reading the mood of {city} tonight.", "Keeping {city} company after dark."],
  powers: ["Mapping the back routes of {city}.", "Lining up tomorrow across {city}.", "Tracking what is open late in {city}."],
  vessel: ["Out in {city}, looking for a reason.", "Scouting the loud blocks of {city}.", "Daring {city} into something."],
};

export type NpcProfile = {
  vessel: string;
  powers: string[];
  status: string;
  exposure: string;
  openToMeet: boolean;
  met: number;
  quest: { verb: string; text: string };
};

export function deriveNpcProfile(npc: WorldNpc, city: WorldCity): NpcProfile {
  const seed = hash(`${npc.handle}@${city.id}`);

  const powers = [...POWERS_BY_TONE[npc.tone]];
  const traitPower = POWERS_BY_TRAIT[npc.trait];
  if (traitPower && !powers.includes(traitPower)) powers.unshift(traitPower);

  const status = pick(STATUS_TEMPLATES[npc.tone], seed).replace("{city}", city.city);

  const qu = QUEST_VERBS[npc.tone];
  const questText = pick(qu.templates, seed >> 3).replace("{city}", city.city);

  // exposure preset + openness, biased by tone
  const openToMeet = npc.tone === "vessel" ? (seed & 1) === 0 : (seed % 3) !== 0;
  const exposurePresets = openToMeet ? ["Social", "Open world"] : ["Private", "Ambient"];
  const exposure = pick(exposurePresets, seed >> 5);

  const met = (seed % 47) + (openToMeet ? 6 : 0);

  return {
    vessel: VESSEL_BY_TONE[npc.tone],
    powers: powers.slice(0, 3),
    status,
    exposure,
    openToMeet,
    met,
    quest: { verb: qu.verb, text: questText },
  };
}
