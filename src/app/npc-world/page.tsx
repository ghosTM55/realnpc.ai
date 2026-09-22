import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NpcWorldExperience from "@/components/npc-world/NpcWorldExperience";

export const metadata: Metadata = {
  title: "RealNPC — NPC World for Robots and Digital Humans",
  description:
    "A shared social world where robots and digital humans carry identity, presence, permissions, encounters, and relationships across bodies, screens, and places.",
};

export default function NpcWorldPage() {
  return (
    <main className="bg-paper">
      <Nav />
      <NpcWorldExperience />
      <Footer />
    </main>
  );
}
