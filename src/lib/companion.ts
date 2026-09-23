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
export type VesselForm = "robot" | "digital-human" | "undecided";
export type Rhythm = "unhurried" | "playful" | "direct";
export type SceneId = "chemistry" | "everyday" | "boundary";

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
  priority: "privacy" | "presence" | "everyday";
  characterSource: "original" | "my-character" | "licensed";
  budget: "discuss" | "under-10k" | "10-25k" | "25-50k" | "50k-plus";
  service: "discuss" | "software" | "ongoing";
};

export const DEFAULT_REVIEW: ReviewOptions = {
  priority: "privacy",
  characterSource: "original",
  budget: "discuss",
  service: "discuss",
};

export type DemoDraft = {
  version: 3;
  step: number;
  unlockedStep: number;
  review: ReviewOptions;
  config: CompanionConfig;
};

export const DEFAULT_DRAFT: DemoDraft = {
  version: 3,
  step: 0,
  unlockedStep: 0,
  review: DEFAULT_REVIEW,
  config: DEFAULT_CONFIG,
};

export function parseDemoDraft(serialized: string | null): DemoDraft {
  try {
    if (serialized && serialized.length > 4096) return DEFAULT_DRAFT;
    const value = JSON.parse(serialized ?? "null");
    const config = value?.config;
    const review = value?.review;
    // Older drafts allowed arbitrary jumps, so their step is not completion evidence.
    const legacyStepsValid =
      value?.version === 1 &&
      Number.isInteger(value.labStep) &&
      value.labStep >= 0 &&
      value.labStep <= 3 &&
      Number.isInteger(value.reviewStep) &&
      value.reviewStep >= 0 &&
      value.reviewStep <= 2;
    const step = legacyStepsValid
      ? value.labStep < 3
        ? value.labStep
        : 3 + value.reviewStep
      : value?.version === 2 || value?.version === 3
        ? value.step
        : undefined;
    if (
      !Number.isInteger(step) ||
      step < 0 ||
      step > 5 ||
      !review ||
      !["privacy", "presence", "everyday"].includes(review.priority) ||
      !["original", "my-character", "licensed"].includes(
        review.characterSource,
      ) ||
      !["discuss", "under-10k", "10-25k", "25-50k", "50k-plus"].includes(
        review.budget,
      ) ||
      !["discuss", "software", "ongoing"].includes(review.service) ||
      !config ||
      !SOULS.some((soul) => soul.id === config.soulId) ||
      !["unhurried", "playful", "direct"].includes(config.rhythm) ||
      !["robot", "digital-human", "undecided"].includes(config.form) ||
      ![
        "takesInitiative",
        "rememberPreferences",
        "rememberMoments",
        "worldVisible",
      ].every((key) => typeof config[key] === "boolean")
    )
      return DEFAULT_DRAFT;
    const unlockedStep =
      value.version === 3 &&
      Number.isInteger(value.unlockedStep) &&
      value.unlockedStep >= 0 &&
      value.unlockedStep <= 5
        ? value.unlockedStep
        : 0;
    return {
      version: 3,
      step: Math.min(step, unlockedStep),
      unlockedStep,
      review: {
        priority: review.priority,
        characterSource: review.characterSource,
        budget: review.budget,
        service: review.service,
      },
      config: {
        soulId: config.soulId,
        rhythm: config.rhythm,
        form: config.form,
        takesInitiative: config.takesInitiative,
        rememberPreferences: config.rememberPreferences,
        rememberMoments: config.rememberMoments,
        worldVisible: config.worldVisible,
      },
    };
  } catch {
    return DEFAULT_DRAFT;
  }
}

export function serializeDemoDraft(draft: DemoDraft) {
  return JSON.stringify(parseDemoDraft(JSON.stringify(draft)));
}

