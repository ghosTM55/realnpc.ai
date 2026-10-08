"use client";

import { useEffect, useState, type RefObject } from "react";

/** On screen (past the header) in a visible tab, plus the reduced-motion preference. */
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
