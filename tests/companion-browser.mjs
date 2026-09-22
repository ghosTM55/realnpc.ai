import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { chromium } = await import(
  process.env.REALNPC_PLAYWRIGHT_MODULE ?? "playwright"
);
const base = process.env.REALNPC_BASE_URL ?? "http://127.0.0.1:3000";
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname),
  "Run this smoke test against a local preview only.",
);
const artifacts = await mkdtemp(join(tmpdir(), "realnpc-companion-qa-"));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const externalRequests = [];

function inspect(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    if (
      /^https?:/.test(request.url()) &&
      new URL(request.url()).origin !== new URL(base).origin
    )
      externalRequests.push(request.url());
    assert.notEqual(request.method(), "POST", "The demo must not submit data.");
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
}

async function heading(page, name) {
  await page.getByRole("heading", { level: 1, name }).waitFor();
}

async function choose(page, name) {
  await page
    .locator("label")
    .filter({ has: page.getByRole("radio", { name, exact: true }) })
    .click();
}

async function checkLayout(page, label) {
  const metrics = await page.evaluate(() => {
    const footer = document
      .querySelector("[data-flow-footer]")
      .getBoundingClientRect();
    const mainAction = document
      .querySelector("[data-flow-footer] > div > :last-child")
      .getBoundingClientRect();
    return {
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      footerTop: footer.top,
      action: {
        x: mainAction.x,
        y: mainAction.y,
        width: mainAction.width,
        height: mainAction.height,
      },
    };
  });
  assert.ok(
    metrics.scrollWidth <= metrics.width + 1,
    `${label}: horizontal overflow`,
  );
  assert.ok(
    metrics.action.y >= 0 &&
      metrics.action.y + metrics.action.height <= metrics.height + 1,
    `${label}: primary action outside viewport`,
  );
  assert.ok(
    metrics.action.x >= 0 &&
      metrics.action.x + metrics.action.width <= metrics.width + 1,
    `${label}: primary action overflows horizontally`,
  );
  assert.ok(metrics.action.height >= 44, `${label}: primary action too small`);
  return metrics;
}

