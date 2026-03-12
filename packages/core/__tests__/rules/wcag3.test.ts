import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../../src/context.js';
import { textCustomization } from '../../src/rules/wcag3/text-customization.js';
import { reducedMotionRespect } from '../../src/rules/wcag3/reduced-motion-respect.js';
import { cognitiveLoadDeceptive } from '../../src/rules/wcag3/cognitive-load-deceptive.js';

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

// ── text-customization ───────────────────────────────────────────────

describe('text-customization', () => {
  it('warns about fixed px font-size in inline style', async () => {
    await page.setContent('<p style="font-size: 14px">Fixed size</p>');
    const results = await textCustomization.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning for relative units', async () => {
    await page.setContent('<p style="font-size: 1rem">Relative</p>');
    const results = await textCustomization.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('no warning without inline styles', async () => {
    await page.setContent('<p>No styles</p>');
    const results = await textCustomization.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── reduced-motion-respect ───────────────────────────────────────────

describe('reduced-motion-respect', () => {
  it('warns about animations without reduced-motion query', async () => {
    await page.setContent(`
      <style>
        .spin { animation: spin 1s infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      </style>
      <div class="spin">Spinning</div>
    `);
    const results = await reducedMotionRespect.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('passes with reduced-motion query', async () => {
    await page.setContent(`
      <style>
        .spin { animation: spin 1s infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
      </style>
      <div class="spin">Spinning</div>
    `);
    const results = await reducedMotionRespect.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('returns empty without animations', async () => {
    await page.setContent('<p>Static content</p>');
    const results = await reducedMotionRespect.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── cognitive-load-deceptive ─────────────────────────────────────────

describe('cognitive-load-deceptive', () => {
  it('warns about pre-checked checkbox', async () => {
    await page.setContent('<form><input type="checkbox" checked name="newsletter">Subscribe</form>');
    const results = await cognitiveLoadDeceptive.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning' && r.message.includes('pre-checked'))).toBe(true);
  });

  it('skips remember-me checkbox', async () => {
    await page.setContent('<form><input type="checkbox" checked name="remember">Remember me</form>');
    const results = await cognitiveLoadDeceptive.run(createRuleContext(page));
    const preChecked = results.filter(r => r.message.includes('pre-checked'));
    expect(preChecked).toHaveLength(0);
  });

  it('warns about generic link text', async () => {
    await page.setContent('<a href="/page">click here</a>');
    const results = await cognitiveLoadDeceptive.run(createRuleContext(page));
    expect(results.some(r => r.message.includes('generic text'))).toBe(true);
  });

  it('no warning for descriptive link text', async () => {
    await page.setContent('<a href="/pricing">View pricing details</a>');
    const results = await cognitiveLoadDeceptive.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});
