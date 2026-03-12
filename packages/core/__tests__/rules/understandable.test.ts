import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../../src/context.js';
import { htmlHasLang } from '../../src/rules/understandable/html-has-lang.js';
import { validLang } from '../../src/rules/understandable/valid-lang.js';
import { label } from '../../src/rules/understandable/label.js';
import { selectName } from '../../src/rules/understandable/select-name.js';
import { buttonName } from '../../src/rules/understandable/button-name.js';
import { formFieldMultipleLabels } from '../../src/rules/understandable/form-field-multiple-labels.js';
import { onFocus } from '../../src/rules/understandable/on-focus.js';
import { consistentNavigation } from '../../src/rules/understandable/consistent-navigation.js';
import { consistentIdentification } from '../../src/rules/understandable/consistent-identification.js';
import { consistentHelp } from '../../src/rules/understandable/consistent-help.js';
import { errorIdentification } from '../../src/rules/understandable/error-identification.js';
import { errorSuggestion } from '../../src/rules/understandable/error-suggestion.js';
import { errorPrevention } from '../../src/rules/understandable/error-prevention.js';
import { redundantEntry } from '../../src/rules/understandable/redundant-entry.js';
import { accessibleAuth } from '../../src/rules/understandable/accessible-auth.js';
import { labelTitleOnly } from '../../src/rules/understandable/label-title-only.js';
import { labelContentNameMismatch } from '../../src/rules/understandable/label-content-name-mismatch.js';

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

// ── html-has-lang ────────────────────────────────────────────────────

