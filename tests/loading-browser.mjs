import assert from "node:assert/strict";
import { test, after } from "node:test";
const { chromium } = await import(process.env.REALNPC_PLAYWRIGHT_MODULE ?? "playwright");

const base = process.env.REALNPC_BASE_URL ?? "http://127.0.0.1:4173";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const browser = await chromium.launch({ channel: "chrome", headless: true });
after(() => browser.close());

test("navigation waits for intent before prefetching other marketing pages", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const requests = [];
  page.on("request", request => requests.push(new URL(request.url()).pathname));
  try {
    await page.goto(`${base}/partnership/`, { waitUntil: "networkidle" });
    assert.ok(!requests.some(path => path.startsWith("/__next.") || path.startsWith("/npc-world/")), "Idle navigation must not load the home/world routes");
    await Promise.all([
      page.waitForRequest(request => new URL(request.url()).pathname.startsWith("/__next.")),
      page.getByRole("link", { name: "RealNPC home", exact: true }).hover(),
    ]);
    await Promise.all([
      page.waitForRequest(request => new URL(request.url()).pathname.startsWith("/npc-world/")),
      page.getByRole("link", { name: "NPC World", exact: true }).focus(),
    ]);
  } finally { await page.close(); }
});

for (const route of ["/", "/npc-world/"]) {
  test(`${route}: late JavaScript never hides an already visible heading`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      await page.route("**/*.js", async route => {
        await new Promise(resolve => setTimeout(resolve, 2500));
        await route.continue().catch(() => {});
      });
      await page.addInitScript(() => {
        window.headingSamples = [];
        const sample = () => {
          const heading = document.querySelector("h1");
          if (heading) window.headingSamples.push({ time: performance.now(), opacity: Number(getComputedStyle(heading).opacity) });
          if (performance.now() < 5500) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await page.goto(base + route, { waitUntil: "commit" });
      await page.waitForFunction(() => window.headingSamples.at(-1)?.time > 5000);
      const samples = await page.evaluate(() => window.headingSamples);
      assert.ok(samples.some(sample => sample.time < 2000 && sample.opacity > 0.99), "Heading must appear before delayed JavaScript");
      assert.ok(samples.filter(sample => sample.time > 2000).every(sample => sample.opacity > 0.99), "Hydration must not restart the entry animation");
    } finally { await page.close(); }
  });
}

test("globe map starts before JavaScript and its preload is reused", async () => {
  const page = await browser.newPage();
  const maps = [];
  page.on("request", request => { if (request.url().endsWith(".geojson")) maps.push(request.url()); });
  try {
    await page.route("**/*.js", async route => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      await route.continue().catch(() => {});
    });
    await page.goto(`${base}/npc-world/`, { waitUntil: "commit" });
    await page.waitForTimeout(1500);
    assert.equal(maps.length, 1, "Map must start while JavaScript is still delayed");
    await page.locator(".npc-globe-canvas canvas").waitFor();
    const requests = await page.evaluate(() => performance.getEntriesByType("resource").filter(entry => entry.name.endsWith(".geojson")));
    assert.equal(maps.length, 1, "Hydration must reuse the preloaded map");
    assert.equal(requests.length, 1);
  } finally { await page.close(); }
});

test("assembly decorative markers stay still with reduced motion", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await page.locator("#layers").scrollIntoViewIfNeeded();
    const animations = await page.locator("#layers").evaluate(node => node.getAnimations({ subtree: true })
      .filter(animation => animation.playState === "running" && animation.effect.getTiming().iterations === Infinity).length);
    assert.equal(animations, 0, "Reduced motion must also stop decorative pulses");
  } finally { await page.close(); }
});

test("world scene colors survive client navigation and preserve contrast on both surfaces", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  try {
    await page.goto(`${base}/partnership/`, { waitUntil: "networkidle" });
    for (let visit = 0; visit < 2; visit++) {
      await page.getByRole("link", { name: "NPC World", exact: true }).click();
      await page.waitForURL(/\/npc-world\//);
      for (const [index, light, dark] of [
        [0, "rgb(212, 13, 61)", "rgb(244, 107, 136)"],
        [1, "rgb(36, 103, 125)", "rgb(119, 199, 222)"],
        [2, "rgb(128, 87, 16)", "rgb(239, 189, 97)"],
      ]) {
        const choice = page.locator(".npc-scenario-choice").nth(index);
        const tab = page.locator(".npc-scenario-tab").nth(index);
        await choice.click();
        assert.equal(await tab.getAttribute("aria-pressed"), "true");
        assert.equal(await choice.locator(".npc-scenario-name").evaluate(node => getComputedStyle(node).color), light);
        assert.equal(await choice.evaluate(node => getComputedStyle(node).borderBottomColor), light);
        assert.equal(await tab.evaluate(node => getComputedStyle(node).color), dark);
        assert.equal(await tab.evaluate(node => getComputedStyle(node).borderBottomColor), dark);
      }
      await page.getByRole("link", { name: "RealNPC home", exact: true }).click();
      await page.waitForURL(base + "/");
      assert.equal(await page.locator("[data-hotspot-marker]").count(), 3);
    }
  } finally { await page.close(); }
});

test("assembly honors a changed motion preference, including during focus", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#layers").scrollIntoViewIfNeeded();
    const callout = page.locator("[data-assembly-overlay] button").first();
    await callout.click();
    await page.locator("[data-popover]").waitFor({ timeout: 400 });
    assert.equal(await page.locator("[data-popover]").evaluate(node => getComputedStyle(node).opacity), "1");
    await page.getByRole("button", { name: "Close layer detail", exact: true }).click({ position: { x: 10, y: 100 } });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.locator("#layers").scrollIntoViewIfNeeded();
    await callout.click();
    await page.waitForTimeout(150);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("[data-popover]").waitFor({ timeout: 400 });
    const transform = await page.locator("[data-stage-background]").evaluate(node => getComputedStyle(node.parentElement).transform);
    assert.ok(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)", "Reduced motion restores the unzoomed scene");
    assert.equal(await page.locator("[data-popover]").evaluate(node => node.getAnimations().length), 0);
  } finally { await page.close(); }
});
