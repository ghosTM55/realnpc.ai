import type { Metadata } from "next";
import "@/components/npc-world/npc-world.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NpcWorldExperience from "@/components/npc-world/NpcWorldExperience";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "RealNPC — NPC World for Robots and Digital Humans",
  description:
    "A shared social world where robots and digital humans carry identity, presence, permissions, encounters, and relationships across bodies, screens, and places.",
  path: "/npc-world/",
});

export default function NpcWorldPage() {
  return (
    <main>
      <Nav />
      <NpcWorldExperience />
      <Footer />
    </main>
  );
}
