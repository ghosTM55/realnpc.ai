"use client";

import styles from "../HeroEntrance.module.css";
import GlobeNpcExplorer from "@/components/npc-world/GlobeNpcExplorer";

export default function NpcWorldHero() {
  return (
    <section className={`${styles.world} relative w-full overflow-hidden`}>
      <GlobeNpcExplorer />
    </section>
  );
}
