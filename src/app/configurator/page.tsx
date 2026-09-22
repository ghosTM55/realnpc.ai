import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ConfiguratorExperience from "@/components/configurator/ConfiguratorExperience";

export const metadata: Metadata = {
  title: "RealNPC | Configurator",
  description:
    "Choose a Soul, explore its personality, set your preferences and see your complete companion plan. A no-input scripted demo.",
};

export default function ConfiguratorPage() {
  return (
    <>
      <Nav />
      <ConfiguratorExperience />
    </>
  );
}
