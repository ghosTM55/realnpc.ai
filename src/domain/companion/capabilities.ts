export const INTERESTS = { art: "Art", music: "Music", science: "Science", technology: "Technology", travel: "Travel", literature: "Literature", food: "Food", games: "Games" } as const;
export const SKILLS = { storytelling: "Storytelling", tutoring: "Tutoring", brainstorming: "Brainstorming", planning: "Planning", reflection: "Reflection", debate: "Debate" } as const;
export const REPLY_LENGTHS = { brief: "Brief", balanced: "Balanced", detailed: "Detailed" } as const;
export const LANGUAGES = { auto: "Match the user", en: "English", zh: "Chinese", ja: "Japanese", es: "Spanish" } as const;
export const BOND_PACES = { gradual: "Take it slowly", natural: "Follow the conversation" } as const;
export const RETENTION = { session: "This session", month: "30 days", manual: "Until I delete it" } as const;
export const VOICES = { soft: "Soft", clear: "Clear", bright: "Bright", deep: "Deep" } as const;
export const AUTONOMY = { ask: "Ask first", suggest: "Suggest actions", independent: "Act within permissions" } as const;
export type SoulCapabilities = {
  mind: { empathy: number; humor: number; curiosity: number; creativity: number; confidence: number; analytical: number };
  expression: { replyLength: keyof typeof REPLY_LENGTHS; language: keyof typeof LANGUAGES; emojis: boolean; bondPace: keyof typeof BOND_PACES };
  knowledge: { interests: (keyof typeof INTERESTS)[]; skills: (keyof typeof SKILLS)[]; avoidTopics: string };
  memory: { depth: number; retention: keyof typeof RETENTION; askBeforeSaving: boolean };
  presence: { voice: keyof typeof VOICES; voiceSpeed: number; voicePitch: number; expressiveness: number; gestures: number; vision: boolean; ambientListening: boolean };
  world: { sociability: number; autonomy: keyof typeof AUTONOMY; shareInterests: boolean; reminders: boolean };
};
export const DEFAULT_CAPABILITIES: SoulCapabilities = {
  mind: { empathy: 65, humor: 45, curiosity: 65, creativity: 55, confidence: 50, analytical: 50 },
  expression: { replyLength: "balanced", language: "auto", emojis: false, bondPace: "natural" },
  knowledge: { interests: ["art", "music"], skills: ["storytelling", "reflection"], avoidTopics: "" },
  memory: { depth: 50, retention: "session", askBeforeSaving: true },
  presence: { voice: "clear", voiceSpeed: 50, voicePitch: 50, expressiveness: 50, gestures: 35, vision: false, ambientListening: false },
  world: { sociability: 50, autonomy: "ask", shareInterests: false, reminders: false },
};

/** Older drafts have no capability sheet. Present sheets must pass every field boundary. */
export function parseCapabilities(value: unknown): SoulCapabilities | null {
  if (value === undefined) return structuredClone(DEFAULT_CAPABILITIES);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result = structuredClone(DEFAULT_CAPABILITIES);
  const ranges = { mind: ["empathy", "humor", "curiosity", "creativity", "confidence", "analytical"], memory: ["depth"], presence: ["voiceSpeed", "voicePitch", "expressiveness", "gestures"], world: ["sociability"] };
  const choices = { expression: { replyLength: REPLY_LENGTHS, language: LANGUAGES, bondPace: BOND_PACES }, memory: { retention: RETENTION }, presence: { voice: VOICES }, world: { autonomy: AUTONOMY } };
  const booleans = { expression: ["emojis"], memory: ["askBeforeSaving"], presence: ["vision", "ambientListening"], world: ["shareInterests", "reminders"] };
  const input = value as Record<string, Record<string, unknown>>;
  const output = result as unknown as Record<string, Record<string, unknown>>;
  for (const group of Object.keys(result)) if (!input[group] || typeof input[group] !== "object" || Array.isArray(input[group])) return null;
  for (const [group, keys] of Object.entries(ranges)) for (const key of keys) {
    const n = input[group][key];
    if (typeof n !== "number" || !Number.isInteger(n) || n < 0 || n > 100) return null;
    output[group][key] = n;
  }
  for (const [group, fields] of Object.entries(choices)) for (const [key, options] of Object.entries(fields)) {
    const choice = input[group][key];
    if (typeof choice !== "string" || !Object.hasOwn(options, choice)) return null;
    output[group][key] = choice;
  }
  for (const [group, keys] of Object.entries(booleans)) for (const key of keys) {
    if (typeof input[group][key] !== "boolean") return null;
    output[group][key] = input[group][key];
  }
  for (const [key, options] of Object.entries({ interests: INTERESTS, skills: SKILLS })) {
    const list = input.knowledge[key];
    if (!Array.isArray(list) || list.length > Object.keys(options).length || list.some(item => typeof item !== "string" || !Object.hasOwn(options, item)) || new Set(list).size !== list.length) return null;
    output.knowledge[key] = [...list];
  }
  if (typeof input.knowledge.avoidTopics !== "string" || input.knowledge.avoidTopics.length > 300) return null;
  result.knowledge.avoidTopics = input.knowledge.avoidTopics;
  return result;
}
