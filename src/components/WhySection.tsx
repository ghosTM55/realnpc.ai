"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { WHY } from "@/data/site";

export default function WhySection() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-thesis] > *", {
          y: 26,
          opacity: 0,
          duration: 0.8,
          stagger: 0.11,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        });

        gsap.from("[data-supporting]", {
          y: 18,
          opacity: 0,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-supporting]", start: "top 82%" },
        });

        gsap.from("[data-shift]", {
          y: 22,
          opacity: 0,
          duration: 0.65,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-shifts]", start: "top 78%" },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="mx-auto max-w-[1248px] px-6 py-14 lg:px-0">
      <div data-thesis>
        <h2 className="font-display text-[34px] font-semibold leading-[1.04] text-ink md:whitespace-nowrap md:text-[46px] lg:text-[50px]">
          {WHY.statementLine1}
        </h2>
        <h2 className="font-display text-[34px] font-semibold leading-[1.04] text-vessel md:whitespace-nowrap md:text-[46px] lg:text-[50px]">
          {WHY.statementLine2}
        </h2>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
        <div data-supporting className="lg:sticky lg:top-28">
          <div className="flex max-w-[520px] flex-col gap-4 text-[17px] leading-[1.55] text-[#2A323B] md:text-[19px]">
            {WHY.supporting.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div data-shifts className="pt-1">
          <div data-shift>
            <p className="font-signal text-[14px] font-bold tracking-[0.08em] text-ink">
              {WHY.eyebrow}
            </p>
          </div>

          <div className="mt-5 divide-y divide-hairline border-y border-hairline">
            {WHY.shifts.map((shift) => (
              <article
                key={shift.index}
                data-shift
                className="grid gap-4 py-7 md:grid-cols-[66px_minmax(0,1fr)]"
              >
                <span className="font-signal text-[16px] font-semibold text-vessel md:text-[18px]">
                  {shift.index}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-signal text-[13px] tracking-[0.04em] text-muted md:text-[14px]">
                    <span>{shift.from}</span>
                    <ArrowRight size={16} className="text-vessel" />
                    <span className="bg-vessel-tint px-1.5 py-0.5 font-semibold text-ink">
                      {shift.to}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-[23px] font-semibold leading-[1.12] text-ink md:text-[29px]">
                    {shift.title}
                  </h3>
                  <p className="mt-3 max-w-[610px] text-[15px] leading-[1.48] text-steel md:text-[16px]">
                    {shift.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
