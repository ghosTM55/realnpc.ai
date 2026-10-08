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
  const onMainThread = () => {
    const context = canvas.getContext("2d");
    return context && createFlowField(context, line, {
      request: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
    });
  };
  if (typeof canvas.transferControlToOffscreen !== "function" || typeof Worker !== "function") return onMainThread();

  let worker: Worker | null = null;
  let field: FlowDriver | null = null;
  let transferred = false;
  let fallback = false;
  let disposed = false;
  let size: FlowSize | null = null;
  let state: FlowState = { running: false, animate: false };
  let startupTimer: ReturnType<typeof setTimeout> | undefined;
  const stopWorker = () => {
    clearTimeout(startupTimer);
    if (worker) {
      worker.onerror = null;
      worker.onmessage = null;
      worker.terminate();
      worker = null;
    }
  };
  const fallBackToMainThread = () => {
    if (disposed || fallback) return;
    fallback = true;
    stopWorker();
    if (transferred) {
      // A transferred canvas can never regain a main-thread context.
      const replacement = canvas.cloneNode(false) as HTMLCanvasElement;
      canvas.replaceWith(replacement);
      canvas = replacement;
    }
    field = onMainThread();
    if (size) field?.resize(size);
    field?.update(state);
  };
  const post = (message: FlowMessage, transfer: Transferable[] = []) => {
    try {
      worker?.postMessage(message, transfer);
    } catch {
      fallBackToMainThread();
    }
  };
  try {
    worker = new Worker(new URL("./flowWorker.ts", import.meta.url), { type: "module" });
    worker.onerror = (event) => {
      event.preventDefault();
      fallBackToMainThread();
    };
    worker.onmessage = (event: MessageEvent<{ type: "ready" }>) => {
      if (event.data?.type === "ready") clearTimeout(startupTimer);
    };
    // A stalled worker load must not leave the background blank indefinitely.
    startupTimer = setTimeout(fallBackToMainThread, 10_000);
    const offscreen = canvas.transferControlToOffscreen();
    transferred = true;
    post({ type: "init", canvas: offscreen, line }, [offscreen]);
  } catch {
    fallBackToMainThread();
  }
  return {
    resize(next) {
      size = next;
      if (fallback) field?.resize(next);
      else post({ type: "size", size: next });
    },
    update(next) {
      state = next;
      if (fallback) field?.update(next);
      else post({ type: "state", state: next });
    },
    dispose() {
      disposed = true;
      stopWorker();
      field?.dispose();
    },
  };
}

/**
 * `occludable` marks the fixed site-wide field: it is always "visible" to
 * IntersectionObserver, so it pauses itself while a page's cover hides it.
 */
export function initFlowBackground(canvas: HTMLCanvasElement, { occludable = false } = {}) {
  // Observe the stable host: a worker failure may replace its transferred canvas.
  const surface = canvas.parentElement ?? canvas;
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
    const rect = surface.getBoundingClientRect();
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
  sizeObserver.observe(surface);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio > 0;
    sync();
  }, { threshold: [0, 0.001] });
  visibilityObserver.observe(surface);
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
