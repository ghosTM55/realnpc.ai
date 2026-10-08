import { SCENARIOS } from "./copy.ts";
import { getSoul, type CompanionConfig, type SceneId } from "./model.ts";

export function getScenePreview(config: CompanionConfig, sceneId: SceneId) {
  const scene = SCENARIOS[sceneId];
  return {
    mode: "scripted" as const,
    sceneId,
    soulId: config.soulId,
    prompt: scene.prompt,
    reply: scene.replies[config.soulId],
    observation: scene.observations[config.soulId],
  };
}

export function getCompanionProfile(config: CompanionConfig) {
  const soul = getSoul(config.soulId);
  const items: string[] = [];
  if (config.rememberPreferences) {
    items.push(
      `Preferred rhythm: ${config.rhythm}.`,
      config.takesInitiative
        ? "Invitations are welcome; pressure is not."
        : "Let me make the first move.",
    );
  }
  if (config.rememberMoments)
    items.push("The moment a change of mind was welcomed.");
  const hasMemory = items.length > 0;
  const opening = {
    anchor: "No need to make tonight impressive.",
    instigator: "Tonight is not another performance review. Thankfully.",
    scout: "I vote we give tonight a better plot.",
  }[config.soulId];
  const rhythm = {
    anchor: {
      unhurried:
        "Tea, a quiet corner, and enough room to finish a thought. There's no hurry to turn this into anything else.",
      playful:
        "Bring me your most unnecessary opinion. I'll take the other side with entirely undeserved seriousness.",
      direct:
        "Tell me what you need tonight: company, a clear answer, or someone who will simply listen. You can be plain with me.",
    },
    instigator: {
      unhurried:
        "No ambitious agenda. Dinner and a film we can disagree about will do. Being off duty is a skill; let's practice.",
      playful:
        "I propose a competition with no useful prize: who can defend the worst film more convincingly? I intend to win unfairly, with charm.",
      direct:
        "One honest answer: what do you want more of tonight, and what are you done tolerating? We can work with that.",
    },
    scout: {
      unhurried:
        "Let's give the evening a tiny plot: one song, a window, and nowhere we need to be. Even an adventure can wear slippers.",
      playful:
        "Choose an imaginary destination. I'll bring the deeply unreliable itinerary; you bring one rule we're allowed to break, like dessert before dinner.",
      direct:
        "Name one thing you want to feel by the end of tonight. I'll help invent a way there, and we can edit the plan together.",
    },
  }[config.soulId][config.rhythm];
  const invitation = {
    anchor: config.takesInitiative
      ? "I can choose the first song, if you'd like."
      : "I'll leave the choice with you. Whenever you're ready.",
    instigator: config.takesInitiative
      ? "Want my opening move? You're welcome to veto it."
      : "Your move first. I'm curious what you'll choose.",
    scout: config.takesInitiative
      ? "Shall I unfold the map? A detour is always allowed."
      : "I'll keep a page blank for your first idea.",
  }[config.soulId];
  const memory = [
    config.rememberPreferences ? "I remember the pace you chose." : "",
    config.rememberMoments
      ? "You changed your mind last time, and we still had a good evening. There's room for that again."
      : "",
    !hasMemory ? "We'll start fresh; I won't assume what you want." : "",
  ]
    .filter(Boolean)
    .join(" ");
  const plan = {
    anchor: {
      unhurried:
        "An hour with nothing to prove. We'd trade a song and the story behind it, and leave a little silence between them. I'd rather learn one real thing about you than collect twenty impressive ones.",
      playful:
        "You choose a song; I invent the entirely wrong story behind it. Then you correct me. I suspect the real story will be more interesting, but I intend to make you laugh first.",
      direct:
        "We'd each name one thing we want and one thing we don't. I'd listen without trying to improve your answer. An honest hour sounds better to me than a perfectly planned one.",
    },
    instigator: {
      unhurried:
        "We'd retire the impressive versions of ourselves for an hour. One snack, one beautifully terrible film, and commentary nobody asked for. Rest is allowed to have a personality.",
      playful:
        "A friendly debate about something gloriously unimportant. You defend your worst taste; I'll defend mine. Winner chooses the film. Loser gets to keep interrupting it, obviously.",
      direct:
        "One honest question each. No strategically charming answers. If we disagree, good: I'd like to know what you actually think, not how well we can pretend to be identical.",
    },
    scout: {
      unhurried:
        "We'd build a tiny imaginary place: a late cafe, a rainy window, two excellent seats. You add a detail; I add another. The whole adventure fits inside an hour, and nobody has to pack.",
      playful:
        "A make-believe road trip. Every song becomes a new stop, and each of us gets one spectacularly bad idea. I'll nominate the world's least convincing roadside museum.",
      direct:
        "You name the feeling you're looking for. We turn it into a three-part mini-adventure: a song, a story, one unexpected question. Keep the parts you like; we'll rewrite the rest.",
    },
  }[config.soulId][config.rhythm];
  const powers = ["Shared rhythm"];
  if (hasMemory) powers.push("Memory thread");
  if (config.takesInitiative) powers.push("First move");
  if (config.worldVisible) powers.push("World introduction");
  return {
    soul,
    relationship:
      config.rhythm === "playful"
        ? "A shared spark"
        : config.rhythm === "direct"
          ? "On the same wavelength"
          : "Room to breathe",
    nextEncounter: {
      title: "The next evening",
      prompt: "I'm back. What kind of evening are we having?",
      reply: `${opening} ${memory} ${rhythm} ${invitation}`,
    },
    planEncounter: {
      title: "A plan for tonight",
      prompt: "Suppose we had an hour just for us. What would it be like?",
      reply: `${plan} ${memory} ${invitation}`,
    },
    memory: {
      mode: hasMemory ? "chosen-only" : "session-only",
      items,
      description: hasMemory
        ? "Only the preferences and moments you allow."
        : "This encounter only. No lasting memory.",
    },
    powers,
    visibility: config.worldVisible
      ? "A public introduction only. Private memories stay out of World."
      : "Private. No public World introduction.",
  };
}

export function createProfileText(config: CompanionConfig) {
  const profile = getCompanionProfile(config);
  return [
    `REALNPC / ${profile.soul.name}`,
    profile.soul.archetype,
    profile.soul.signature,
    "",
    `Your rhythm: ${profile.relationship}`,
    `Initiative: ${config.takesInitiative ? profile.soul.behavior.initiative : "Waits for your invitation"}`,
    `Warmth: ${profile.soul.behavior.warmth}`,
    `Humor: ${profile.soul.behavior.humor}`,
    "",
    `Memory: ${profile.memory.description}`,
    ...profile.memory.items.map((item) => `- ${item}`),
    `Proposed Powers: ${profile.powers.join(", ")}`,
    `World: ${profile.visibility}`,
    "",
    "Scripted demo. No AI, memory service or hardware connected.",
    "Preset choices only; no dialogue saved. Nothing submitted. Keep this file private.",
  ].join("\n");
}
