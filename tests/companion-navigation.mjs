import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { chromium } = await import(
  process.env.REALNPC_PLAYWRIGHT_MODULE ?? "playwright"
);
const base = process.env.REALNPC_BASE_URL ?? "http://127.0.0.1:3000";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const failures = [];
const errors = [];
const artifacts = await mkdtemp(join(tmpdir(), "realnpc-navigation-qa-"));
const actions = [
  "Continue with Morrow",
  "Set preferences",
  "Choose presence",
  "Set priorities",
  "View your plan",
];

async function checkCopy(page, step, soul = "Morrow") {
  const headings = ["Choose your Soul.", `Life with ${soul}.`, "On your terms.", `Bring ${soul} into your world.`, "What matters most?", "Your companion plan."];
  const eyebrows = ["01 / Chemistry", "02 / Everyday life", `03 / ${soul}`, "04 / Presence", "05 / Priorities", "06 / Your plan"];
  const heading = page.getByRole("heading", { level: 1, name: headings[step], exact: true });
  await heading.waitFor();
  assert.equal(await heading.locator("..").locator("p").first().textContent(), eyebrows[step]);
  assert.equal(await page.locator("[data-flow-footer] p").first().textContent(), `${soul} · ${step + 1} of 6`);
  const action = step === 5 ? "Save your plan" : step === 0 ? `Continue with ${soul}` : actions[step];
  assert.equal(await page.locator("[data-flow-footer]").getByRole("button", { name: action, exact: true }).count(), 1);
}

async function checkSteps(page, unlocked, current = unlocked) {
  const steps = page
    .getByRole("navigation", { name: "Experience steps" })
    .getByRole("button");
  const labels = ["Choose Soul", "Meet them", "Your terms", "Presence", "Priorities", "Your plan"];
  assert.equal(await steps.count(), 6);
  for (let index = 0; index < 6; index++) {
    assert.equal(await page.getByRole("navigation", { name: "Experience steps" }).getByRole("button", { name: labels[index], exact: true }).count(), 1);
    assert.equal(
      await steps.nth(index).isEnabled(),
      index <= unlocked,
      `Only confirmed progress may unlock step ${index + 1}.`,
    );
    assert.equal(
      await steps.nth(index).getAttribute("aria-current"),
      index === current ? "step" : null,
    );
  }
}

try {
  for (const width of [1440, 390]) {
    for (const scenario of ["fresh entry", "locked steps"]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      try {
        await page.goto(`${base}/configurator`);
        await page.waitForLoadState("networkidle");
        if (scenario === "fresh entry") {
          await page.getByRole("heading", { name: "Vex", exact: true }).click();
          for (const entrance of [1, 0, 2]) {
            for (const [index, name] of ["Continue with Vex", ...actions.slice(1)].entries()) {
              await checkCopy(page, index, "Vex");
              await page.getByRole("button", { name, exact: true }).click();
            }
            await checkCopy(page, 5, "Vex");
            await page
              .getByRole("heading", {
                name: "Your companion plan.",
                exact: true,
              })
              .waitFor();
            await page
              .getByRole("link", { name: "RealNPC home", exact: true })
              .click();
            await page
              .getByRole("link", { name: "Create a Soul", exact: true })
              .nth(entrance)
              .click();
            await page.waitForURL(/\/configurator\/?(?:\?|$)/);
            await page.locator("#flow-heading").waitFor();
            await page.waitForLoadState("networkidle");
            assert.equal(
              await page.locator("h1").textContent(),
              "Choose your Soul.",
              "Every creation CTA must start at step one, even after finishing a previous plan.",
            );
            assert.ok(
              await page
                .getByRole("radio", { name: "Vex", exact: true })
                .isChecked(),
              "Starting again must not discard the user's saved choices.",
            );
            await checkSteps(page, 0);
          }
          await page.screenshot({
            path: join(artifacts, `${width}-restart.png`),
            animations: "disabled",
          });
        } else {
          for (const route of [
            "configurator?view=plan",
            "configurator?view=presence",
            "companion-lab?view=profile",
          ]) {
            await page.goto(`${base}/${route}`);
            await page
              .getByRole("heading", { name: "Choose your Soul.", exact: true })
              .waitFor();
            await page.waitForLoadState("networkidle");
            await checkSteps(page, 0);
          }
          for (let index = 0; index < 6; index++) {
            await checkSteps(page, index);
            await checkCopy(page, index);
            if (index === 2) {
              const steps = page.getByRole("navigation", {
                name: "Experience steps",
              });
              await steps
                .getByRole("button", { name: "Choose Soul", exact: true })
                .click();
              await page.reload();
              await page.waitForLoadState("networkidle");
              await checkSteps(page, 2, 0);
              await steps
                .getByRole("button", { name: "Your terms", exact: true })
                .click();
              await checkSteps(page, 2);
              await page.screenshot({
                path: join(artifacts, `${width}-partial-progress.png`),
                animations: "disabled",
              });
            }
            if (index < actions.length)
              await page
                .getByRole("button", { name: actions[index], exact: true })
                .click();
          }
          await page.reload();
          await page.waitForLoadState("networkidle");
          await checkSteps(page, 5);
        }
        console.log(`PASS ${width}px ${scenario}`);
      } catch (error) {
        failures.push(`${width}px ${scenario}: ${error.message}`);
      } finally {
        await context.close();
      }
    }
  }
  assert.deepEqual(failures, []);
  assert.deepEqual(errors, []);
  console.log(`Navigation QA artifacts: ${artifacts}`);
} finally {
  await browser.close();
}
