import type { VesselForm } from "./model.ts";

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

/** `label` is the option, `summary` the plan's summary row; the wording differs on purpose. */
export const VESSEL_OPTIONS = {
  "digital-human": {
    label: "A digital companion",
    summary: "Digital companion",
    description: "On screen, with voice and expression.",
    status: "Your path starts on screen. No hardware commitment.",
  },
  robot: {
    label: "A physical companion",
    summary: "Physical companion",
    description: "An embodied Vessel. Hardware and service review required.",
    status: "Your path now includes hardware, safety and maintenance review.",
  },
  undecided: {
    label: "Keep the form open",
    summary: "Keep the form open",
    description: "Explore digital and physical options.",
    status: "Your path keeps digital and physical options open.",
  },
} as const satisfies Record<VesselForm, { label: string; summary: string; description: string; status: string }>;
