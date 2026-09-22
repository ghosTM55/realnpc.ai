"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { storyReadingDuration, type WorldScenario } from "@/data/npcWorldPage";

export function useSceneActivity(ref: RefObject<HTMLElement | null>, threshold = 0.1) {
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncVisibility = () => setForeground(document.visibilityState === "visible");
    const syncMotion = () => setReducedMotion(motion.matches);
    syncVisibility();
    syncMotion();
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting && entry.intersectionRatio >= threshold)),
      { threshold: [0, threshold], rootMargin: "-76px 0px -5% 0px" },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", syncVisibility);
    motion.addEventListener("change", syncMotion);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      motion.removeEventListener("change", syncMotion);
    };
  }, [ref, threshold]);

  return { active: visible && foreground, reducedMotion };
}

export function useWorldPlayback(scenario: WorldScenario, active: boolean) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(storyReadingDuration(scenario, 0));
  const timedStep = useRef(0);
  const finished = index === scenario.steps.length - 1;

  useEffect(() => {
    if (timedStep.current !== index) {
      remaining.current = storyReadingDuration(scenario, index);
      timedStep.current = index;
    }
    if (!active || paused || finished) return;
    const started = performance.now();
    const timer = window.setTimeout(() => setIndex((value) => value + 1), remaining.current);
    return () => {
      window.clearTimeout(timer);
      // Keep unread time when scrolling away, switching tabs, or pausing.
      remaining.current = Math.max(100, remaining.current - (performance.now() - started));
    };
  }, [active, finished, index, paused, scenario]);

  return {
    index, paused, finished,
    playing: active && !paused && !finished,
    select: (next: number) => { setPaused(true); setIndex(next); },
    toggle: () => {
      if (finished) {
        remaining.current = storyReadingDuration(scenario, 0);
        setIndex(0);
        setPaused(false);
      } else setPaused((value) => !value);
    },
    pause: () => setPaused(true),
  };
}
