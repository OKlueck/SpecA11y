import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../src/context.js';
import { colorContrast } from '../src/rules/perceivable/color-contrast.js';

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();
});

afterEach(async () => {
  await page.close();
});

describe('effective background color', () => {
  it('inherits parent background', async () => {
    await page.setContent('<div style="background:white"><p style="color:black">text</p></div>');
    const results = await colorContrast.run(createRuleContext(page));
    const pResults = results.filter(r => r.ruleId === 'color-contrast');
    // Black on white should pass (21:1 ratio)
    expect(pResults.some(r => r.type === 'pass')).toBe(true);
    // Should not have incomplete results (no background-image issues)
    expect(pResults.filter(r => r.type === 'incomplete')).toHaveLength(0);
  });

  it('composites semi-transparent backgrounds', async () => {
    await page.setContent('<div style="background:white"><div style="background:rgba(0,0,0,0.5)"><p style="color:white">text</p></div></div>');
    const results = await colorContrast.run(createRuleContext(page));
    const pResults = results.filter(r => r.ruleId === 'color-contrast');
    // White text on ~gray composited background should produce a result (not incomplete)
    expect(pResults.some(r => r.type === 'pass' || r.type === 'violation')).toBe(true);
    expect(pResults.filter(r => r.type === 'incomplete')).toHaveLength(0);
  });

  it('reports incomplete for background-image', async () => {
    await page.setContent('<div style="background-image:url(test.png)"><p style="color:black">text</p></div>');
    const results = await colorContrast.run(createRuleContext(page));
    const pResults = results.filter(r => r.ruleId === 'color-contrast');
    expect(pResults.some(r => r.type === 'incomplete')).toBe(true);
  });
});
