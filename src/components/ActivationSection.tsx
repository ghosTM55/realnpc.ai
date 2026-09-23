"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ACTIVATION } from "@/data/site";
import styles from "./ActivationSection.module.css";

export default function ActivationSection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-activation-copy] > *", {
          y: 22,
          opacity: 0,
          duration: 0.72,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 76%" },
        });

        gsap.from("[data-activation-panel]", {
          y: 18,
          opacity: 0,
          duration: 0.72,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%" },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-activation-panel]",
            start: "top 68%",
            end: "bottom 82%",
            scrub: 0.7,
          },
        });

        tl.fromTo(
          "[data-activation-signal]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", duration: 1 },
          0,
        );

        tl.from(
          "[data-activation-row]",
          {
            x: 14,
            opacity: 0,
            duration: 0.28,
            stagger: 0.12,
            ease: "power2.out",
          },
          0.06,
        );

        tl.from(
          "[data-activation-node]",
          {
            scale: 0.86,
            opacity: 0,
            duration: 0.18,
            stagger: 0.12,
            ease: "power2.out",
          },
          0.08,
        );
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      id="activation"
      ref={ref}
      className="mx-auto grid max-w-[1248px] gap-12 px-6 py-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(540px,1.12fr)] lg:items-center lg:px-0"
    >
      <div data-activation-copy className="max-w-[500px]">
        <h2 className="font-display text-[34px] font-semibold leading-[1.05] text-ink md:text-[44px]">
          {ACTIVATION.title}
        </h2>
        <p className="mt-5 text-[16px] leading-[1.55] text-steel md:text-[17px]">
          {ACTIVATION.intro}
        </p>
        <p className="mt-6 text-[15px] leading-[1.5] text-ink md:text-[16px]">
          {ACTIVATION.cta.text}
        </p>
        <Link
          href={ACTIVATION.cta.href}
          className="group mt-4 inline-flex items-center gap-2 font-signal text-[13px] font-semibold tracking-[0.04em] text-vessel transition-colors hover:text-ink"
        >
          {ACTIVATION.cta.label}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div
        data-activation-panel
        className="relative min-h-[430px] overflow-hidden rounded-[8px] border border-hairline bg-white/[0.72] px-6 py-6 shadow-[0_18px_48px_rgba(21,24,29,0.07)]"
      >
        <span
          aria-hidden
          className="absolute left-0 top-0 h-11 w-11 border-l border-t border-soul/[0.65]"
        />
        <span
          aria-hidden
          className="absolute bottom-0 right-0 h-11 w-11 border-b border-r border-vessel/[0.55]"
        />

        <div className="border-b border-hairline pb-4">
          <p className="font-signal text-[12px] font-bold tracking-[0.08em] text-ink">
            {ACTIVATION.logLabel}
          </p>
        </div>

        <div className="relative mt-8">
          <div
            aria-hidden
            className="absolute bottom-4 left-[7px] top-4 w-px bg-hairline"
          />
          <div
            data-activation-signal
            aria-hidden
            className="absolute bottom-4 left-[7px] top-4 w-px origin-top bg-[linear-gradient(to_bottom,var(--vessel-red),var(--soul-blue),var(--powers-amber))] shadow-[0_0_16px_color-mix(in_srgb,var(--soul-blue)_42%,transparent)]"
          />

          <ol className="space-y-5">
            {ACTIVATION.states.map((phase) => {
              return (
                <li
                  key={phase.name}
                  data-activation-row
                  data-tone={phase.tone}
                  className={`${styles.phase} grid grid-cols-[18px_minmax(0,1fr)] items-start gap-5`}
                >
                  <span className="relative flex h-6 items-center justify-start pt-1">
                    <span
                      data-activation-node
                      aria-hidden
                      className={`relative z-10 h-3 w-3 rounded-full border border-white bg-tone ${styles.node}`}
                    />
                  </span>

                  <article className="border-b border-hairline pb-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-display text-[19px] font-semibold leading-[1.1] text-ink">
                        {phase.name}
                      </h3>
                      <span
                        className={`shrink-0 border px-2 py-1 font-signal text-[10px] leading-none tracking-[0.08em] bg-tone-tint text-tone ${styles.chip}`}
                      >
                        {phase.tone.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-2 max-w-[430px] text-[13px] leading-[1.45] text-steel">
                      {phase.description}
                    </p>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
