import test from "node:test";
import assert from "node:assert/strict";
import { initFlowBackground } from "../src/lib/flowBackground.ts";

function browser(t, reducedMotion = false) {
  const frames = new Map();
  const observers = [];
  let nextFrame = 0;
  let paints = 0;
  const rect = { width: 390, height: 844, top: 0 };
  const context = new Proxy({}, { get: (_, key) => key === "clearRect" ? () => paints++ : () => {} });
  const canvas = { width: 0, height: 0, getContext: () => context, getBoundingClientRect: () => rect };
  const events = new EventTarget();
  const doc = Object.assign(new EventTarget(), { hidden: false, documentElement: {} });
  const motion = Object.assign(new EventTarget(), { matches: reducedMotion });
  const replacements = {
    window: Object.assign(events, { innerHeight: 844 }), document: doc,
    matchMedia: () => motion, devicePixelRatio: 1,
    getComputedStyle: () => ({ getPropertyValue: () => "#8792a0" }),
    requestAnimationFrame: (cb) => { frames.set(++nextFrame, cb); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
    ResizeObserver: class { observe() {} disconnect() {} },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(target) { this.target = target; }
      disconnect() {}
    },
  };
  for (const [key, value] of Object.entries(replacements)) {
    const old = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => old ? Object.defineProperty(globalThis, key, old) : delete globalThis[key]);
  }
  return {
    canvas, doc, motion, rect,
    scroll: () => events.dispatchEvent(new Event("scroll")),
    paints: () => paints,
    intersect(target, ratio, top = 0) {
      for (const observer of observers.filter(x => x.target === target)) {
        observer.callback([{ isIntersecting: ratio >= 0, intersectionRatio: Math.max(0, ratio), boundingClientRect: { top }, rootBounds: { bottom: 844 } }]);
      }
    },
    tick(count = 20) {
      for (let index = 0; index < count; index++) {
        const work = [...frames.values()]; frames.clear();
        work.forEach(callback => callback(performance.now() + index * 40));
      }
    },
  };
}

test("offscreen and zero-area canvases do no initialization or drawing", t => {
  const page = browser(t);
  const flow = initFlowBackground(page.canvas);
  page.tick();
  assert.equal(page.paints(), 0);
  page.intersect(page.canvas, 0);
  page.tick();
  assert.equal(page.paints(), 0);
  page.intersect(page.canvas, 1);
  page.tick();
  assert.ok(page.paints() > 0);
  flow.dispose();
});

test("the global field handles jumps past the intro and back without marker intersections", t => {
  const page = browser(t);
  let top = 2000;
  const marker = { getBoundingClientRect: () => ({ top }) };
  const flow = initFlowBackground(page.canvas, marker);
  page.intersect(page.canvas, 1);
  page.tick();
  assert.equal(page.paints(), 0);
  top = -1000;
  page.scroll();
  page.tick();
  assert.ok(page.paints() > 0);
  top = 2000;
  page.scroll();
  page.tick(1);
  const stopped = page.paints();
  page.tick();
  assert.equal(page.paints(), stopped);
  flow.dispose();
});

test("reduced motion paints one complete still; pause, background and dispose stop animation", t => {
  const page = browser(t, true);
  const flow = initFlowBackground(page.canvas);
  page.intersect(page.canvas, 1);
  page.tick();
  assert.equal(page.paints(), 1);
  page.tick();
  assert.equal(page.paints(), 1);
  page.motion.matches = false;
  page.motion.dispatchEvent(new Event("change"));
  page.tick();
  assert.ok(page.paints() > 1);
  flow.setPaused(true);
  let stopped = page.paints();
  page.tick();
  assert.equal(page.paints(), stopped);
  flow.setPaused(false);
  page.doc.hidden = true;
  page.doc.dispatchEvent(new Event("visibilitychange"));
  page.tick();
  assert.equal(page.paints(), stopped);
  page.doc.hidden = false;
  page.doc.dispatchEvent(new Event("visibilitychange"));
  page.tick();
  assert.ok(page.paints() > stopped);
  flow.dispose();
  stopped = page.paints();
  page.tick();
  assert.equal(page.paints(), stopped);
});
