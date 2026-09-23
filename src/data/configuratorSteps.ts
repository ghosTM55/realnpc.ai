// Order matches draft schema v3. Reordering steps requires a draft migration.
export function getConfiguratorSteps(soulName: string) {
  return [
    {
      label: "Choose Soul", eyebrow: "Chemistry",
      title: "Choose your Soul.",
      description: "One request. Three replies. Pick a personality.",
      nextLabel: `Continue with ${soulName}`,
    },
    {
      label: "Meet them", eyebrow: "Everyday life",
      title: `Life with ${soulName}.`,
      description: "See the same personality in different moments.",
      nextLabel: "Set preferences",
    },
    {
      label: "Your terms", eyebrow: soulName,
      title: "On your terms.",
      description: "Set the pace and what carries forward.",
      nextLabel: "Choose presence",
    },
    {
      label: "Presence", eyebrow: "Presence",
      title: `Bring ${soulName} into your world.`,
      description: "Choose a form. See what it would take to build.",
      nextLabel: "Set priorities",
    },
    {
      label: "Priorities", eyebrow: "Priorities",
      title: "What matters most?",
      description: "Adjust the direction, or continue with these defaults.",
      nextLabel: "View your plan",
    },
    {
      label: "Your plan", eyebrow: "Your plan",
      title: "Your companion plan.",
      description: "Your personality, preferences and presence. Save this plan to keep it. Nothing is submitted.",
      nextLabel: null,
    },
  ] as const;
}
