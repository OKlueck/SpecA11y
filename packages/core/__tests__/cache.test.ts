import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../src/context.js';
import { CachedRuleContext } from '../src/cache.js';

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

describe('CachedRuleContext', () => {
  it('returns same result for repeated querySelectorAll', async () => {
    await page.setContent('<div class="item">A</div><div class="item">B</div>');
    const inner = createRuleContext(page);
    const cached = new CachedRuleContext(inner);

    const first = await cached.querySelectorAll('.item');
    const second = await cached.querySelectorAll('.item');

    // Should be the exact same promise/array reference (cached)
    expect(first).toBe(second);
    expect(first).toHaveLength(2);
  });

  it('caches element handle getAttribute calls', async () => {
    await page.setContent('<input id="test" type="text" value="hello">');
    const inner = createRuleContext(page);
    const cached = new CachedRuleContext(inner);

    const elements = await cached.querySelectorAll('#test');
    const el = elements[0];

    const first = await el.getAttribute('type');
    const second = await el.getAttribute('type');

    expect(first).toBe('text');
    expect(second).toBe('text');
    // Both calls should return the same result
    expect(first).toBe(second);
  });

  it('caches getAccessibleName calls', async () => {
    await page.setContent('<button aria-label="Submit">Go</button>');
    const inner = createRuleContext(page);
    const cached = new CachedRuleContext(inner);

    const name1 = await cached.getAccessibleName('button');
    const name2 = await cached.getAccessibleName('button');

    expect(name1).toBe('Submit');
    expect(name2).toBe('Submit');
  });

  it('caches getOuterHTML calls', async () => {
    await page.setContent('<p>Hello</p>');
    const inner = createRuleContext(page);
    const cached = new CachedRuleContext(inner);

    const html1 = await cached.getOuterHTML('p');
    const html2 = await cached.getOuterHTML('p');

    expect(html1).toContain('<p>Hello</p>');
    expect(html1).toBe(html2);
  });

  it('does not cache evaluate calls', async () => {
    await page.setContent('<div id="counter">0</div>');
    const inner = createRuleContext(page);
    const cached = new CachedRuleContext(inner);

    // Mutate the DOM between evaluations
    const val1 = await cached.evaluate(() => document.getElementById('counter')!.textContent);
    await page.evaluate(() => { document.getElementById('counter')!.textContent = '1'; });
    const val2 = await cached.evaluate(() => document.getElementById('counter')!.textContent);

    expect(val1).toBe('0');
    expect(val2).toBe('1');
  });

  it('caches element handle getOuterHTML', async () => {
    await page.setContent('<span class="tag">hello</span>');
    const inner = createRuleContext(page);
    const cached = new CachedRuleContext(inner);

    const elements = await cached.querySelectorAll('.tag');
    const el = elements[0];

    const html1Promise = el.getOuterHTML();
    const html2Promise = el.getOuterHTML();

    // Same promise reference means caching works
    expect(html1Promise).toBe(html2Promise);

    const html = await html1Promise;
    expect(html).toContain('hello');
  });
});
