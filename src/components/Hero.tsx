"use client";

import { useRef } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { HERO } from "@/data/site";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero-left-item]", {
          y: 28,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.15,
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <div
        data-hero-background
        className="absolute inset-x-0 bottom-0 top-[72px] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: "url(/media/hero-freeze-test.jpg)" }}
        aria-hidden
      />
      <div
        data-hero-copy
        className="absolute inset-x-0 bottom-0 top-[72px] grid w-full grid-cols-[minmax(260px,320px)_1fr_minmax(280px,320px)] items-center gap-10 px-10 lg:px-32 xl:px-[176px] 2xl:px-[224px]"
      >
        <div className="max-w-[360px]">
          <p
            data-hero-left-item
            className="font-signal text-[12px] font-semibold tracking-[0.08em] text-vessel"
          >
            BESPOKE COMPANION ROBOTICS
          </p>
          <h1
            data-hero-left-item
            className="mt-4 font-display text-[72px] font-semibold leading-[0.92] text-ink"
          >
            {HERO.kicker}
          </h1>
          <p
            data-hero-left-item
            className="mt-5 whitespace-nowrap font-body text-[20px] font-semibold leading-none text-ink"
          >
            {HERO.title}
          </p>
        </div>

        <div aria-hidden />

        <div
          data-hero-brief-panel
          className="hero-brief-panel relative max-w-[340px] justify-self-end rounded-[2px] bg-white/20 p-6 backdrop-blur-[1px]"
        >
          {/* viewfinder corner brackets, same HUD language as the stage callouts */}
          <span
            className="pointer-events-none absolute -inset-1.5 text-steel/35"
            aria-hidden
          >
            <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-current" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-current" />
          </span>
          <div>
            <p className="flex min-h-[15px] items-center gap-2 font-signal text-[12px] font-semibold tracking-[0.18em] text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-soul" />
              <span>{HERO.brief.label}</span>
            </p>
            <div className="mt-3.5 text-[18px] leading-[1.42] text-ink">
              <p className="min-h-[26px]">
                <span>{HERO.brief.punchLead}</span>
              </p>
              <p className="mt-2 min-h-[52px] font-semibold">
                <span>{HERO.brief.punch}</span>
              </p>
            </div>
          </div>
          <div
            data-hero-brief-button
            className="mt-7 flex flex-col items-start gap-3"
          >
            <Link
              href={HERO.primaryCta.href}
              className="flex h-12 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[4px] bg-vessel px-5 text-[14px] font-semibold text-white transition-[opacity,transform] hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 active:scale-[0.99]"
            >
              {HERO.primaryCta.label}
              <SlidersHorizontal size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