describe('html-has-lang', () => {
  it('passes with valid lang', async () => {
    await page.setContent('<html lang="en"><body></body></html>');
    const results = await htmlHasLang.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without lang', async () => {
    await page.setContent('<html><body></body></html>');
    const results = await htmlHasLang.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('violates with invalid lang', async () => {
    await page.setContent('<html lang="123"><body></body></html>');
    const results = await htmlHasLang.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with region subtag', async () => {
    await page.setContent('<html lang="en-US"><body></body></html>');
    const results = await htmlHasLang.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });
});

// ── valid-lang ───────────────────────────────────────────────────────

describe('valid-lang', () => {
  it('passes with valid lang on element', async () => {
    await page.setContent('<html lang="en"><body><p lang="de">German</p></body></html>');
    const results = await validLang.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });

  it('violates with invalid lang', async () => {
    await page.setContent('<html lang="en"><body><p lang="xyz123">Bad</p></body></html>');
    const results = await validLang.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });

  it('violates with empty lang', async () => {
    await page.setContent('<html lang="en"><body><p lang="">Empty</p></body></html>');
    const results = await validLang.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── label ────────────────────────────────────────────────────────────

describe('label', () => {
  it('passes with label[for]', async () => {
    await page.setContent('<label for="name">Name</label><input id="name">');
    const results = await label.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with wrapping label', async () => {
    await page.setContent('<label>Name <input></label>');
    const results = await label.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with aria-label', async () => {
    await page.setContent('<input aria-label="Name">');
    const results = await label.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without any label', async () => {
    await page.setContent('<input type="text">');
    const results = await label.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('skips hidden inputs', async () => {
    await page.setContent('<input type="hidden" name="token" value="abc">');
    const results = await label.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('skips submit buttons', async () => {
    await page.setContent('<input type="submit" value="Go">');
    const results = await label.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── select-name ──────────────────────────────────────────────────────

describe('select-name', () => {
  it('passes with label', async () => {
    await page.setContent('<label for="s1">Choose</label><select id="s1"><option>A</option></select>');
    const results = await selectName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without name', async () => {
    await page.setContent('<select><option>A</option></select>');
    const results = await selectName.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with aria-label', async () => {
    await page.setContent('<select aria-label="Country"><option>US</option></select>');
    const results = await selectName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });
});

// ── button-name ──────────────────────────────────────────────────────

describe('button-name', () => {
  it('passes with text', async () => {
    await page.setContent('<button>Submit</button>');
    const results = await buttonName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without name', async () => {
    await page.setContent('<button></button>');
    const results = await buttonName.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with aria-label', async () => {
    await page.setContent('<button aria-label="Close"></button>');
    const results = await buttonName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with value on input[type=submit]', async () => {
    await page.setContent('<input type="submit" value="Go">');
    const results = await buttonName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with role="button"', async () => {
    await page.setContent('<div role="button">Click me</div>');
    const results = await buttonName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });
});

// ── form-field-multiple-labels ───────────────────────────────────────

describe('form-field-multiple-labels', () => {
  it('passes with single label', async () => {
    await page.setContent('<label for="x">Name</label><input id="x">');
    const results = await formFieldMultipleLabels.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with multiple labels', async () => {
    await page.setContent('<label for="x">Name</label><label for="x">Also Name</label><input id="x">');
    const results = await formFieldMultipleLabels.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── on-focus ─────────────────────────────────────────────────────────

describe('on-focus', () => {
  it('warns about context-changing onfocus', async () => {
    await page.setContent('<input onfocus="window.location.href=\'/other\'">');
    const results = await onFocus.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('passes without onfocus handlers', async () => {
    await page.setContent('<input type="text">');
    const results = await onFocus.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });
});

// ── consistent-navigation ────────────────────────────────────────────

describe('consistent-navigation', () => {
  it('passes with list-based nav', async () => {
    await page.setContent('<nav><ul><li><a href="/">Home</a></li><li><a href="/about">About</a></li></ul></nav>');
    const results = await consistentNavigation.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('warns with unstructured nav', async () => {
    await page.setContent('<nav><a href="/">Home</a> <a href="/about">About</a></nav>');
    const results = await consistentNavigation.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('warns when no nav element', async () => {
    await page.setContent('<div>No navigation</div>');
    const results = await consistentNavigation.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });
});

// ── consistent-identification ────────────────────────────────────────

describe('consistent-identification', () => {
  it('warns about unlabeled search input', async () => {
    await page.setContent('<input type="search">');
    const results = await consistentIdentification.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning when search has label', async () => {
    await page.setContent('<input type="search" aria-label="Search">');
    const results = await consistentIdentification.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── consistent-help ──────────────────────────────────────────────────

describe('consistent-help', () => {
  it('passes with help link', async () => {
    await page.setContent('<a href="/help">Help</a>');
    const results = await consistentHelp.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with contact link', async () => {
    await page.setContent('<a href="/contact">Contact us</a>');
    const results = await consistentHelp.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('incomplete without help mechanism', async () => {
    await page.setContent('<p>No help here</p>');
    const results = await consistentHelp.run(createRuleContext(page));
    expect(results[0].type).toBe('incomplete');
  });
});

// ── error-identification ─────────────────────────────────────────────

describe('error-identification', () => {
  it('passes with aria-describedby error', async () => {
    await page.setContent(`
      <input id="email" aria-invalid="true" aria-describedby="err1">
      <span id="err1">Invalid email</span>
    `);
    const results = await errorIdentification.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without error message', async () => {
    await page.setContent('<input aria-invalid="true">');
    const results = await errorIdentification.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── error-suggestion ─────────────────────────────────────────────────

describe('error-suggestion', () => {
  it('warns about pattern without description', async () => {
    await page.setContent('<input pattern="[0-9]{5}">');
    const results = await errorSuggestion.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning when pattern has title', async () => {
    await page.setContent('<input pattern="[0-9]{5}" title="5 digit zip code">');
    const results = await errorSuggestion.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── error-prevention ─────────────────────────────────────────────────

describe('error-prevention', () => {
  it('warns about payment form without confirmation', async () => {
    await page.setContent('<form action="/checkout"><input name="credit-card"><button type="submit">Pay</button></form>');
    const results = await errorPrevention.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning for non-sensitive form', async () => {
    await page.setContent('<form action="/search"><input name="q"><button type="submit">Search</button></form>');
    const results = await errorPrevention.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── redundant-entry ──────────────────────────────────────────────────

describe('redundant-entry', () => {
  it('warns about duplicate autocomplete', async () => {
    await page.setContent(`
      <input autocomplete="email" name="email1">
      <input autocomplete="email" name="email2">
    `);
    const results = await redundantEntry.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning for unique autocomplete', async () => {
    await page.setContent(`
      <input autocomplete="email">
      <input autocomplete="tel">
    `);
    const results = await redundantEntry.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── accessible-auth ──────────────────────────────────────────────────

describe('accessible-auth', () => {
  it('warns about paste-blocked password', async () => {
    await page.setContent('<input type="password" onpaste="return false">');
    const results = await accessibleAuth.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('warns about CAPTCHA image', async () => {
    await page.setContent('<img src="/captcha.png" alt="captcha">');
    const results = await accessibleAuth.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning for normal password field', async () => {
    await page.setContent('<input type="password">');
    const results = await accessibleAuth.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── label-title-only ─────────────────────────────────────────────────

describe('label-title-only', () => {
  it('passes with label[for]', async () => {
    await page.setContent('<label for="i">Name</label><input id="i" title="Name">');
    const results = await labelTitleOnly.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with only title attribute', async () => {
    await page.setContent('<input title="Name">');
    const results = await labelTitleOnly.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── label-content-name-mismatch ──────────────────────────────────────

describe('label-content-name-mismatch', () => {
  it('passes when aria-label contains visible text', async () => {
    await page.setContent('<button aria-label="Submit form">Submit</button>');
    const results = await labelContentNameMismatch.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when aria-label does not contain visible text', async () => {
    await page.setContent('<button aria-label="Close dialog">Submit</button>');
    const results = await labelContentNameMismatch.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});
