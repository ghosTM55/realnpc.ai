export const BRAND = "RealNPC";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "NPC World", href: "/npc-world" },
  { label: "Partnership", href: "/partnership" },
] as const;

/** Shared wording for every public companion-creation CTA. */
export const CONFIG_CTA_LABEL = "Create a Soul";

export const HERO = {
  kicker: BRAND,
  title: "The first NPC that lives in your world.",
  /** Right-column HUD readout. */
  brief: {
    label: "SYSTEM BRIEF",
    punchLead: "Not a toy with fixed functions.",
    punch: "A bespoke character that levels up in your world.",
  },
  primaryCta: { label: CONFIG_CTA_LABEL, href: "/companion-lab" },
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
  cta: {
    text:
      "Activation is only the doorway. From here it starts living in your world: places to explore, quests to carry, and context to unlock.",
    label: "See how it plays",
    href: "/npc-world",
  },
} as const;

/** `/partnership` page copy. Partner-facing, not customer acquisition copy. */
export const PARTNERSHIP = {
  hero: {
    kicker: "PARTNERSHIP",
    title: "Build the world RealNPCs can enter.",
    lead: "RealNPC sits between character IP, modular robotics hardware, and real-world places. We are looking for partners who can help make companions recognizable, buildable, and useful beyond the screen.",
    signal: [
      "Licensed characters",
      "Standard hardware modules",
      "Real-world activation sites",
    ],
  },
  thesis: {
    kicker: "THE SHARED THESIS",
    title: "A companion robot is not a single product category.",
    body: "It becomes valuable when identity, body, and place reinforce each other. Partnership is how RealNPC turns that stack into a business system instead of a one-off device.",
  },
  lanes: [
    {
      index: "01",
      tone: "soul" as const,
      label: "IP Owners",
      title: "Turn characters into companions people can live with.",
      description:
        "We want to work with IP owners who can license characters, worlds, and recognizable identities into RealNPC. Together, we can move character value from media exposure into embodied services, recurring interaction, and new commercial models.",
      contribution: "Character IP, visual identity, story rules, fan trust.",
      outcome: "New licensing formats for robot applications and services.",
    },
    {
      index: "02",
      tone: "vessel" as const,
      label: "Robotics Hardware Suppliers",
      title: "Make more builds possible through standardized modules.",
      description:
        "We want suppliers who can provide reliable hardware modules, components, sensors, motion systems, shells, and serviceable parts. The goal is to offer customers a wider configuration range without turning every build into custom engineering from zero.",
      contribution: "Modules, components, integration specs, service support.",
      outcome: "A broader library of standardized hardware options.",
    },
    {
      index: "03",
      tone: "powers" as const,
      label: "Offline Retail & Venue Networks",
      title: "Create places where robots can prove new behaviors.",
      description:
        "We want large offline chains and physical venues to explore real-world use cases with us. Stores, experience centers, malls, hotels, and entertainment networks can become testbeds for research, scenario design, and business model innovation.",
      contribution: "Physical spaces, operating scenes, users, local context.",
      outcome: "Commercial pilots for real-world robot interaction.",
    },
  ],
  close: {
    label: "PARTNER INTAKE",
    title: "If your work touches character, hardware, or place, we should talk.",
    text: "Partnerships are reviewed around fit, feasibility, privacy, safety, and long-term serviceability before any public pilot.",
    cta: "Start a partnership conversation",
    href: "mailto:partnerships@realnpc.ai",
  },
} as const;
