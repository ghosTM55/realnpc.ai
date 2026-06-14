export const BRAND = "RealNPC";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Gamification", href: "/gamification" },
  { label: "FAQ", href: "#faq" },
] as const;

/** Single source of truth for every configuration CTA on the site. */
export const CONFIG_CTA_LABEL = "Start Configuration";

export const HERO = {
  kicker: BRAND,
  title: "The first NPC that lives in your world.",
  /** Right-column HUD readout. */
  brief: {
    label: "SYSTEM BRIEF",
    punchLead: "Not a toy with fixed functions.",
    punch: "A bespoke character that levels up in your world.",
  },
  primaryCta: { label: "Start Configuration", href: "/configurator" },
} as const;

export const WHY = {
  statementLine1: "More than a device. More than a toy.",
  statementLine2: "A companion that evolves, and surprises.",
  supporting: [
    "Something this personal shouldn't come off a shelf.",
    "RealNPC composes one from your intent — a Vessel for its body, a Soul for its character, and Powers that keep expanding what it can do.",
  ],
  eyebrow: "FROM A PURCHASE TO A RELATIONSHIP",
  shifts: [
    {
      index: "01",
      from: "SKU selection",
      to: "Intent intake",
      title: "Intent before inventory",
      description:
        "You don't start by comparing model numbers. You start with the companion you want in your life.",
    },
    {
      index: "02",
      from: "Hardware specs",
      to: "Vessel · Soul · Powers",
      title: "A companion, not a parts list",
      description:
        "Body, character, and capability are shaped as one path — not three carts you check out separately.",
    },
    {
      index: "03",
      from: "Instant checkout",
      to: "Private review",
      title: "Reviewed before it's built",
      description:
        "Every serious build is reviewed for feasibility, consent, and serviceability before anything is made.",
    },
    {
      index: "04",
      from: "Final product",
      to: "Keeps growing",
      title: "It arrives, then it grows",
      description:
        "Its Soul adapts to your taste and new Powers arrive over time — the companion you get is not the one you'll have in a year.",
    },
  ],
} as const;

export const HOW_IT_WORKS = {
  title: "From intention to your companion.",
  subtitle:
    "You describe the companion you want. We handle the complexity and bring back one build we can actually deliver.",
  steps: [
    {
      num: "01",
      name: "Your intent",
      description: "You describe the companion you want — not a spec sheet.",
    },
    {
      num: "02",
      name: "Your build",
      description: "We translate it into a Vessel, Soul, and Powers.",
    },
    {
      num: "03",
      name: "Private review",
      description:
        "Together we confirm what's feasible, private, and serviceable — before anything is made.",
    },
    {
      num: "04",
      name: "Production",
      description:
        "Bespoke is never rushed — weeks to build, years to keep.",
    },
    {
      num: "05",
      name: "Have fun",
      description:
        "Live with it and play — your companion keeps learning and evolving with you.",
    },
  ],
} as const;

export const ACTIVATION = {
  title: "Activated once. Evolving over time.",
  intro:
    "Your companion ships with its Vessel, Soul, and first Power configured. Memory, routines, and new capabilities then compound on the same build.",
  logLabel: "COMPANION EVOLUTION",
  states: [
    {
      name: "Vessel online",
      description: "Body, sensors, motion, and service baseline are active.",
      tone: "vessel" as const,
    },
    {
      name: "Soul initialized",
      description: "Persona, voice, taste, and memory boundaries are set.",
      tone: "soul" as const,
    },
    {
      name: "First Power installed",
      description: "The initial capability pack is ready for use.",
      tone: "powers" as const,
    },
    {
      name: "Routines learned",
      description: "Preferences and interaction patterns refine over time.",
      tone: "soul" as const,
    },
    {
      name: "New Powers added",
      description: "Capability packs extend the same companion.",
      tone: "powers" as const,
    },
  ],
} as const;
