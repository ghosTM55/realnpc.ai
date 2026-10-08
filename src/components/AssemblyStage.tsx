"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import SceneImage from "@/components/SceneImage";
import FocusedPopover from "@/components/assembly/FocusedPopover";
import StageCallouts from "@/components/assembly/StageCallouts";
import StageHotspots from "@/components/assembly/StageHotspots";
import { focusDot } from "@/components/assembly/focusDot";
import { IDLE, stageSpot, type Stage } from "@/components/assembly/stage";
import type { AssemblyHotspot, SemanticTone } from "@/types/domain";

export default function AssemblyStage() {
  const ref = useRef<HTMLElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>(IDLE);
  const [hovered, setHovered] = useState<SemanticTone | null>(null);
  const animation = useRef<gsap.core.Animation | null>(null);
  const { contextSafe } = useGSAP({ scope: ref });
  const active = stageSpot(stage);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (!motion.matches) return;
      animation.current?.kill();
      if (zoomRef.current) gsap.set(zoomRef.current, { clearProps: "transform,transformOrigin" });
      setStage((current) =>
        "spot" in current ? { phase: "focused", spot: current.spot, zoomed: false } : IDLE,
      );
    };
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  // eslint-disable-next-line react-hooks/refs -- standard @gsap/react event-handler pattern
  const resetStage = contextSafe(() => {
    animation.current?.kill();

    if (!zoomRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(IDLE);
      return;
    }

    setStage({ phase: "restoring" });
    animation.current = gsap.to(zoomRef.current, {
      scale: 1,
      xPercent: 0,
      yPercent: 0,
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => setStage(IDLE),
    });
  });

  // eslint-disable-next-line react-hooks/refs -- standard @gsap/react event-handler pattern
  const focusHotspot = contextSafe((spot: AssemblyHotspot) => {
    if (active?.id === spot.id) {
      resetStage();
      return;
    }

    animation.current?.kill();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !zoomRef.current) {
      setStage({ phase: "focused", spot, zoomed: false });
      return;
    }

    const frame = focusDot(spot);
    setStage({ phase: "focusing", spot, zoomed: true });

    animation.current = gsap
      .timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => setStage({ phase: "focused", spot, zoomed: true }),
      })
      .to(zoomRef.current, {
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        duration: 0.25,
      })
      .set(zoomRef.current, {
        transformOrigin: `${frame.cx * 100}% ${frame.cy * 100}%`,
      })
      .to(zoomRef.current, {
        scale: spot.focusScale,
        xPercent: (0.5 - frame.cx) * 100,
        yPercent: (0.5 - frame.cy) * 100,
        duration: 0.75,
      });
  });

  // Escape closes the open layer and returns focus to its marker, the only
  // keyboard target for each layer.
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      resetStage();
      ref.current
        ?.querySelector<HTMLButtonElement>(`[data-hotspot-id="${active.id}"]`)
        ?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, resetStage]);

  return (
    <section
      id="layers"
      ref={ref}
      className="relative h-screen w-full overflow-hidden"
    >
      {active && (
        <button
          type="button"
          aria-label="Close layer detail"
          onClick={resetStage}
          className="absolute inset-0 cursor-default"
        />
      )}

      <div
        ref={zoomRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[72px] will-change-transform"
      >
        <div
          data-stage-background
          className="absolute inset-0"
          aria-hidden
        ><SceneImage scene="assembly" /></div>
        <StageHotspots
          active={active}
          hovered={hovered}
          onFocus={focusHotspot}
          onHover={setHovered}
        />
      </div>

      <div
        data-assembly-overlay
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[72px]"
      >
        <StageCallouts
          suppressed={stage.phase !== "idle"}
          onFocus={focusHotspot}
          onHover={setHovered}
        />
        <FocusedPopover stage={stage} />
      </div>
    </section>
  );
}
