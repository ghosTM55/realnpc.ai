"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { HERO } from "@/data/site";

type BriefField = "label" | "lead" | "punch";
type CursorTarget = BriefField | "done" | "idle";

type TypedBrief = {
  label: string;
  lead: string;
  punch: string;
  cursor: CursorTarget;
  showButton: boolean;
};

const EMPTY_BRIEF: TypedBrief = {
  label: "",
  lead: "",
  punch: "",
  cursor: "idle",
  showButton: false,
};

const TYPE_COPY = {
  label: HERO.brief.label,
  lead: HERO.brief.punchLead,
  punch: HERO.brief.punch,
} as const;

const INITIAL_TYPE_DELAY_MS = 820;
const TYPE_DELAY_MS = 24;
const FIELD_PAUSE_MS = 160;
const BUTTON_DELAY_MS = 260;

function Cursor() {
  return (
    <span
      className="inline-block h-[16px] w-[8px] animate-cursor-blink bg-ink align-middle"
      aria-hidden
    />
  );
}

function InlineCursor() {
  return (
    <span className="whitespace-nowrap">
      &nbsp;
      <Cursor />
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [typedBrief, setTypedBrief] = useState<TypedBrief>(EMPTY_BRIEF);

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

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay);
      timers.push(timer);
    };

    const setFullBrief = () => {
      setTypedBrief({
        ...TYPE_COPY,
        cursor: "done",
        showButton: true,
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      schedule(setFullBrief, 0);

      return () => {
        timers.forEach(clearTimeout);
      };
    }

    let elapsed = INITIAL_TYPE_DELAY_MS;

    const scheduleField = (field: BriefField, text: string) => {
      schedule(() => {
        setTypedBrief((current) => ({ ...current, cursor: field }));
      }, elapsed);

      for (let index = 1; index <= text.length; index += 1) {
        schedule(() => {
          setTypedBrief((current) => ({
            ...current,
            [field]: text.slice(0, index),
            cursor: field,
          }));
        }, elapsed + index * TYPE_DELAY_MS);
      }

      elapsed += text.length * TYPE_DELAY_MS + FIELD_PAUSE_MS;
    };

    scheduleField("label", TYPE_COPY.label);
    scheduleField("lead", TYPE_COPY.lead);
    scheduleField("punch", TYPE_COPY.punch);

    schedule(() => {
      setTypedBrief((current) => ({ ...current, cursor: "done" }));
    }, elapsed);

    schedule(() => {
      setTypedBrief((current) => ({ ...current, showButton: true }));
    }, elapsed + BUTTON_DELAY_MS);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

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
            PRIVATE COMPANION ROBOTICS
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
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-soul" />
              <span>
                {typedBrief.label}
                {typedBrief.cursor === "label" ? <InlineCursor /> : null}
              </span>
            </p>
            <div className="mt-3.5 text-[18px] leading-[1.42] text-ink">
              <p className="min-h-[26px]">
                {typedBrief.lead}
                {typedBrief.cursor === "lead" ? <InlineCursor /> : null}
              </p>
              <p className="mt-2 min-h-[52px] font-semibold">
                {typedBrief.punch}
                {typedBrief.cursor === "punch" || typedBrief.cursor === "done" ? (
                  <InlineCursor />
                ) : null}
              </p>
            </div>
          </div>
          <div
            data-hero-brief-button
            className={`mt-7 flex flex-col items-start gap-3 transition-[opacity,transform] duration-300 ease-out ${
              typedBrief.showButton
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
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
