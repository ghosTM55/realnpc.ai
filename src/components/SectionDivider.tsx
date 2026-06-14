"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function SectionDivider({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-rail]", {
          scaleX: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        });
        gsap.from("[data-pulse]", {
          opacity: 0,
          scaleX: 0,
          duration: 0.5,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className="mx-auto flex h-[72px] max-w-[1248px] items-center gap-3 px-6 lg:px-0"
    >
      <span
        data-rail
        className="h-px flex-1 origin-right bg-divider"
        aria-hidden
      />
      <span data-pulse className="h-1 w-11 bg-vessel" aria-hidden />
      <span className="whitespace-nowrap font-signal text-[16px] font-bold tracking-[0.08em] text-[#2A323B] md:text-[18px]">
        {label}
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
