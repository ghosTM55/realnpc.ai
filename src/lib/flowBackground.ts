import { createFlowField, type FlowMessage, type FlowSize, type FlowState } from "./flowField.ts";

// The fixed site header is opaque, so a cover only has to span the viewport below it.
const HEADER_HEIGHT = 72;

/** True while an opaque `[data-flow-cover]` block hides the whole viewport below the header. */
function viewportCovered(covers: Iterable<Element>) {
  for (const cover of covers) {
    const rect = cover.getBoundingClientRect();
    if (rect.top <= HEADER_HEIGHT && rect.bottom >= window.innerHeight) return true;
  }
  return false;
}

type FlowDriver = { resize(size: FlowSize): void; update(state: FlowState): void; dispose(): void };

/**
 * Draws in a worker when the browser can hand the canvas over (the main thread
 * then only reports size and state); otherwise runs the same field here.
 * A canvas can be handed over once, so each call needs a fresh canvas.
 */
function startField(canvas: HTMLCanvasElement, line: string): FlowDriver | null {
  if (typeof canvas.transferControlToOffscreen === "function" && typeof Worker === "function") {
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker(new URL("./flowWorker.ts", import.meta.url), { type: "module" });
    const post = (message: FlowMessage, transfer: Transferable[] = []) => worker.postMessage(message, transfer);
    post({ type: "init", canvas: offscreen, line }, [offscreen]);
    return {
      resize: (size) => post({ type: "size", size }),
      update: (state) => post({ type: "state", state }),
      dispose: () => worker.terminate(),
    };
  }
  const context = canvas.getContext("2d");
  return context && createFlowField(context, line, {
    request: (callback) => requestAnimationFrame(callback),
    cancel: (id) => cancelAnimationFrame(id),
  });
}

/**
 * `occludable` marks the fixed site-wide field: it is always "visible" to
 * IntersectionObserver, so it pauses itself while a page's cover hides it.
 */
export function initFlowBackground(canvas: HTMLCanvasElement, { occludable = false } = {}) {
  const line = getComputedStyle(document.documentElement).getPropertyValue("--muted-text").trim();
  const field = startField(canvas, line);
  if (!field) return null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let coverFrame = 0;
  let paused = false;
  let visible = false;
  let covers: Element[] = [];
  let covered = false;

  const sync = () => field.update({
    running: !document.hidden && visible && !covered,
    animate: !reduced.matches && !paused,
  });
  const measure = () => {
    const rect = canvas.getBoundingClientRect();
    field.resize({ width: rect.width, height: rect.height, dpr: Math.min(devicePixelRatio || 1, 1.25) });
  };
  const onResize = () => {
    measure();
    covered = viewportCovered(covers);
    sync();
  };
  measure();
  window.addEventListener("resize", onResize, { passive: true });
  const sizeObserver = new ResizeObserver(onResize);
  sizeObserver.observe(canvas);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio > 0;
    sync();
  }, { threshold: [0, 0.001] });
  visibilityObserver.observe(canvas);
  const checkCover = () => {
    const nextCovered = viewportCovered(covers);
    if (covered !== nextCovered) {
      covered = nextCovered;
      sync();
    }
  };
  // A cover that grows or shrinks in place (a story step changing height) moves its edge without a scroll.
  const coverObserver = new ResizeObserver(checkCover);
  const refreshCovers = () => {
    if (!occludable) return;
    coverObserver.disconnect();
    covers = [...document.querySelectorAll("[data-flow-cover]")];
    covers.forEach((cover) => coverObserver.observe(cover));
    checkCover();
  };
  refreshCovers();
  // Re-checked once per frame while scrolling; a jump can cross a whole cover between events.
  const onScroll = () => {
    if (coverFrame) return;
    coverFrame = requestAnimationFrame(() => {
      coverFrame = 0;
      checkCover();
    });
  };
  if (occludable) window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  return {
    setPaused(value: boolean) {
      paused = value;
      sync();
    },
    /** A client-side navigation swapped the page's covers without necessarily scrolling. */
    refreshCovers,
    dispose() {
      field.dispose();
      cancelAnimationFrame(coverFrame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      sizeObserver.disconnect();
      coverObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    },
  };
}
