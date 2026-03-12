import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../src/context.js';

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

describe('accessible name computation', () => {
  it('returns aria-labelledby text', async () => {
    await page.setContent('<span id="lbl">Username</span><input aria-labelledby="lbl">');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('input');
    expect(name).toBe('Username');
  });

  it('returns aria-label', async () => {
    await page.setContent('<button aria-label="Close dialog">X</button>');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('button');
    expect(name).toBe('Close dialog');
  });

  it('returns label via for attribute', async () => {
    await page.setContent('<label for="email">Email</label><input id="email" type="email">');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('#email');
    expect(name).toBe('Email');
  });

  it('returns label via wrapping <label>', async () => {
    await page.setContent('<label>Password <input type="password"></label>');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('input');
    expect(name).toBe('Password');
  });

  it('returns alt text for <img>', async () => {
    await page.setContent('<img src="logo.png" alt="Company Logo">');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('img');
    expect(name).toBe('Company Logo');
  });

  it('returns title as fallback', async () => {
    await page.setContent('<input type="text" title="Search query">');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('input');
    expect(name).toBe('Search query');
  });

  it('returns name from contents for button text', async () => {
    await page.setContent('<button>Submit Form</button>');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('button');
    expect(name).toBe('Submit Form');
  });

  it('returns legend for <fieldset>', async () => {
    await page.setContent('<fieldset><legend>Personal Info</legend><input></fieldset>');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('fieldset');
    expect(name).toBe('Personal Info');
  });

  it('returns figcaption for <figure>', async () => {
    await page.setContent('<figure><img src="x.png" alt="pic"><figcaption>A nice photo</figcaption></figure>');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('figure');
    expect(name).toBe('A nice photo');
  });

  it('returns empty for aria-hidden elements', async () => {
    await page.setContent('<div aria-hidden="true">Hidden content</div>');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('div');
    expect(name).toBe('');
  });

  it('returns placeholder as fallback for inputs', async () => {
    await page.setContent('<input type="text" placeholder="Enter name">');
    const ctx = createRuleContext(page);
    const name = await ctx.getAccessibleName('input');
    expect(name).toBe('Enter name');
  });

  it('computes name from embedded control values via label', async () => {
    await page.setContent('<label>Quantity <input type="text" value="5"> items</label>');
    const ctx = createRuleContext(page);
    // The input's accessible name should come from the wrapping label,
    // which includes the embedded input value when computing label text
    const name = await ctx.getAccessibleName('input');
    expect(name).toContain('Quantity');
  });
});
