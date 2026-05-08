import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../src/context.js';

describe('createRuleContext()', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  }, 30000);

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page?.close();
  });

  afterAll(async () => {
    await browser?.close();
  });

  it('enriches elements returned from include-scoped queries', async () => {
    await page.setContent(`
      <main>
        <section id="scope">
          <button aria-label="Save changes">Save</button>
        </section>
        <button aria-label="Cancel changes">Cancel</button>
      </main>
    `);

    const context = createRuleContext(page, { include: ['#scope'] });
    const [button] = await context.querySelectorAll('button');

    expect(button.cssSelector).toBe('section#scope > button');
    expect(button.accessibleName).toBe('Save changes');
    expect(button.role).toBe('button');
  });

  it('keeps enrichment after exclude filtering in include-scoped queries', async () => {
    await page.setContent(`
      <section id="scope">
        <button aria-label="Keep this">Keep</button>
        <div class="ignored"><button aria-label="Drop this">Drop</button></div>
      </section>
    `);

    const context = createRuleContext(page, { include: ['#scope'], exclude: ['.ignored'] });
    const buttons = await context.querySelectorAll('button');

    expect(buttons).toHaveLength(1);
    expect(buttons[0].accessibleName).toBe('Keep this');
    expect(buttons[0].role).toBe('button');
    expect(buttons[0].cssSelector).toBe('section#scope > button');
  });
});
