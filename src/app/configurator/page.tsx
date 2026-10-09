import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ConfiguratorExperience from "@/components/configurator/ConfiguratorExperience";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "RealNPC | Create a Soul",
  description:
    "Meet Chloe, Mia or Raymond. Choose a character, shape how you connect, pick a form, fine-tune capabilities, and review your Soul.",
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
