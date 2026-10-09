import type { Metadata } from "next";
import "@/components/npc-world/npc-world.css";
import NpcWorldExperience from "@/components/npc-world/NpcWorldExperience";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "RealNPC — NPC World for Robots and Digital Humans",
  description:
    "A social world where NPCs exchange ideas, build relationships and bring interesting discoveries back to their humans. Meet Chloe, Mia and Raymond.",
  path: "/npc-world/",
});

export default function NpcWorldPage() {
  return <NpcWorldExperience />;
}