try {
  for (const width of [1440, 390, 320, 768]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 1440 ? 900 : 844 },
      reducedMotion: width < 1000 ? "reduce" : "no-preference",
      isMobile: width < 1000,
      hasTouch: width < 1000,
    });
    const page = await context.newPage();
    inspect(page);
    await page.goto(
      `${base}/${width === 1440 ? "companion-lab" : "configurator"}`,
    );
    await page.waitForLoadState("networkidle");
    await heading(page, "Choose your Soul.");
    assert.equal(
      new URL(page.url()).pathname.replace(/\/$/, ""),
      "/configurator",
      "Both entrances must reach one flow",
    );
    const steps = page.getByRole("navigation", { name: "Experience steps" });
    assert.equal(await steps.getByRole("button").count(), 6);
    assert.equal(
      await page.locator('input:not([type="radio"]), textarea').count(),
      0,
    );
    assert.equal(
      await page
        .getByRole("link", {
          name: /Open Companion Lab|Open build options|See build options/,
        })
        .count(),
      0,
    );
    const firstLayout = await checkLayout(page, `${width} choose Soul`);
    const firstReplyTop = await page
      .locator("label")
      .filter({ has: page.getByRole("radio", { name: "Morrow", exact: true }) })
      .locator(":scope > span > span")
      .last()
      .evaluate((node) => node.getBoundingClientRect().top);
    assert.ok(
      firstReplyTop < firstLayout.footerTop - 40,
      "First reply must be visible above the footer",
    );
    await page.screenshot({
      path: join(artifacts, `${width}-choose.png`),
      animations: "disabled",
    });
    await page.getByRole("heading", { name: "Vex", exact: true }).click();
    assert.ok(
      await page.getByRole("radio", { name: "Vex", exact: true }).isChecked(),
      "Card body selects Soul",
    );
    if (width === 1440) {
      await page.getByRole("radio", { name: "Vex", exact: true }).focus();
      await page.keyboard.press("ArrowRight");
      assert.ok(
        await page
          .getByRole("radio", { name: "Kite", exact: true })
          .isChecked(),
      );
      await page
        .locator("label")
        .filter({ has: page.getByRole("radio", { name: "Vex", exact: true }) })
        .click({ position: { x: 10, y: 10 } });
    }
    await page
      .getByRole("button", { name: "Continue with Vex", exact: true })
      .click();
    await heading(page, "Life with Vex.");
    await choose(page, "A change of mind");
    assert.equal(
      await page.getByRole("radio", { name: /Morrow|Vex|Kite/ }).count(),
      0,
    );
    await choose(page, "An hour together");
    assert.ok(
      await page
        .getByRole("button", { name: "Set preferences", exact: true })
        .isEnabled(),
    );
    await page
      .getByRole("button", { name: "Set preferences", exact: true })
      .click();
    await heading(page, "On your terms.");
    await choose(page, "Direct");
    await page
      .getByRole("switch", { name: "Remember my preferences", exact: true })
      .click();
    await page
      .getByRole("switch", { name: "Let them take the lead", exact: true })
      .click();
    await checkLayout(page, `${width} preferences`);
    await page.screenshot({
      path: join(artifacts, `${width}-preferences.png`),
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Choose presence", exact: true })
      .click();
    await heading(page, "Bring Vex into your world.");
    assert.equal(new URL(page.url()).pathname.replace(/\/$/, ""), "/configurator");
    assert.equal(
      await steps
        .getByRole("button", { name: "Presence", exact: true })
        .getAttribute("aria-current"),
      "step",
    );
    await page
      .getByRole("button", { name: "Previous step", exact: true })
      .click();
    await heading(page, "On your terms.");
    assert.equal(
      await page
        .getByRole("switch", { name: "Remember my preferences", exact: true })
        .getAttribute("aria-checked"),
      "false",
    );
    await page
      .getByRole("button", { name: "Choose presence", exact: true })
      .click();
    await choose(page, /A physical companion/);
    await checkLayout(page, `${width} presence`);
    await page.screenshot({
      path: join(artifacts, `${width}-presence.png`),
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Set priorities", exact: true })
      .click();
    await heading(page, "What matters most?");
    await choose(page, /A licensed fictional character/);
    await page
      .locator("summary")
      .filter({ hasText: "Budget and ongoing care" })
      .click();
    await choose(page, "Under $10K");
    await page
      .getByRole("button", { name: "View your plan", exact: true })
      .click();
    await heading(page, "Your companion plan.");
    await page.waitForFunction(
      () => document.activeElement?.id === "flow-heading",
    );
    await page
      .getByRole("region", { name: "Companion profile" })
      .getByRole("heading", { name: "Vex", exact: true })
      .waitFor();
    await page
      .getByText("No preferences or moments retained.", { exact: true })
      .waitFor();
    await page
      .getByRole("heading", {
        name: "A physical companion, carefully scoped",
        exact: true,
      })
      .waitFor();
    await page
      .getByText(/Character rights and adult-use permissions must be verified/)
      .waitFor();
    await page
      .getByText(/Budget and physical scope need to be reconciled/)
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", {
          name: /One more moment|Revisit your plan|Prepare review draft/,
        })
        .count(),
      0,
    );
    assert.equal(
      await page
        .getByRole("link", { name: /See build options|View companion/ })
        .count(),
      0,
    );
    await checkLayout(page, `${width} complete plan`);
    await page.screenshot({
      path: join(artifacts, `${width}-plan.png`),
      fullPage: true,
      animations: "disabled",
    });
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Save your plan", exact: true })
      .click();
    const planPath = join(artifacts, `${width}-plan.json`);
    await (await download).saveAs(planPath);
    const plan = JSON.parse(await readFile(planPath, "utf8"));
    assert.equal(plan.companion.name, "Vex");
    assert.equal(plan.config.form, "robot");
    assert.equal(plan.config.rhythm, "direct");
    assert.equal(plan.companion.memory.mode, "session-only");
    assert.equal(plan.submitted, false);
    assert.equal(plan.preferences.characterSource, "licensed");
    assert.equal(plan.preferences.budget, "under-10k");
    assert.deepEqual(plan.companion.powers, ["Shared rhythm"]);
    if (width === 1440) {
      const readable = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Save profile", exact: true })
        .click();
      await (await readable).saveAs(join(artifacts, "profile.txt"));
      const text = await readFile(join(artifacts, "profile.txt"), "utf8");
      assert.match(text, /REALNPC \/ Vex/);
      assert.match(text, /No lasting memory/);
      assert.doesNotMatch(text, /Memory thread|First move/);
      await steps
        .getByRole("button", { name: "Presence", exact: true })
        .click();
      await choose(page, /A digital companion/);
      await steps
        .getByRole("button", { name: "Your plan", exact: true })
        .click();
      const updated = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Save your plan", exact: true })
        .click();
      await (await updated).saveAs(join(artifacts, "updated-plan.json"));
      assert.equal(
        JSON.parse(await readFile(join(artifacts, "updated-plan.json"), "utf8"))
          .config.form,
        "digital-human",
      );
      await page
        .getByRole("button", { name: "Change Soul", exact: true })
        .click();
      await heading(page, "Choose your Soul.");
      assert.ok(
        await page.getByRole("radio", { name: "Vex", exact: true }).isChecked(),
      );
      await choose(page, "Kite");
      await steps
        .getByRole("button", { name: "Your plan", exact: true })
        .click();
      await page.reload();
      await page.waitForLoadState("networkidle");
      await heading(page, "Your companion plan.");
      await page
        .getByRole("region", { name: "Companion profile" })
        .getByRole("heading", { name: "Kite", exact: true })
        .waitFor();
      const stored = await page.evaluate(() =>
        sessionStorage.getItem("realnpc:companion-demo:v1"),
      );
      assert.equal(stored.includes('"reply"'), false);
      assert.equal(stored.includes('"prompt"'), false);
      await page
        .getByRole("button", { name: "Reset demo", exact: true })
        .click();
      await heading(page, "Choose your Soul.");
      assert.equal(
        await page.evaluate(() =>
          sessionStorage.getItem("realnpc:companion-demo:v1"),
        ),
        null,
      );
      await page
        .getByRole("button", { name: "Undo reset", exact: true })
        .click();
      await heading(page, "Your companion plan.");
      await page.waitForFunction(
        () => document.activeElement?.id === "flow-heading",
      );
      await page.setViewportSize({ width: 640, height: 450 });
      await checkLayout(page, "compact desktop plan");
    }
    await context.close();
    console.log(
      `PASS ${width}px: six consecutive steps, fixed Soul, inline back/edit, complete export, no split-flow actions`,
    );
  }

  const directContext = await browser.newContext();
  const direct = await directContext.newPage();
  inspect(direct);
  await direct.goto(`${base}/configurator?form=robot`);
  await direct.waitForLoadState("networkidle");
  await heading(direct, "Choose your Soul.");
  await direct.getByRole("button", { name: "Presence", exact: true }).click();
  assert.ok(
    await direct
      .getByRole("radio", { name: /A physical companion/ })
      .isChecked(),
  );
  await choose(direct, /A digital companion/);
  await direct.reload();
  await heading(direct, "Bring Morrow into your world.");
  assert.ok(
    await direct
      .getByRole("radio", { name: /A digital companion/ })
      .isChecked(),
  );
  assert.equal(new URL(direct.url()).searchParams.has("form"), false);
  await direct.goto(`${base}/companion-lab?view=profile`);
  await heading(direct, "Your companion plan.");
  await direct.goto(`${base}/companion-lab?view=choose`);
  await heading(direct, "Choose your Soul.");
  await direct.getByRole("button", { name: "Your terms", exact: true }).click();
  await direct.reload();
  await heading(direct, "On your terms.");
  await directContext.close();
  console.log(
    "PASS legacy URLs and campaign form: canonical route, one-time destinations, refresh preserves current step",
  );

  const legacyContext = await browser.newContext();
  await legacyContext.addInitScript(() => {
    if (!sessionStorage.getItem("realnpc:companion-demo:v1"))
      sessionStorage.setItem(
        "realnpc:companion-demo:v1",
        JSON.stringify({
          version: 1,
          labStep: 3,
          reviewStep: 1,
          config: {
            soulId: "instigator",
            rhythm: "playful",
            form: "robot",
            takesInitiative: false,
            rememberPreferences: false,
            rememberMoments: false,
            worldVisible: false,
          },
          review: {
            priority: "presence",
            characterSource: "licensed",
            budget: "under-10k",
            service: "discuss",
          },
        }),
      );
  });
  const legacy = await legacyContext.newPage();
  inspect(legacy);
  await legacy.goto(`${base}/configurator`);
  await legacy.waitForLoadState("networkidle");
  await heading(legacy, "What matters most?");
  await legacy
    .getByRole("button", { name: "View your plan", exact: true })
    .click();
  await legacy
    .getByRole("region", { name: "Companion profile" })
    .getByRole("heading", { name: "Vex", exact: true })
    .waitFor();
  await legacy
    .getByText("No preferences or moments retained.", { exact: true })
    .waitFor();
  await legacy
    .getByRole("heading", {
      name: "A physical companion, carefully scoped",
      exact: true,
    })
    .waitFor();
  await legacyContext.close();
  console.log(
    "PASS existing draft migration: no lost Soul, form, memory permission or review preference",
  );

  for (const storageBlocked of [false, true]) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    if (storageBlocked)
      await context.addInitScript(() => {
        for (const method of ["getItem", "setItem", "removeItem"])
          Storage.prototype[method] = () => {
            throw new DOMException("Storage blocked", "SecurityError");
          };
      });
    const page = await context.newPage();
    inspect(page);
    await page.goto(`${base}/configurator`);
    await page.waitForLoadState("networkidle");
    for (const name of [
      "Continue with Morrow",
      "Set preferences",
      "Choose presence",
      "Set priorities",
      "View your plan",
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
    }
    await heading(page, "Your companion plan.");
    if (storageBlocked)
      await page
        .getByText("Browser storage unavailable", { exact: true })
        .waitFor();
    const download = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Save your plan", exact: true })
      .click();
    await (await download).path();
    await context.close();
    console.log(
      `PASS untouched defaults, storage ${storageBlocked ? "blocked" : "available"}: one flow, no typing, direct final download`,
    );
  }
  assert.deepEqual(errors, [], "Browser errors");
  assert.deepEqual(externalRequests, [], "Unexpected external requests");
  console.log(
    `PASS no browser errors, external requests or submissions. Artifacts: ${artifacts}`,
  );
} finally {
  console.log(`Browser QA artifacts: ${artifacts}`);
  await browser.close();
}
