import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../../src/context.js';
import { ariaAllowedAttr } from '../../src/rules/robust/aria-allowed-attr.js';
import { ariaRequiredAttr } from '../../src/rules/robust/aria-required-attr.js';
import { ariaValidAttr } from '../../src/rules/robust/aria-valid-attr.js';
import { ariaValidAttrValue } from '../../src/rules/robust/aria-valid-attr-value.js';
import { ariaRoles } from '../../src/rules/robust/aria-roles.js';
import { ariaHiddenBody } from '../../src/rules/robust/aria-hidden-body.js';
import { duplicateId } from '../../src/rules/robust/duplicate-id.js';
import { ariaRequiredChildren } from '../../src/rules/robust/aria-required-children.js';
import { ariaRequiredParent } from '../../src/rules/robust/aria-required-parent.js';
import { ariaInputFieldName } from '../../src/rules/robust/aria-input-field-name.js';
import { ariaToggleFieldName } from '../../src/rules/robust/aria-toggle-field-name.js';
import { ariaAllowedRole } from '../../src/rules/robust/aria-allowed-role.js';
import { ariaDialogName } from '../../src/rules/robust/aria-dialog-name.js';
import { ariaText } from '../../src/rules/robust/aria-text.js';
import { ariaTreeitemName } from '../../src/rules/robust/aria-treeitem-name.js';
import { presentationRoleConflict } from '../../src/rules/robust/presentation-role-conflict.js';

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

// ── aria-allowed-attr ────────────────────────────────────────────────

describe('aria-allowed-attr', () => {
  it('passes with allowed attributes', async () => {
    await page.setContent('<button role="button" aria-expanded="true">Menu</button>');
    const results = await ariaAllowedAttr.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with disallowed attribute', async () => {
    await page.setContent('<div role="img" aria-expanded="true">Image</div>');
    const results = await ariaAllowedAttr.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });

  it('skips unknown roles', async () => {
    await page.setContent('<div role="unknownrole" aria-label="test">Test</div>');
    const results = await ariaAllowedAttr.run(createRuleContext(page));
    // Unknown roles are skipped, so no violations for the role itself
    expect(results.filter(r => r.ruleId === 'aria-allowed-attr' && r.type === 'violation')).toHaveLength(0);
  });
});

// ── aria-required-attr ───────────────────────────────────────────────

describe('aria-required-attr', () => {
  it('passes with all required attrs', async () => {
    await page.setContent('<div role="checkbox" aria-checked="true">Check</div>');
    const results = await ariaRequiredAttr.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when missing required attr', async () => {
    await page.setContent('<div role="checkbox">No checked</div>');
    const results = await ariaRequiredAttr.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
    expect(results[0].message).toContain('aria-checked');
  });

  it('violates when slider missing valuenow', async () => {
    await page.setContent('<div role="slider" aria-valuemin="0" aria-valuemax="100">Slider</div>');
    const results = await ariaRequiredAttr.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
    expect(results[0].message).toContain('aria-valuenow');
  });
});

// ── aria-valid-attr ──────────────────────────────────────────────────

describe('aria-valid-attr', () => {
  it('passes with valid aria attrs', async () => {
    await page.setContent('<div aria-label="test" aria-hidden="false">Test</div>');
    const results = await ariaValidAttr.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with invalid aria attr', async () => {
    await page.setContent('<div aria-fakeprop="test">Test</div>');
    const results = await ariaValidAttr.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
    expect(results.some(r => r.message.includes('aria-fakeprop'))).toBe(true);
  });
});

// ── aria-valid-attr-value ────────────────────────────────────────────