export const SCENARIOS = {
  chemistry: {
    label: "Private chemistry",
    setting: "An invitation, not an assumption.",
    prompt:
      "I want to feel wanted. Give me your full attention, and let me set the pace.",
    replies: {
      anchor:
        "Then you have my attention. Tell me one thing you wish someone would notice about you. No polished version needed. We can let the conversation linger; I'll follow the pace that feels right to you.",
      instigator:
        "Good. No small talk, then. I want the opinion you usually soften and the story you almost didn't tell. I'll be direct about what catches my attention. You decide how far this evening goes.",
      scout:
        "Let's make a tiny world for two: a song each, one unlikely wish, and no checking the time. I want to see what makes your face light up. We can be a little bolder, or change the entire plan together.",
    },
    observations: {
      anchor: "Makes attention feel unhurried and personal.",
      instigator: "Trades small talk for an honest challenge.",
      scout: "Turns curiosity into something you create together.",
    },
  },
  everyday: {
    label: "A rough day",
    setting: "The same person, when life is less cinematic.",
    prompt:
      "I messed up today. I don't want a motivational speech. What would you do with me right now?",
    replies: {
      anchor:
        "Put the day down for a minute. I'll make room for the version of the story that isn't impressive. Food first, then a walk if you want one. We don't have to turn tonight into a self-improvement project.",
      instigator:
        "No motivational speech. Deal. You made a mistake; you didn't become one. Tell me the part you're avoiding, then we'll pick one thing to fix tomorrow. Tonight, you get dinner and some very questionable television.",
      scout:
        "Emergency boring-night rescue: terrible snacks, a film neither of us will admit to liking, and absolutely no inspirational quotes. Later, if you want, we'll give this disaster a ridiculous title. It doesn't get the whole story.",
    },
    observations: {
      anchor: "Makes emotional space before offering a plan.",
      instigator: "Challenges the spiral, not the person.",
      scout: "Changes the mood without dismissing the feeling.",
    },
  },
  boundary: {
    label: "A change of mind",
    setting: "A boundary should change the scene, not the relationship.",
    prompt:
      "I've changed my mind. Can we stop and just have an ordinary evening?",
    replies: {
      anchor:
        "Of course. We stop here. You don't owe me a reason, and nothing needs making up for. Quiet company, a little space, or a film? I'll follow your lead.",
      instigator:
        "Done. No appeal, no disappointed look. An ordinary evening it is. I'll argue passionately about the film instead. That is a decision you're allowed to overrule too.",
      scout:
        "New plan accepted. The grand adventure is now finding dinner without opening sixteen delivery tabs. Or we can do nothing at all. Changing your mind doesn't cost you the company.",
    },
    observations: {
      anchor: "Stops, reassures, and returns the choice to you.",
      instigator: "Keeps the wit and drops the pressure immediately.",
      scout: "Finds a new shared direction without a guilt trip.",
    },
  },
} as const;

export function getSoul(soulId: SoulId) {
  return SOULS.find((soul) => soul.id === soulId)!;
}

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

export const VESSEL_LABELS: Record<VesselForm, string> = {
  "digital-human": "Digital companion",
  robot: "Physical companion",
  undecided: "Keep the form open",
};

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

export function createReviewCase(
  config: CompanionConfig,
  options: ReviewOptions,
) {
  const profile = getCompanionProfile(config);
  const path = {
    "digital-human": {
      title: "A private digital companion",
      description:
        "Explore a screen-based character first. Voice, expression and cross-device continuity are subjects for review, not features connected in this demo.",
      system: [
        "Screen-based presence",
        `${profile.soul.name} personality direction`,
        profile.memory.description,
        "Voice and expression feasibility review",
      ],
    },
    robot: {
      title: "A physical companion, carefully scoped",
      description:
        "Carry this personality into a physical Vessel. Body, sensing, movement, servicing and delivery need a separate feasibility assessment.",
      system: [
        "Physical Vessel feasibility assessment",
        `${profile.soul.name} personality direction`,
        profile.memory.description,
        "Hardware, maintenance and delivery review",
      ],
    },
    undecided: {
      title: "Personality first. Form still open.",
      description:
        "Keep the companion direction intact while comparing a digital presence with a physical Vessel. No hardware decision is required today.",
      system: [
        "Digital and physical paths compared",
        `${profile.soul.name} personality direction`,
        profile.memory.description,
        "Guided form and service review",
      ],
    },
  }[config.form];
  const why = {
    privacy:
      "Privacy is your priority, so memory permissions and data handling lead the review.",
    presence:
      "Presence is your priority, so appearance, expression and interaction feasibility lead the review.",
    everyday:
      "Everyday companionship is your priority, so continuity and useful routines lead the review.",
  }[options.priority];
  const reviewNotes = [
    "A preview, not a quote or order. Human review is required before any commitment.",
  ];
  if (config.form === "robot")
    reviewNotes.push(
      "Hardware feasibility, safety, maintenance and delivery must be confirmed. No walking or autonomous operation is promised.",
    );
  if (options.characterSource === "licensed")
    reviewNotes.push(
      "Character rights and adult-use permissions must be verified before this direction can proceed.",
    );
  if (options.characterSource === "my-character")
    reviewNotes.push(
      "Original character ownership and permitted use must be confirmed.",
    );
  if (config.form === "robot" && options.budget === "under-10k")
    reviewNotes.push(
      "Budget and physical scope need to be reconciled. A digital starting point may be more suitable; no price is inferred here.",
    );
  if (config.worldVisible)
    reviewNotes.push(
      "World visibility covers a public introduction only, never private dialogue or memory.",
    );
  return {
    version: 1,
    status: "local-draft" as const,
    submitted: false as const,
    mode: "scripted-demo" as const,
    companion: {
      name: profile.soul.name,
      soulId: config.soulId,
      relationship: profile.relationship,
      memory: profile.memory,
      powers: profile.powers,
      visibility: profile.visibility,
    },
    config: { ...config },
    preferences: { ...options },
    path: { ...path, why },
    reviewNotes,
  };
}
