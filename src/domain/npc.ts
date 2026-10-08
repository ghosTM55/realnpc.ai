/**
 * The two bodies an NPC can take, shared by the configurator's Vessel choice
 * and the NPC World population. Labels are display copy; values are stable ids.
 */
export const NPC_FORMS = ["robot", "digital-human"] as const;
export type NpcForm = (typeof NPC_FORMS)[number];

export const NPC_FORM_LABELS = {
  robot: "Robot",
  "digital-human": "Digital Human",
} as const satisfies Record<NpcForm, string>;
