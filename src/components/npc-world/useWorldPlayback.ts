"use client";

import { useEffect, useRef, useState } from "react";
import type { WorldScenario } from "@/domain/world/model";
import { storyReadingDuration } from "@/domain/world/story";

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
