import type { AssemblyHotspot } from "@/types/domain";
import styles from "./FocusedPopover.module.css";

type FocusedPopoverProps = {
  active: AssemblyHotspot | null;
  dot: { x: number; y: number } | null;
  focusing: boolean;
};

export default function FocusedPopover({
  active,
  dot,
  focusing,
}: FocusedPopoverProps) {
  if (!active || !dot || focusing) return null;

  return (
    <div
      data-popover
      data-tone={active.concept}
      className={`${styles.popover} pointer-events-auto absolute z-30 w-[calc(100%-48px)] max-w-[362px] rounded-[8px] border border-tone/40 bg-paper/45 p-6 shadow-[0_14px_36px_rgba(26,42,53,0.16)]`}
      style={{
        left: `clamp(24px, calc(${dot.x * 100}% + 112px), calc(100% - 386px))`,
        top: `clamp(24px, calc(${dot.y * 100}% - 118px), calc(100% - 300px))`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-[7px] w-[7px] rounded-full bg-tone"
        />
        <span
          className="font-signal text-[12px] tracking-wide text-tone"
        >
          {active.label.toUpperCase()}
        </span>
      </div>
      <h3 className="mt-3 font-display text-[23px] font-semibold leading-[1.1] text-ink">
        {active.title}
      </h3>
      <p className="mt-2.5 text-[14px] leading-[1.45] text-steel">
        {active.description}
      </p>
      <div className="mt-4 border-t border-hairline pt-3.5">
        <div className="flex flex-wrap gap-2">
          {active.includes.map((chip) => (
            <span
              key={chip}
              className="rounded-[3px] border border-hairline bg-tone-tint px-2.5 py-1 font-signal text-[11px] text-steel"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
