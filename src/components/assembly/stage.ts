import type { AssemblyHotspot } from "@/types/ui";
import { focusDot } from "./focusDot";

/**
 * The assembly stage is either at rest, zooming back to rest, or holding one
 * hotspot. `zoomed` is false when reduced motion skips the zoom, in which case
 * the popover anchors to the hotspot's own coordinates.
 */
export type Stage =
  | { phase: "idle" }
  | { phase: "restoring" }
  | { phase: "focusing" | "focused"; spot: AssemblyHotspot; zoomed: boolean };

export type FocusedStage = Extract<Stage, { spot: AssemblyHotspot }>;

export const IDLE: Stage = { phase: "idle" };

export const stageSpot = (stage: Stage) => ("spot" in stage ? stage.spot : null);

export function stageDot(stage: FocusedStage) {
  return stage.zoomed ? focusDot(stage.spot) : { x: stage.spot.x, y: stage.spot.y };
}
