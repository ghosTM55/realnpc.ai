"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import SceneImage from "@/components/SceneImage";
import FocusedPopover from "@/components/assembly/FocusedPopover";
import StageCallouts from "@/components/assembly/StageCallouts";
import StageHotspots from "@/components/assembly/StageHotspots";
import { focusDot } from "@/components/assembly/focusDot";
import type { AssemblyConcept, AssemblyHotspot } from "@/types/domain";

export default function AssemblyStage() {
  const ref = useRef<HTMLElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<AssemblyHotspot | null>(null);
  const [dot, setDot] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState<AssemblyConcept | null>(null);
  const [focusing, setFocusing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const reduceMotion = useRef(false);

  const { contextSafe } = useGSAP(
    () => {
      reduceMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
    },
    { scope: ref },
  );

  // eslint-disable-next-line react-hooks/refs -- standard @gsap/react event-handler pattern
  const resetStage = contextSafe(() => {
    setActive(null);
    setDot(null);

    if (zoomRef.current && !reduceMotion.current) {
      setRestoring(true);
      gsap.to(zoomRef.current, {
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => setRestoring(false),
      });
    }
  });

  // eslint-disable-next-line react-hooks/refs -- standard @gsap/react event-handler pattern
  const focusHotspot = contextSafe((spot: AssemblyHotspot) => {
    if (active?.id === spot.id) {
      resetStage();
      return;
    }

    setActive(spot);

    if (reduceMotion.current || !zoomRef.current) {
      setDot({ x: spot.x, y: spot.y });
      return;
    }

    const frame = focusDot(spot);
    setDot({ x: frame.x, y: frame.y });
    setFocusing(true);

    gsap
      .timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => setFocusing(false),
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

  useGSAP(
    () => {
      if (!active || focusing) return;

      gsap.fromTo(
        "[data-popover]",
        { x: 18, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: "power2.out", delay: 0.1 },
      );
    },
    { scope: ref, dependencies: [active?.id, focusing] },
  );

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
          active={active}
          restoring={restoring}
          onFocus={focusHotspot}
          onHover={setHovered}
        />
        <FocusedPopover active={active} dot={dot} focusing={focusing} />
      </div>
    </section>
  );
}
