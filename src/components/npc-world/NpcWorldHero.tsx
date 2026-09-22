"use client";

import { useEffect, useRef } from "react";
import { animate, shouldReduceMotion, stagger } from "@/lib/anime";
import GlobeNpcExplorer from "@/components/npc-world/GlobeNpcExplorer";
import type { ScenarioId, WorldScenario } from "@/data/npcWorldPage";

export default function NpcWorldHero({ scenario, onScenarioChange }: {
  scenario: WorldScenario;
  onScenarioChange: (id: ScenarioId) => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current || shouldReduceMotion()) return;
    const intro = animate(ref.current.querySelectorAll("[data-hero-item]"), {
      opacity: [0, 1],
      y: [22, 0],
      duration: 720,
      delay: stagger(80, { start: 140 }),
      ease: "outExpo",
    });
    return () => {
      intro.revert();
    };
  }, []);

  return (
    <section ref={ref} className="relative w-full overflow-hidden lg:h-[max(760px,100svh)]">
      <GlobeNpcExplorer scenario={scenario} onScenarioChange={onScenarioChange} />
    </section>
  );
}
