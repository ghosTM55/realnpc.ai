import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { NPC_WORLD } from "../src/data/npcWorld.ts";
import { GLOBE_DEMO_CITY_IDS, hasGlobeConversation } from "../src/domain/world/globe.ts";
const { chromium } = await import(process.env.REALNPC_PLAYWRIGHT_MODULE ?? "playwright");
const base = process.env.REALNPC_BASE_URL ?? "http://127.0.0.1:4173";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const root = process.env.REALNPC_WORLD_ARTIFACTS ?? "/tmp/realnpc-globe-popover";
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ channel: process.env.REALNPC_BROWSER_CHANNEL || undefined, headless: true });
const errors = [];
// Read the existing ref in the local React tree to aim the camera, then exercise real pointer events.
async function bindGlobe(page) {
  await page.locator(".npc-globe-canvas canvas").waitFor();
  await page.waitForFunction(() => {
    for (const el of document.querySelectorAll(".npc-globe-canvas *")) {
      const key = Object.keys(el).find(k => k.startsWith("__reactFiber$"));
      for (let fiber = el[key]; fiber; fiber = fiber.return) {
        if (Array.isArray(fiber.memoizedProps?.pointsData) && typeof fiber.memoizedProps.pointColor === "function") {
          window.__testGlobeProps = fiber.memoizedProps;
        }
        for (let hook = fiber.memoizedState; hook; hook = hook.next) {
          const globe = hook.memoizedState?.current;
          if (typeof globe?.getScreenCoords === "function") window.__testGlobe = globe;
        }
      }
    }
    return Boolean(window.__testGlobe && window.__testGlobeProps);
  });
}
async function pointAt(page, city, { back = false } = {}) {
  await page.locator(".npc-globe-canvas canvas").scrollIntoViewIfNeeded();
  // Finish the preceding close animation before the test positions the camera.
  await page.waitForTimeout(350);
  await page.evaluate(({ city, back }) => {
    const g = window.__testGlobe;
    g.controls().autoRotate = false;
    g.pointOfView({ lat: back ? -city.lat : city.lat, lng: city.lng + (back ? 180 : 0), altitude: 1.65 }, 0);
  }, { city, back });
  await page.waitForTimeout(180);
  const point = await page.evaluate(city => window.__testGlobe.getScreenCoords(city.lat, city.lng, .007), city);
  const box = await page.locator(".npc-globe-canvas canvas").boundingBox();
  return { x: box.x + point.x, y: box.y + point.y };
}
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(`${base}/npc-world/`, { waitUntil: "networkidle" });
  await bindGlobe(page);
  const colors = await page.evaluate(() => {
    const g = window.__testGlobeProps;
    return g.pointsData.map(city => ({ id: city.id, color: g.pointColor(city), label: g.pointLabel(city), name: city.city }));
  });
  for (const point of colors) {
    assert.equal(point.color.toLowerCase(), hasGlobeConversation(point.id) ? "#d40d3d" : "#555e69");
    assert.equal(point.label, point.name);
  }
  const dialog = page.getByRole("dialog");
  for (const cityName of ["Stockholm", "Warsaw", "Istanbul", "Tel Aviv", "Doha", "Tokyo"]) {
    const city = NPC_WORLD.find(c => c.city === cityName);
    const point = await pointAt(page, city);
    await page.mouse.move(point.x, point.y);
    await page.getByText(cityName, { exact: true }).filter({ visible: true }).first().waitFor();
    const y = await page.evaluate(() => scrollY);
    await page.mouse.click(point.x, point.y);
    await dialog.waitFor();
    assert.equal(await dialog.getByRole("heading", { level: 2 }).textContent(), cityName);
    assert.ok(await dialog.locator("ol li").count() >= 4);
    assert.equal(await page.evaluate(() => scrollY), y, "Click stays at the globe");
    await page.waitForFunction(() => Math.abs(window.__testGlobe.pointOfView().altitude - 1.1) < .02);
    assert.equal(await page.evaluate(() => window.__testGlobe.controls().autoRotate), false);
    if (cityName === "Tokyo") {
      await page.screenshot({ path: `${root}/globe-thread-1440.png` });
      await dialog.getByLabel("Discussion in Tokyo").selectOption("1");
      assert.match(await dialog.locator("h3").textContent(), /playlist/);
    }
    await page.locator(".npc-hero-title").click();
    assert.equal(await dialog.count(), 0);
    await page.waitForFunction(() => Math.abs(window.__testGlobe.pointOfView().altitude - 1.65) < .02);
    assert.equal(await page.evaluate(() => window.__testGlobe.controls().autoRotate), true);
    console.log(`PASS ${cityName}: red node, city-only label, local thread, zoom, outside close, rotation resumes`);
  }
  const gray = NPC_WORLD.find(c => c.id === "beijing");
  let point = await pointAt(page, gray);
  await page.mouse.click(point.x, point.y);
  assert.equal(await dialog.count(), 0, "Gray nodes have no fabricated preview");
  point = await pointAt(page, NPC_WORLD.find(c => c.id === "stockholm"), { back: true });
  await page.mouse.click(point.x, point.y);
  assert.equal(await dialog.count(), 0, "The globe hides far-side nodes");
  const picker = page.getByLabel("Explore city conversations");
  for (const id of GLOBE_DEMO_CITY_IDS) {
    await picker.selectOption(id);
    await dialog.waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await dialog.count(), 0);
    assert.ok(await picker.evaluate(el => el === document.activeElement));
  }
  await picker.selectOption("tokyo");
  await page.keyboard.press("Tab");
  assert.ok(await page.getByRole("button", { name: "Close conversation" }).evaluate(el => el === document.activeElement));
  await page.keyboard.press("Enter");
  assert.equal(await dialog.count(), 0);
  await picker.selectOption("tokyo");
  await page.keyboard.press("Tab"); await page.keyboard.press("Space");
  assert.equal(await dialog.count(), 0);
  await picker.selectOption("tokyo");
  await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
  assert.ok(await page.getByRole("button", { name: "Close conversation" }).evaluate(el => el === document.activeElement));
  await page.keyboard.press("Escape");
  // Close during a pointer-initiated zoom, then check that no old animation reopens or refocuses it.
  point = await pointAt(page, NPC_WORLD.find(c => c.id === "tokyo"));
  await page.mouse.click(point.x, point.y); await dialog.waitFor();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(650);
  assert.equal(await dialog.count(), 0);
  assert.ok(Math.abs(await page.evaluate(() => window.__testGlobe.pointOfView().altitude) - 1.65) < .02);
  await page.close();
  for (const width of [320, 390, 768]) {
    const mobile = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: "reduce" });
    mobile.on("pageerror", e => errors.push(e.message));
    await mobile.goto(`${base}/npc-world/`, { waitUntil: "networkidle" }); await bindGlobe(mobile);
    await mobile.getByLabel("Explore city conversations").selectOption("tokyo");
    const popup = mobile.getByRole("dialog"); await popup.waitFor();
    const box = await popup.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= width + 1);
    const readingArea = await popup.getByRole("region", { name: "Conversation replies" }).boundingBox();
    assert.ok(readingArea.height >= 280, "The mobile preview leaves room to read actual replies");
    assert.ok(await mobile.getByRole("button", { name: "Close conversation" }).isVisible());
    assert.equal(await mobile.evaluate(() => window.__testGlobe.controls().autoRotate), false);
    await mobile.screenshot({ path: `${root}/globe-thread-${width}.png` });
    await mobile.keyboard.press("Escape");
    assert.equal(await popup.count(), 0);
    assert.equal(await mobile.evaluate(() => window.__testGlobe.controls().autoRotate), false);
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mobile.close();
    console.log(`PASS ${width}px: readable bounded dialog, keyboard, reduced motion`);
  }
  assert.deepEqual(errors, []);
  console.log("PASS all 11 cities, gray and hidden nodes, interruption, keyboard focus; no page errors");
} finally { await browser.close(); }
