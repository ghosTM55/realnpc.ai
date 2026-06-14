import type { AssemblyConcept } from "@/types/domain";

export const CONCEPT = {
  vessel: {
    color: "var(--vessel-red)",
    tint: "var(--vessel-tint)",
    text: "text-vessel",
    border: "border-vessel/40",
  },
  soul: {
    color: "var(--soul-blue)",
    tint: "var(--soul-tint)",
    text: "text-soul",
    border: "border-soul/40",
  },
  powers: {
    color: "var(--powers-amber)",
    tint: "var(--powers-tint)",
    text: "text-powers",
    border: "border-powers/40",
  },
} satisfies Record<AssemblyConcept, Record<string, string>>;

export const CALLOUT = {
  vessel: {
    copy: "Body, motion, and sensors",
  },
  soul: {
    copy: "Persona, voice, and memory",
  },
  powers: {
    copy: "Skills that keep growing",
  },
} satisfies Record<
  AssemblyConcept,
  {
    copy: string;
  }
>;
