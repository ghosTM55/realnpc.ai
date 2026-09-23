export type SemanticTone = "vessel" | "soul" | "powers";
export type AssemblyConcept = SemanticTone;

export interface AssemblyHotspot {
  id: string;
  concept: AssemblyConcept;
  label: string;
  summary: string;
  /** Normalized 0-1 coordinates over the stage image. */
  x: number;
  y: number;
  focusScale: number;
  title: string;
  description: string;
  includes: string[];
}
