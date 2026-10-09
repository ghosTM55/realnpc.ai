import assert from 'node:assert/strict';
const { chromium } = await import(process.env.REALNPC_PLAYWRIGHT_MODULE ?? 'playwright');
const base = process.env.REALNPC_BASE_URL ?? 'http://127.0.0.1:3000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname));
const browser = await chromium.launch({ channel: process.env.REALNPC_BROWSER_CHANNEL || undefined, headless: true });
const actions = [/^Confirm /, 'Choose Assembly', 'Fine-tune Your Soul', 'Review Your Soul'];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of ['configurator?view=plan', 'configurator?view=presence', 'companion-lab?view=profile']) {
      await page.goto(`${base}/${route}`); await page.getByRole('heading', { name: 'Choose Your Character', exact: true }).waitFor();
      const steps = page.getByRole('navigation', { name: 'Experience steps' }).getByRole('button');
      assert.equal(await steps.count(), 5); for (let i = 1; i < 5; i++) assert.ok(await steps.nth(i).isDisabled());
      assert.equal(await page.getByRole('navigation', { name: 'Experience steps' }).getByRole('button', { name: width < 640 ? 'Traits' : 'Personality', exact: true }).count(), 1, 'The step accessible name matches its visible label');
    }
    await page.locator('label').filter({ has: page.getByRole('radio', { name: 'Raymond', exact: true }) }).click();
    for (const action of actions) await page.locator('[data-flow-footer]').getByRole('button', { name: action, exact: true }).click();
    await page.getByRole('heading', { name: 'Meet Raymond', exact: true }).waitFor();
    const steps = page.getByRole('navigation', { name: 'Experience steps' });
    await steps.getByRole('button', { name: 'Character', exact: true }).click(); await page.reload(); await page.getByRole('heading', { name: 'Choose Your Character', exact: true }).waitFor();
    assert.ok(await steps.getByRole('button', { name: 'Review', exact: true }).isEnabled());
    for (const entrance of [1, 0, 2]) {
      await page.getByRole('link', { name: 'RealNPC home', exact: true }).click();
      await page.getByRole('link', { name: 'Create a Soul', exact: true }).nth(entrance).click();
      await page.getByRole('heading', { name: 'Choose Your Character', exact: true }).waitFor();
      assert.ok(await page.getByRole('radio', { name: 'Raymond', exact: true }).isChecked());
      assert.ok(await steps.getByRole('button', { name: 'Review', exact: true }).isDisabled());
      for (const action of actions) await page.locator('[data-flow-footer]').getByRole('button', { name: action, exact: true }).click();
    }
    await steps.getByRole('button', { name: 'Assembly', exact: true }).click();
    await page.locator('label').filter({ has: page.getByRole('radio', { name: 'Soul + Custom Hardware', exact: true }) }).click();
    await page.locator('[data-flow-footer]').getByRole('button', { name: 'Fine-tune Your Soul', exact: true }).click();
    await page.goto(`${base}/companion-lab/?form=digital-human&view=profile`);
    await page.getByRole('heading', { name: 'Meet Raymond', exact: true }).waitFor();
    await page.getByRole('region', { name: 'Soul profile' }).waitFor({ state: 'visible' });
    await page.getByRole('region', { name: 'Soul profile' }).getByText('Soul + Custom Hardware', { exact: false }).waitFor();
    await context.close(); console.log(`PASS ${width}px locked steps, revisiting, reload, legacy redirect and all creation entrances`);
  }
} finally { await browser.close(); }
