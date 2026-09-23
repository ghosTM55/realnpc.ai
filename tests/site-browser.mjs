import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { chromium } = await import(process.env.REALNPC_PLAYWRIGHT_MODULE ?? "playwright");

const base = process.env.REALNPC_BASE_URL ?? "http://127.0.0.1:4173";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const artifacts = await mkdtemp(join(tmpdir(), "realnpc-site-qa-"));
const errors = [];

async function pageFor(viewport, reducedMotion = "no-preference") {
  const page = await browser.newPage({ viewport, reducedMotion });
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    window.canvasPaints = new WeakMap();
    const paint = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.canvasPaints.set(this.canvas, (window.canvasPaints.get(this.canvas) ?? 0) + 1);
      return paint.apply(this, args);
    };
  });
  return page;
}

const paints = (page, selector) => page.locator(selector).evaluate(canvas => window.canvasPaints.get(canvas) ?? 0);

try {
  for (const [width, height] of [[320, 844], [390, 844], [768, 844], [1440, 844], [844, 390], [768, 500], [320, 568]]) {
    const page = await pageFor({ width, height }, "reduce");
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    if (width < 1024) {
      for (const selector of ["[data-hero-copy] h1", "[data-hero-copy] h1 + p", "[data-hero-copy] a"]) {
        const box = await page.locator(selector).boundingBox();
        assert.ok(box && box.x >= 0 && box.x + box.width <= width + 1 && box.y >= 72 && box.y + box.height <= height,
          `Hero content must be visible at ${width}×${height}: ${selector} ${JSON.stringify(box)}`);
      }
      const text = await page.locator("[data-hero-copy] h1 + p").evaluate(node => {
        const range = document.createRange(); range.selectNodeContents(node);
        const box = range.getBoundingClientRect(); return { left: box.left, right: box.right };
      });
      assert.ok(text.left >= 0 && text.right <= width + 1, "Hero copy must wrap without clipped text");
    }
    await page.screenshot({ path: join(artifacts, `home-${width}-${height}.png`) });
    await page.close();
    console.log(`PASS ${width}×${height} hero: visible text and CTA`);
  }

  for (const width of [320, 390, 768, 1440]) {
    const page = await pageFor({ width, height: 844 }, "reduce");
    await page.goto(base, { waitUntil: "networkidle" });
    await page.locator("#layers").scrollIntoViewIfNeeded();
    const callouts = page.locator("[data-assembly-overlay] button");
    for (const callout of await callouts.all()) {
      const box = await callout.boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width,
        `Assembly layer control must fit at ${width}px: ${JSON.stringify(box)}`);
    }
    await callouts.first().click();
    const popover = page.locator("[data-popover]");
    await popover.waitFor();
    const box = await popover.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= width, `Layer detail must fit at ${width}px`);
    await page.screenshot({ path: join(artifacts, `assembly-detail-${width}.png`) });
    await page.close();
    console.log(`PASS ${width}px assembly: all layer controls and detail fit`);
  }

  const page = await pageFor({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  assert.equal(await paints(page, ".site-flow-background canvas"), 0, "Covered global background must not initialize");
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.waitForFunction(() => window.canvasPaints.get(document.querySelector(".site-flow-background canvas")) > 1);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(100);
  const covered = await paints(page, ".site-flow-background canvas");
  await page.waitForTimeout(200);
  assert.equal(await paints(page, ".site-flow-background canvas"), covered, "Jumping to the top must stop the covered background");
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await page.waitForFunction(count => window.canvasPaints.get(document.querySelector(".site-flow-background canvas")) > count, covered);
  await page.getByRole("button", { name: "Pause background animation", exact: true }).click();
  const paused = await paints(page, ".site-flow-background canvas");
  await page.waitForTimeout(200);
  assert.equal(await paints(page, ".site-flow-background canvas"), paused);
  await page.goto(`${base}/partnership/`, { waitUntil: "networkidle" });
  assert.equal(await paints(page, ".flow-surface-background canvas"), 0, "Offscreen flow surface must not initialize");
  await page.locator(".flow-surface").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.canvasPaints.get(document.querySelector(".flow-surface-background canvas")) > 0);
  console.log("PASS flow field: covered/offscreen idle, scroll-in starts, user pause stops");
  await page.close();

  const world = await pageFor({ width: 1440, height: 900 });
  await world.route("**/countries-110m*.geojson", route => route.abort());
  await world.goto(`${base}/npc-world/`);
  await world.getByText("The 3D view is unavailable.", { exact: true }).waitFor();
  await world.locator('.npc-scenario-choice[data-scenario="business"]').click();
  assert.equal(await world.locator('.npc-scenario-choice[data-scenario="business"]').getAttribute("aria-pressed"), "true");
  await world.unroute("**/countries-110m*.geojson");
  await world.getByRole("button", { name: "Try the globe again" }).click();
  await world.locator(".npc-globe-canvas canvas").waitFor();
  await world.waitForTimeout(700);
  assert.equal(await world.getByText("The 3D view is unavailable.", { exact: true }).count(), 0);
  await world.locator('.npc-scenario-choice[data-scenario="community"]').click();
  assert.equal(await world.locator('.npc-scenario-choice[data-scenario="community"]').getAttribute("aria-pressed"), "true");
  await world.screenshot({ path: join(artifacts, "world-desktop.png") });
  await world.close();
  console.log("PASS globe: stories work on map failure, retry loads WebGL, scene selection survives");
  assert.deepEqual(errors, []);
  console.log(`Site QA artifacts: ${artifacts}`);
} finally {
  await browser.close();
}
