"use client";

import styles from "../HeroEntrance.module.css";
import GlobeNpcExplorer from "@/components/npc-world/GlobeNpcExplorer";
import type { ScenarioId, WorldScenario } from "@/data/npcWorldPage";

export default function NpcWorldHero({ scenario, onScenarioChange }: {
  scenario: WorldScenario;
  onScenarioChange: (id: ScenarioId) => void;
}) {
  return (
    <section className={`${styles.world} relative w-full overflow-hidden lg:h-[max(760px,100svh)]`}>
      <GlobeNpcExplorer scenario={scenario} onScenarioChange={onScenarioChange} />
    </section>
  );
}
