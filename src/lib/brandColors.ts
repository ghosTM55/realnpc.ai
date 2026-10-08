/**
 * GSAP tweens and WebGL materials need concrete colors, not `var(--token)`.
 * These helpers read the VI tokens from globals.css at runtime so there is
 * still one source of truth. Browser-only: call from effects or client modules.
 */
export function readTokens<const K extends string>(names: readonly K[]): Record<K, string> {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    names.map((name) => [name, styles.getPropertyValue(`--${name}`).trim()]),
  ) as Record<K, string>;
}

/** `#43a9c9` + 0.55 → `rgba(67,169,201,0.55)`. */
export function withAlpha(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
}
