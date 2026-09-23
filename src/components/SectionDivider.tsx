"use client";

import { useEffect, useRef } from "react";
import styles from "./SectionDivider.module.css";

export default function SectionDivider({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const sync = () => {
      observer?.disconnect();
      delete node.dataset.enter;
      // Never hide content already visible before hydration.
      if (motion.matches || node.getBoundingClientRect().top < window.innerHeight) return;
      node.dataset.enter = "pending";
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.enter = "playing";
        observer?.disconnect();
      }, { rootMargin: `0px 0px -${Math.round(window.innerHeight * 0.15)}px 0px` });
      observer.observe(node);
    };
    sync();
    motion.addEventListener("change", sync);
    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", sync);
      delete node.dataset.enter;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.divider} mx-auto flex h-[72px] max-w-[1248px] items-center gap-3 px-6 lg:px-0`}
    >
      <span
        data-rail
        className="h-px flex-1 origin-right bg-divider"
        aria-hidden
      />
      <span data-pulse className="h-1 w-11 bg-vessel" aria-hidden />
      <span
        className="inline-block whitespace-nowrap font-signal text-[16px] font-bold tracking-[0.08em] text-[#2A323B] md:text-[18px]"
      >
        <span className="sr-only">{label}</span>
        <span aria-hidden>{Array.from(label).map((character, index) => (
          <span key={index} className={styles.character} style={{ animationDelay: `${index * 40}ms` }}>{character}</span>
        ))}</span>
      </span>
      <span data-pulse className="h-1 w-11 bg-vessel" aria-hidden />
      <span
        data-rail
        className="h-px flex-1 origin-left bg-divider"
        aria-hidden
      />
    </div>
  );
}
