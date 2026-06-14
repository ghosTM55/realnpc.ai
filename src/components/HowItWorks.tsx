"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { HOW_IT_WORKS } from "@/data/site";

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-how-head] > *", {
          y: 20,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        });

        gsap.from("[data-step]", {
          y: 16,
          opacity: 0,
          duration: 0.5,
          stagger: 0.14,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-timeline]", start: "top 72%" },
        });

        gsap.from("[data-rail-track]", {
          opacity: 0,
          duration: 0.4,
          delay: 0.3,
          ease: "power1.out",
          scrollTrigger: { trigger: "[data-timeline]", start: "top 72%" },
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-timeline]",
            start: "top 78%",
            end: "top 48%",
            scrub: 0.6,
          },
        });

        tl.fromTo(
          "[data-signal-rail]",
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", ease: "none", duration: 1 },
          0,
        );

        const nodes = gsap.utils.toArray<HTMLElement>("[data-node]");
        const last = Math.max(nodes.length - 1, 1);
        nodes.forEach((node, i) => {
          tl.to(
            node,
            {
              backgroundColor: "#43a9c9",
              borderColor: "#43a9c9",
              color: "#ffffff",
              boxShadow:
                "0 0 0 5px #ecf6fa, 0 8px 20px -6px rgba(67,169,201,0.55)",
              scale: 1.08,
              duration: 0.12,
              ease: "power1.out",
            },
            (i / last) * 0.92,
          );
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="mx-auto max-w-[1248px] px-6 py-14 lg:px-0">
      <div data-how-head>
        <h2 className="font-display text-[30px] font-semibold leading-[1.05] text-ink md:text-[38px]">
          {HOW_IT_WORKS.title}
        </h2>
        <p className="mt-3 max-w-[640px] text-[16px] leading-[1.5] text-steel">
          {HOW_IT_WORKS.subtitle}
        </p>
      </div>

      <div data-timeline className="relative mt-14">
        <div
          data-rail-track
          className="absolute left-0 right-0 top-[19px] hidden h-0.5 lg:block"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, rgba(212,13,61,0.28) 0 9px, transparent 9px 15px)",
          }}
        />
        <div
          data-signal-rail
          className="absolute left-0 right-0 top-[19px] hidden h-0.5 lg:block"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, var(--vessel-red) 0 9px, transparent 9px 15px)",
          }}
        />

        <ol className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {HOW_IT_WORKS.steps.map((step) => (
            <li
              key={step.num}
              data-step
              className="relative flex flex-col items-start"
            >
              <span
                data-node
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-soul bg-white font-signal text-[13px] font-semibold text-soul"
              >
                {step.num}
              </span>
              <h3 className="mt-4 font-display text-[18px] font-semibold leading-[1.15] text-ink">
                {step.name}
              </h3>
              <p className="mt-2 max-w-[214px] text-[12.5px] leading-[1.4] text-steel">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