describe('aria-valid-attr-value', () => {
  it('passes with valid values', async () => {
    await page.setContent('<div aria-hidden="true" aria-live="polite">Test</div>');
    const results = await ariaValidAttrValue.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with invalid boolean value', async () => {
    await page.setContent('<div aria-hidden="yes">Test</div>');
    const results = await ariaValidAttrValue.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });

  it('violates with invalid level', async () => {
    await page.setContent('<div role="heading" aria-level="-1">Test</div>');
    const results = await ariaValidAttrValue.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });

  it('violates with invalid live value', async () => {
    await page.setContent('<div aria-live="loud">Test</div>');
    const results = await ariaValidAttrValue.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── aria-roles ───────────────────────────────────────────────────────

describe('aria-roles', () => {
  it('passes with valid role', async () => {
    await page.setContent('<div role="button">Click</div>');
    const results = await ariaRoles.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with invalid role', async () => {
    await page.setContent('<div role="foobar">Bad</div>');
    const results = await ariaRoles.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with multiple valid fallback roles', async () => {
    await page.setContent('<div role="button link">Fallback</div>');
    const results = await ariaRoles.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });
});

// ── aria-hidden-body ─────────────────────────────────────────────────

describe('aria-hidden-body', () => {
  it('passes without aria-hidden on body', async () => {
    await page.setContent('<body>Content</body>');
    const results = await ariaHiddenBody.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with aria-hidden="true" on body', async () => {
    await page.setContent('<body aria-hidden="true">Content</body>');
    const results = await ariaHiddenBody.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── duplicate-id ─────────────────────────────────────────────────────

describe('duplicate-id', () => {
  it('passes with unique IDs', async () => {
    await page.setContent('<div id="a">A</div><div id="b">B</div>');
    const results = await duplicateId.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with duplicate IDs', async () => {
    await page.setContent('<div id="dup">First</div><div id="dup">Second</div>');
    const results = await duplicateId.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
    expect(results.some(r => r.message.includes('dup'))).toBe(true);
  });
});

// ── aria-required-children ──────────────────────────────────────────

describe('aria-required-children', () => {
  it('passes when listbox has option children', async () => {
    await page.setContent('<div role="listbox"><div role="option">Item 1</div></div>');
    const results = await ariaRequiredChildren.run(createRuleContext(page));
    const listboxResults = results.filter(r => r.ruleId === 'aria-required-children' && r.message.includes('listbox'));
    expect(listboxResults.some(r => r.type === 'pass')).toBe(true);
  });

  it('violates when listbox is empty', async () => {
    await page.setContent('<div role="listbox"></div>');
    const results = await ariaRequiredChildren.run(createRuleContext(page));
    const listboxResults = results.filter(r => r.ruleId === 'aria-required-children' && r.message.includes('listbox'));
    expect(listboxResults.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── aria-required-parent ────────────────────────────────────────────

describe('aria-required-parent', () => {
  it('passes when option is inside listbox', async () => {
    await page.setContent('<div role="listbox"><div role="option">Item 1</div></div>');
    const results = await ariaRequiredParent.run(createRuleContext(page));
    const optionResults = results.filter(r => r.message.includes('"option"'));
    expect(optionResults.some(r => r.type === 'pass')).toBe(true);
  });

  it('violates when option has no listbox parent', async () => {
    await page.setContent('<div><div role="option">Orphaned option</div></div>');
    const results = await ariaRequiredParent.run(createRuleContext(page));
    const optionResults = results.filter(r => r.message.includes('"option"'));
    expect(optionResults.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── aria-input-field-name ───────────────────────────────────────────

describe('aria-input-field-name', () => {
  it('passes with accessible name', async () => {
    await page.setContent('<div role="textbox" aria-label="Name field">John</div>');
    const results = await ariaInputFieldName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without accessible name', async () => {
    await page.setContent('<div role="textbox">John</div>');
    const results = await ariaInputFieldName.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── aria-toggle-field-name ──────────────────────────────────────────

describe('aria-toggle-field-name', () => {
  it('passes with accessible name', async () => {
    await page.setContent('<div role="checkbox" aria-checked="false" aria-label="Accept terms">Terms</div>');
    const results = await ariaToggleFieldName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without accessible name', async () => {
    await page.setContent('<div role="checkbox" aria-checked="false"></div>');
    const results = await ariaToggleFieldName.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── aria-allowed-role ────────────────────────────────────────────────

describe('aria-allowed-role', () => {
  it('passes with compatible role', async () => {
    await page.setContent('<div role="button">Click me</div>');
    const results = await ariaAllowedRole.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with incompatible role on anchor', async () => {
    await page.setContent('<a href="#" role="heading">Bad</a>');
    const results = await ariaAllowedRole.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── aria-dialog-name ─────────────────────────────────────────────────

describe('aria-dialog-name', () => {
  it('passes with aria-label', async () => {
    await page.setContent('<div role="dialog" aria-label="Settings">Content</div>');
    const results = await ariaDialogName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without accessible name', async () => {
    await page.setContent('<div role="dialog">Content</div>');
    const results = await ariaDialogName.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── aria-text ────────────────────────────────────────────────────────

describe('aria-text', () => {
  it('passes without focusable children', async () => {
    await page.setContent('<span role="text">Hello</span>');
    const results = await ariaText.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with focusable child inside role=text', async () => {
    await page.setContent('<span role="text"><a href="#">Link</a></span>');
    const results = await ariaText.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── aria-treeitem-name ───────────────────────────────────────────────

describe('aria-treeitem-name', () => {
  it('passes with text content', async () => {
    await page.setContent('<div role="tree"><div role="treeitem">Item 1</div></div>');
    const results = await ariaTreeitemName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when empty', async () => {
    await page.setContent('<div role="tree"><div role="treeitem"></div></div>');
    const results = await ariaTreeitemName.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── presentation-role-conflict ───────────────────────────────────────

describe('presentation-role-conflict', () => {
  it('passes without conflicting attributes', async () => {
    await page.setContent('<div role="presentation">Content</div>');
    const results = await presentationRoleConflict.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with conflicting aria-label', async () => {
    await page.setContent('<img role="presentation" aria-label="test" src="x.png">');
    const results = await presentationRoleConflict.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});
