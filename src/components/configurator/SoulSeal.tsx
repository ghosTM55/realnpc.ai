import type { SoulId } from "@/domain/companion/model";

export function SoulSeal({
  soulId,
  large = false,
}: {
  soulId: SoulId;
  large?: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className={`${large ? "h-20 w-20" : "h-11 w-11"} shrink-0 text-soul-ink`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      {soulId === "anchor" ? (
        <>
          <circle cx="24" cy="24" r="18" />
          <path d="M10 24h28M24 10v28" />
          <circle cx="24" cy="24" r="5" fill="currentColor" />
        </>
      ) : soulId === "instigator" ? (
        <>
          <path d="m25 4 18 34H7L25 4ZM18 14l12 23M34 14 13 34" />
          <circle cx="25" cy="25" r="3" fill="currentColor" />
        </>
      ) : (
        <>
          <ellipse
            cx="24"
            cy="24"
            rx="20"
            ry="10"
            transform="rotate(-40 24 24)"
          />
          <ellipse
            cx="24"
            cy="24"
            rx="20"
            ry="10"
            transform="rotate(40 24 24)"
          />
          <circle cx="24" cy="24" r="3" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
