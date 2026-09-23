import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import styles from "./HeroEntrance.module.css";
import SceneImage from "@/components/SceneImage";
import { HERO } from "@/data/site";

export default function Hero() {
  return (
    <section className={`${styles.home} relative h-screen w-full overflow-hidden`}>
      <div
        data-hero-background
        className="absolute inset-x-0 bottom-0 top-[72px] will-change-transform"
        aria-hidden
      ><SceneImage scene="hero" /></div>
      <div
        data-hero-copy
        className="absolute inset-x-0 bottom-0 top-[72px] grid w-full grid-cols-1 content-between gap-6 px-6 py-6 min-[480px]:max-lg:landscape:grid-cols-2 min-[480px]:max-lg:landscape:content-normal min-[480px]:max-lg:landscape:items-center min-[480px]:max-lg:landscape:py-3 md:px-10 lg:grid-cols-[minmax(260px,320px)_1fr_minmax(280px,320px)] lg:content-normal lg:items-center lg:gap-10 lg:px-32 lg:py-0 xl:px-[176px] 2xl:px-[224px]"
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
            className="mt-4 font-display text-[clamp(44px,12vw,72px)] font-semibold leading-[0.92] text-ink lg:text-[72px]"
          >
            {HERO.kicker}
          </h1>
          <p
            data-hero-left-item
            className="mt-4 max-w-[24ch] font-body text-[18px] font-semibold leading-[1.25] text-ink lg:mt-5 lg:max-w-none lg:whitespace-nowrap lg:text-[20px] lg:leading-none"
          >
            {HERO.title}
          </p>
        </div>

        <div aria-hidden className="hidden lg:block" />

        <div
          data-hero-brief-panel
          className="hero-brief-panel relative max-w-[340px] justify-self-start rounded-[2px] bg-paper/85 p-4 backdrop-blur-[1px] lg:justify-self-end lg:bg-white/20 lg:p-6"
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
            <div className="mt-3 text-[14px] leading-[1.42] text-ink lg:mt-3.5 lg:text-[18px]">
              <p className="lg:min-h-[26px]">
                <span>{HERO.brief.punchLead}</span>
              </p>
              <p className="mt-2 font-semibold lg:min-h-[52px]">
                <span>{HERO.brief.punch}</span>
              </p>
            </div>
          </div>
          <div
            data-hero-brief-button
            className="mt-4 flex flex-col items-start gap-3 lg:mt-7"
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
