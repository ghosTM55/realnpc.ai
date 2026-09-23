import { assemblyHotspots } from "@/data/assemblyHotspots";
import type { AssemblyConcept, AssemblyHotspot } from "@/types/domain";
import { CALLOUT, CONCEPT } from "./assemblyStageConfig";

type StageCalloutsProps = {
  active: AssemblyHotspot | null;
  restoring: boolean;
  onFocus: (spot: AssemblyHotspot) => void;
  onHover: (concept: AssemblyConcept | null) => void;
};

export default function StageCallouts({
  active,
  restoring,
  onFocus,
  onHover,
}: StageCalloutsProps) {
  const isOverlaySuppressed = active !== null || restoring;

  return (
    <>
      <div
        className="pointer-events-none absolute bottom-8 left-6 z-20 w-max max-w-[calc(100%-3rem)] transition-opacity duration-200 lg:bottom-10 lg:left-[72px] lg:max-w-none"
        style={{ opacity: isOverlaySuppressed ? 0 : 1 }}
      >
        <div className="relative border border-white/60 bg-white/[0.72] px-4 py-3.5 shadow-[0_14px_34px_rgba(21,24,29,0.08)] backdrop-blur-[1px]">
          <span
            className="pointer-events-none absolute -inset-1 text-steel/35"
            aria-hidden
          >
            <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-current" />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-current" />
          </span>
          <div className="grid grid-cols-3 gap-1" aria-hidden>
            <span className="h-0.5 bg-vessel" />
            <span className="h-0.5 bg-soul" />
            <span className="h-0.5 bg-powers" />
          </div>
          <h2 className="mt-3 font-display text-[18px] font-semibold leading-none text-ink">
            Vessel · Soul · Powers
          </h2>
          <p className="mt-2 text-[12px] leading-[1.35] text-steel lg:whitespace-nowrap">
            Body, character, and capability in one build.
          </p>
        </div>
      </div>

      {assemblyHotspots.map((spot) => {
        const c = CONCEPT[spot.concept];
        const callout = CALLOUT[spot.concept];
        const isActive = active?.id === spot.id;

        return (
          <button
            key={`${spot.id}-callout`}
            type="button"
            aria-label={`Focus the ${spot.label} layer`}
            aria-expanded={isActive}
            onClick={() => onFocus(spot)}
            onMouseEnter={() => onHover(spot.concept)}
            onMouseLeave={() => onHover(null)}
            className="group/callout pointer-events-auto absolute z-20 mt-9 w-[88px] -translate-x-1/2 -translate-y-1/2 text-left transition-opacity duration-200 lg:mt-0 lg:ml-8 lg:w-[240px] lg:translate-x-0"
            style={{
              left: `${spot.x * 100}%`,
              top: `${spot.y * 100}%`,
              opacity: isOverlaySuppressed ? 0 : 1,
              pointerEvents: isOverlaySuppressed ? "none" : "auto",
            }}
          >
            <span
              className="pointer-events-none absolute -inset-1"
              style={{ color: c.color }}
              aria-hidden
            >
              <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l-[1.5px] border-t-[1.5px] border-current" />
              <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r-[1.5px] border-t-[1.5px] border-current" />
              <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-[1.5px] border-l-[1.5px] border-current" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-[1.5px] border-r-[1.5px] border-current" />
            </span>
            <span className="block overflow-hidden rounded-[2px] border border-hairline bg-white/95 shadow-[0_12px_28px_rgba(26,42,53,0.12)]">
              <span
                className="flex min-h-11 items-center justify-between px-2 py-2 lg:min-h-0 lg:px-3.5"
                style={{ backgroundColor: c.color }}
              >
                <span className="font-signal text-[12px] font-bold tracking-[0.08em] text-white lg:text-[15px] lg:tracking-[0.14em]">
                  {spot.label.toUpperCase()}
                </span>
                <span className="hidden h-1.5 w-1.5 animate-pulse rounded-full bg-white/80 lg:block" />
              </span>
              <span className="hidden whitespace-nowrap px-3.5 pb-3 pt-2 text-[12px] leading-[1.25] text-steel lg:block">
                {callout.copy}
              </span>
            </span>
          </button>
        );
      })}
    </>
  );
}
