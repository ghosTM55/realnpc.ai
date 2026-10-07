import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ConfiguratorExperience from "@/components/configurator/ConfiguratorExperience";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "RealNPC | Configurator",
  description:
    "Choose a Soul, explore its personality, set your preferences and see your complete companion plan. A no-input scripted demo.",
  path: "/configurator/",
});

export default function ConfiguratorPage() {
  return (
    <>
      <Nav />
      <ConfiguratorExperience />
    </>
  );
}
