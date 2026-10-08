import assert from "node:assert/strict";
import { after, test } from "node:test";

const { chromium } = await import(process.env.REALNPC_PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.REALNPC_BASE_URL ?? "http://127.0.0.1:4173";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const browser = await chromium.launch({ channel: process.env.REALNPC_BROWSER_CHANNEL || undefined, headless: true });
after(() => browser.close());

for (const failure of ["constructor", "load", "context", "timeout"]) {
  test(`flow keeps drawing and responding to pause after worker ${failure} failure`, async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.route("**/__flow-failure.js", route => failure === "load"
        ? route.abort()
        : route.fulfill({ contentType: "application/javascript", body: failure === "context"
          ? 'self.onmessage = () => { throw new Error("2D context unavailable"); };'
          : 'self.onmessage = () => {};',
        }));
      await page.addInitScript(failure => {
        const NativeWorker = window.Worker;
        window.Worker = class extends NativeWorker {
          constructor() {
            if (failure === "constructor") throw new DOMException("Worker unavailable", "SecurityError");
            super(new URL("/__flow-failure.js", location.href), { type: "module" });
          }
        };
      }, failure);
      await page.goto(`${base}/partnership/`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { level: 1 }).waitFor();
      await page.waitForFunction(() => {
        const canvas = document.querySelector(".site-flow-background canvas");
        try {
          const context = canvas?.getContext("2d");
          return context && context.getImageData(0, 0, canvas.width, canvas.height).data.some((value, i) => i % 4 === 3 && value > 0);
        } catch { return false; }
      }, null, { timeout: 15_000 });
      const field = page.locator(".site-flow-background");
      const before = await field.screenshot();
      await page.waitForTimeout(200);
      assert.ok(!before.equals(await field.screenshot()), "Fallback must animate");
      await page.getByRole("button", { name: "Pause background animation", exact: true }).click();
      const paused = await field.screenshot();
      await page.waitForTimeout(200);
      assert.ok(paused.equals(await field.screenshot()), "Pause still controls the fallback");
      await page.getByRole("button", { name: "Resume background animation", exact: true }).click();
      await page.waitForTimeout(200);
      assert.ok(!paused.equals(await field.screenshot()), "Resume restarts the fallback");
      assert.deepEqual(errors, [], "Worker failures must not crash the page");
    } finally {
      await page.close();
    }
  });
}
