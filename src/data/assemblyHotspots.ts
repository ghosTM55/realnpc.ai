import type { AssemblyHotspot } from "@/types/domain";

/**
 * Data-driven hotspots for the AssemblyStage (Ferrari-style click-to-focus).
 * Coordinates are normalized 0-1 over the stage image and were calibrated
 * against the current three-layer vessel render
 * (public/media/three-layers-parts-wall.jpg).
 * Recalibrate when the final base-vessel image lands.
 */
export const assemblyHotspots: AssemblyHotspot[] = [
  {
    id: "body-platform",
    concept: "vessel",
    label: "Vessel",
    x: 0.24,
    y: 0.43,
    focusScale: 2.4,
    title: "The Body It Lives In.",
    description:
      "The engineered body — materials, motion, and sensors — built to order and serviceable for years.",
    includes: ["Body", "Sensors", "Motion", "Battery"],
  },
  {
    id: "persona-core",
    concept: "soul",
    label: "Soul",
    x: 0.57,
    y: 0.17,
    focusScale: 2.6,
    title: "The Character That Remembers You.",
    description:
      "Its identity, voice, and memory — the character that stays itself, and keeps knowing you, over time.",
    includes: ["Persona", "Voice", "Memory", "Boundaries"],
  },
  {
    id: "capability-layer",
    concept: "powers",
    label: "Powers",
    x: 0.79,
    y: 0.43,
    focusScale: 2.2,
    title: "Abilities That Keep Growing.",
    description:
      "New skills and smarter models that keep arriving — long after it ships.",
    includes: ["New skills", "Upgrades", "Smarter models"],
  },
];
