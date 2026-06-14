import type { AssemblyHotspot } from "@/types/domain";

/**
 * Centers the focused hotspot while clamping the transform origin so the
 * zoomed image never exposes empty edges.
 */
export function focusDot(spot: AssemblyHotspot) {
  const s = spot.focusScale;
  const half = 1 / (2 * s);
  const cx = Math.min(Math.max(spot.x, half), 1 - half);
  const cy = Math.min(Math.max(spot.y, half), 1 - half);

  return {
    cx,
    cy,
    x: 0.5 + (spot.x - cx) * s,
    y: 0.5 + (spot.y - cy) * s,
  };
}
