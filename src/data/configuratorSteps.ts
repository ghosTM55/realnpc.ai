// Draft v5 adds Details before Review; v4 progress stops at Details.
export const STEP = { soul: 0, personality: 1, presence: 2, details: 3, plan: 4 } as const;
export type StepIndex = (typeof STEP)[keyof typeof STEP];
export const LAST_STEP = STEP.plan;

export function getConfiguratorSteps(soulName: string) {
  return [
    { label: "Character", title: "Choose Your Character", description: "", nextLabel: `Confirm ${soulName}` },
    { label: "Personality", title: "Set Their Personality", description: "Choose a style for each relationship.", nextLabel: "Choose Assembly" },
    { label: "Assembly", title: "Choose Your Setup", description: "Software now. Hardware coming soon.", nextLabel: "Fine-tune Your Soul" },
    { label: "Details", title: "Detailed Settings", description: "Fine-tune your Soul, or continue with the defaults.", nextLabel: "Review Your Soul" },
    { label: "Review", title: `Meet ${soulName}`, description: "", nextLabel: null },
  ] as const;
}
