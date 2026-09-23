"use client";

import { useRef } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CONFIG_CTA_HREF, CONFIG_CTA_LABEL } from "@/data/site";

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-cta]", {
          scale: 0.95,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%" },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="mx-auto flex h-[150px] max-w-[1248px] items-center justify-center gap-6 px-6 lg:px-0"
    >
      <span className="hidden h-px w-[270px] bg-divider lg:block" aria-hidden />
      <Link
        data-cta
        href={CONFIG_CTA_HREF}
        className="flex h-[90px] w-full max-w-[520px] items-center justify-center gap-4 rounded-[5px] bg-vessel text-[24px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.99]"
      >
        {CONFIG_CTA_LABEL}
        <SlidersHorizontal size={24} />
      </Link>
      <span className="hidden h-px w-[270px] bg-divider lg:block" aria-hidden />
    </section>
  );
}
