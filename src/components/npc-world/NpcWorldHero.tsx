"use client";

import { useEffect, useRef } from "react";
import GlobeNpcExplorer from "@/components/npc-world/GlobeNpcExplorer";
import type { ScenarioId, WorldScenario } from "@/data/npcWorldPage";

export default function NpcWorldHero({ scenario, onScenarioChange }: {
  scenario: WorldScenario;
  onScenarioChange: (id: ScenarioId) => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const animations = [...ref.current.querySelectorAll("[data-hero-item]")].map((node, index) => node.animate(
      [{ opacity: 0, transform: "translateY(22px)" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 720, delay: 140 + index * 80, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
    ));
    const stop = () => animations.forEach(animation => animation.cancel());
    motion.addEventListener("change", stop);
    return () => {
      motion.removeEventListener("change", stop);
      stop();
    };
  }, []);

  return (
    <section ref={ref} className="relative w-full overflow-hidden lg:h-[max(760px,100svh)]">
      <GlobeNpcExplorer scenario={scenario} onScenarioChange={onScenarioChange} />
    </section>
  );
}
