import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_DRAFT } from '../src/domain/companion/draft.ts';
const { chromium } = await import(process.env.REALNPC_PLAYWRIGHT_MODULE ?? 'playwright');
const base = process.env.REALNPC_BASE_URL ?? 'http://127.0.0.1:3000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname));
const artifacts = await mkdtemp(join(tmpdir(), 'realnpc-soul-qa-'));
const browser = await chromium.launch({ channel: process.env.REALNPC_BROWSER_CHANNEL || undefined, headless: true });
const errors = [];
const actions = [/^Confirm /, 'Choose Assembly', 'Fine-tune Your Soul', 'Review Your Soul'];
const choose = (page, name) => page.locator('label').filter({ has: page.getByRole('radio', { name, exact: true }) }).click();
async function layout(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal overflow');
  const button = await page.locator('[data-flow-footer]').locator('button, a').last().boundingBox();
  assert.ok(button.x >= 0 && button.x + button.width <= page.viewportSize().width + 1 && button.height >= 44);
}
try {
  for (const width of [1440, 390, 320, 768]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: width === 1440 ? 'no-preference' : 'reduce', deviceScaleFactor: width === 390 ? 3 : 1 });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && !/Failed to load resource.*502/.test(message.text())) errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/chat')) errors.push(`${response.status()} ${response.url()}`); });
    const chatRequests = [];
    await page.route('**/chat', async route => { chatRequests.push(route.request().url()); await route.abort(); });
    await page.goto(`${base}/${width === 1440 ? 'companion-lab' : 'configurator'}`);
    await page.getByRole('heading', { name: 'Choose Your Character', exact: true }).waitFor();
    assert.equal(await page.getByRole('navigation', { name: 'Experience steps' }).getByRole('button').count(), 5);
    assert.equal(await page.getByText('Detailed settings', { exact: true }).count(), 0);
    for (const name of ['Chloe', 'Mia', 'Raymond']) {
      await choose(page, name);
      const portrait = page.locator('.soul-casting-portrait');
      const frame = await portrait.boundingBox();
      const sheet = await portrait.locator('img').boundingBox();
      assert.ok(Math.abs(frame.y - sheet.y) < 2, 'Portrait keeps the source top and hairline');
      assert.ok(Math.abs(frame.height / frame.width - 4 / 3) < .02, 'Portrait has room for full head');
      if (width === 1440 || width === 390) await portrait.screenshot({ path: join(artifacts, `${width}-${name}-portrait.png`) });
    }
    await choose(page, 'Mia');
    assert.equal(await page.getByRole('textbox').count(), 0);
    assert.equal(await page.getByRole('spinbutton').count(), 0);
    await page.getByText('25 · Female', { exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Mia', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Confirm Mia', exact: true }).count(), 1);
    const selectedCharacter = page.getByRole('radio', { name: 'Mia', exact: true });
    await selectedCharacter.focus(); await page.keyboard.press('ArrowRight');
    assert.ok(await page.getByRole('radio', { name: 'Raymond', exact: true }).isChecked());
    await page.getByRole('heading', { name: 'Raymond', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Confirm Raymond', exact: true }).waitFor();
    await page.keyboard.press('ArrowLeft'); assert.ok(await selectedCharacter.isChecked());
    await page.keyboard.press('Space'); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Mia');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" })); await page.screenshot({ animations: "disabled", path: join(artifacts, `${width}-identity.png`), fullPage: true }); await layout(page);
    const initialStepsBox = await page.getByRole('navigation', { name: 'Experience steps' }).boundingBox();
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
    const stepsBox = await page.getByRole('navigation', { name: 'Experience steps' }).boundingBox();
    const expectedStepsTop = Math.max(72, initialStepsBox.y - await page.evaluate(() => scrollY));
    assert.ok(Math.abs(stepsBox.y - expectedStepsTop) < 2, 'Steps stay visible, including pages too short to reach the sticky threshold');
    await page.screenshot({ animations: 'disabled', path: join(artifacts, `${width}-sticky.png`) });
    await page.getByRole('button', { name: actions[0], exact: true }).click();
    await page.getByRole('group', { name: 'With strangers personality', exact: true }).getByText('Honest & direct', { exact: true }).click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" })); await page.screenshot({ animations: "disabled", path: join(artifacts, `${width}-personality.png`), fullPage: true }); await layout(page);
    await page.getByRole('button', { name: actions[1], exact: true }).click();
    await choose(page, 'Soul + Custom Hardware');
    assert.equal(await page.getByText('COMING SOON', { exact: true }).count(), 2);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" })); await page.screenshot({ animations: "disabled", path: join(artifacts, `${width}-assembly.png`), fullPage: true }); await layout(page);
    await page.locator('[data-flow-footer]').getByRole('button', { name: actions[2], exact: true }).click();
    await page.getByRole('heading', { name: 'Detailed settings', exact: true }).waitFor();
    const empathy = page.getByRole('slider', { name: 'Empathy', exact: true });
    await empathy.focus(); await page.keyboard.press('ArrowRight'); assert.equal(await empathy.inputValue(), '66');
    await page.getByRole('tab', { name: /Mind/ }).focus(); await page.keyboard.press('ArrowDown');
    assert.equal(await page.getByRole('tab', { name: /Expression/ }).getAttribute('aria-selected'), 'true');
    const initiative = page.getByRole('switch', { name: 'Let them take the lead', exact: true }); await initiative.focus(); await page.keyboard.press('Space'); assert.equal(await initiative.getAttribute('aria-checked'), 'false');
    for (const group of ['Knowledge', 'Memory', 'Presence', 'World', 'Mind']) {
      await page.getByRole('tab', { name: new RegExp(group) }).click();
      await page.locator('.cap-panel').scrollIntoViewIfNeeded(); await layout(page);
      if (width === 1440 || width === 390) await page.locator('.cap-studio').screenshot({ animations: 'disabled', path: join(artifacts, `${width}-capability-${group}.png`) });
    }
    await page.getByRole('tab', { name: /Mind/ }).focus(); await page.keyboard.press('End');
    assert.equal(await page.getByRole('tab', { name: /World/ }).getAttribute('aria-selected'), 'true');
    await page.keyboard.press('Home'); await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Next: Expression');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Empathy');
    await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('ArrowDown');
    await page.getByRole('button', { name: actions[3], exact: true }).click();
    await page.getByRole('heading', { name: 'Meet Mia', exact: true }).waitFor();
    await page.getByRole('region', { name: 'Soul profile' }).waitFor({ state: 'visible' });
    assert.equal(await page.getByRole('textbox').count(), 0, 'Review has no chat composer');
    assert.equal(await page.getByRole('tab').count(), 0, 'Details is its own step');
    assert.equal(await page.getByRole('button', { name: 'Save Soul', exact: true }).count(), 0);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ animations: 'disabled', path: join(artifacts, `${width}-review.png`), fullPage: true }); await layout(page);
    await page.getByRole('button', { name: 'Edit capabilities', exact: true }).click();
    assert.equal(await empathy.inputValue(), '66');
    await page.getByRole('button', { name: actions[3], exact: true }).click();
    const start = page.getByRole('link', { name: 'Start Conversation with Mia', exact: true });
    await start.focus(); await page.keyboard.press('Enter');
    await page.waitForURL('**/demo/');
    await page.getByRole('heading', { name: 'Mia', exact: true }).waitFor();
    await page.getByText('Say hello to Mia.', { exact: true }).waitFor();
    assert.equal(await page.getByRole('textbox').count(), 1);
    assert.deepEqual(chatRequests, [], 'No chat API call before a visitor sends a message');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ animations: 'disabled', path: join(artifacts, `${width}-demo.png`), fullPage: true });
    await page.reload(); await page.getByRole('heading', { name: 'Mia', exact: true }).waitFor();
    await page.getByRole('link', { name: 'Back to your Soul', exact: true }).click();
    await page.getByRole('heading', { name: 'Meet Mia', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Edit capabilities', exact: true }).click();
    assert.equal(await empathy.inputValue(), '66');
    await page.getByRole('tab', { name: /Expression/ }).click();
    assert.equal(await initiative.getAttribute('aria-checked'), 'false');
    await page.keyboard.press('Escape');
    await context.close(); console.log(`PASS ${width}px five-step creation, separate details, review and demo, keyboard and restored draft`);
  }
  for (const condition of ['blocked', 'corrupt', 'legacy', 'customized']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await context.addInitScript(({ condition, draft }) => {
      if (condition === 'blocked') for (const method of ['getItem', 'setItem', 'removeItem']) Storage.prototype[method] = () => { throw new DOMException('Blocked', 'SecurityError'); };
      else if (!sessionStorage.getItem('qa-init')) {
        sessionStorage.setItem('qa-init', '1');
        sessionStorage.setItem('realnpc:companion-demo:v1', condition === 'customized' ? JSON.stringify(draft) : condition === 'corrupt' ? 'broken' : JSON.stringify({ version: 3, step: 5, unlockedStep: 5, review: { priority: 'privacy', characterSource: 'licensed', budget: 'under-10k', service: 'ongoing' }, config: { soulId: 'instigator', rhythm: 'direct', form: 'robot', takesInitiative: false, rememberPreferences: false, rememberMoments: true, worldVisible: false } }));
      }
    }, { condition, draft: { ...DEFAULT_DRAFT, config: { ...DEFAULT_DRAFT.config, soulId: 'scout', name: 'Nova', age: 32, gender: 'nonbinary', background: 'A night-shift astronomer.', personality: { friends: 'direct', strangers: 'warm', partner: 'thoughtful' }, assembly: 'custom' } } });
    const page = await context.newPage(); await page.goto(`${base}/configurator/`); await page.getByRole('heading', { name: 'Choose Your Character', exact: true }).waitFor();
    if (condition === 'legacy') { assert.ok(await page.getByRole('radio', { name: 'Raymond', exact: true }).isChecked()); await page.getByText('34 · Male', { exact: true }).waitFor(); }
    if (condition === 'blocked') await choose(page, 'Raymond');
    for (const action of actions) await page.locator('[data-flow-footer]').getByRole('button', { name: action, exact: true }).click();
    if (condition === 'customized') {
      await page.getByRole('heading', { name: 'Meet Mia', exact: true }).waitFor();
      await page.getByRole('region', { name: 'Soul profile' }).getByText('25 · Female', { exact: true }).waitFor();
      await page.getByText(/A travel photographer with a pocket full of tickets/).waitFor();
      assert.equal(await page.getByText('Nova', { exact: true }).count(), 0);
      const saved = await page.evaluate(() => JSON.parse(sessionStorage.getItem('realnpc:companion-demo:v1')));
      assert.equal(saved.config.assembly, 'custom'); assert.equal(saved.config.personality.friends, 'direct');
    }
    assert.equal(await page.getByText('Draft & Privacy', { exact: true }).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Reset Soul', exact: true }).count(), 0);
    await page.getByRole('link', { name: /^Start Conversation with / }).click();
    await page.waitForURL('**/demo/');
    if (condition === 'blocked' || condition === 'legacy') await page.getByRole('heading', { name: 'Raymond', exact: true }).waitFor();
    if (condition === 'blocked') await page.getByText('Settings may reset on reload. Storage is unavailable.', { exact: true }).waitFor();
    await context.close(); console.log(`PASS ${condition} storage still reaches review`);
  }
  assert.deepEqual(errors, []);
} finally { console.log(`Soul QA artifacts: ${artifacts}`); await browser.close(); }
