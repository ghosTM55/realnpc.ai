import { assemblyHotspots } from "@/data/assemblyHotspots";
import type { AssemblyConcept, AssemblyHotspot } from "@/types/domain";
import { CONCEPT } from "./assemblyStageConfig";

type StageHotspotsProps = {
  active: AssemblyHotspot | null;
  hovered: AssemblyConcept | null;
  onFocus: (spot: AssemblyHotspot) => void;
  onHover: (concept: AssemblyConcept | null) => void;
};

export default function StageHotspots({
  active,
  hovered,
  onFocus,
  onHover,
}: StageHotspotsProps) {
  return (
    <>
      {assemblyHotspots.map((spot) => {
        const c = CONCEPT[spot.concept];
        const isActive = active?.id === spot.id;
        const isSuppressed = active !== null && !isActive;

        return (
          <button
            key={spot.id}
            data-hotspot-marker
            type="button"
            aria-label={`Focus the ${spot.label} layer`}
            aria-expanded={isActive}
            onClick={() => onFocus(spot)}
            onMouseEnter={() => onHover(spot.concept)}
            onMouseLeave={() => onHover(null)}
            className="group pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-[opacity,transform] duration-200"
            style={{
              left: `${spot.x * 100}%`,
              top: `${spot.y * 100}%`,
              opacity: isSuppressed ? 0 : 1,
              pointerEvents: isSuppressed ? "none" : "auto",
            }}
          >
            <span
              className="relative flex h-11 w-11 items-center justify-center transition-transform duration-200"
              style={{
                transform:
                  hovered === spot.concept && !active
                    ? "scale(1.18)"
                    : "scale(1)",
              }}
            >
              {!active && (
                <span
                  className="absolute inset-0 animate-hotspot-pulse rounded-full"
                  style={{ backgroundColor: c.color, opacity: 0.18 }}
                />
              )}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] bg-white/90 transition-transform ${
                  isActive ? "" : "group-hover:scale-110"
                }`}
                style={{ borderColor: c.color }}
              >
                <span
                  className="h-2 w-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: isActive ? c.color : "#ffffff",
                    border: `1.5px solid ${c.color}`,
                  }}
                />
              </span>
            </span>
          </button>
        );
      })}
    </>
  );
}
