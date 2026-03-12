import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { check, clearRegistry } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('check()', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  }, 30000); // 30s timeout for browser launch

  afterAll(async () => {
    if (browser) await browser.close();
  });

  async function loadFixture(name: string): Promise<Page> {
    const page = await browser.newPage();
    const filePath = path.resolve(__dirname, 'fixtures', name);
    await page.goto(`file://${filePath}`);
    return page;
  }

  it('reports no violations on a good page', async () => {
    const page = await loadFixture('good-page.html');
    const report = await check(page);

    expect(report.summary.counts.violations).toBe(0);
    expect(report.summary.url).toContain('good-page.html');
    expect(report.summary.duration).toBeGreaterThanOrEqual(0);

    await page.close();
  });

  it('reports violations on a bad page', async () => {
    const page = await loadFixture('bad-page.html');
    const report = await check(page);

    expect(report.summary.counts.violations).toBeGreaterThan(0);

    const ruleIds = report.entries.map(e => e.rule.id);
    expect(ruleIds).toContain('img-alt');
    expect(ruleIds).toContain('html-has-lang');
    expect(ruleIds).toContain('document-title');
    expect(ruleIds).toContain('link-name');

    await page.close();
  });

  it('includes passes when configured', async () => {
    const page = await loadFixture('good-page.html');
    const report = await check(page, { includePasses: true });

    expect(report.summary.counts.passes).toBeGreaterThan(0);

    await page.close();
  });

  it('respects disableRules config', async () => {
    const page = await loadFixture('bad-page.html');
    const report = await check(page, { disableRules: ['img-alt'] });

    const ruleIds = report.entries.map(e => e.rule.id);
    expect(ruleIds).not.toContain('img-alt');

    await page.close();
  });
});
