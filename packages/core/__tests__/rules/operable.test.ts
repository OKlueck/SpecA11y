import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createRuleContext } from '../../src/context.js';
import { documentTitle } from '../../src/rules/operable/document-title.js';
import { linkName } from '../../src/rules/operable/link-name.js';
import { bypass } from '../../src/rules/operable/bypass.js';
import { frameTitle } from '../../src/rules/operable/frame-title.js';
import { tabindex } from '../../src/rules/operable/tabindex.js';
import { accesskeys } from '../../src/rules/operable/accesskeys.js';
import { metaRefresh } from '../../src/rules/operable/meta-refresh.js';
import { marquee } from '../../src/rules/operable/marquee.js';
import { blink } from '../../src/rules/operable/blink.js';
import { serverSideImageMap } from '../../src/rules/operable/server-side-image-map.js';
import { focusVisible } from '../../src/rules/operable/focus-visible.js';
import { targetSize } from '../../src/rules/operable/target-size.js';
import { characterKeyShortcuts } from '../../src/rules/operable/character-key-shortcuts.js';
import { timingAdjustable } from '../../src/rules/operable/timing-adjustable.js';
import { multipleWays } from '../../src/rules/operable/multiple-ways.js';
import { focusAppearance } from '../../src/rules/operable/focus-appearance.js';
import { pointerCancellation } from '../../src/rules/operable/pointer-cancellation.js';
import { draggingMovements } from '../../src/rules/operable/dragging-movements.js';
import { nestedInteractive } from '../../src/rules/operable/nested-interactive.js';
import { skipLink } from '../../src/rules/operable/skip-link.js';
import { scrollableRegionFocusable } from '../../src/rules/operable/scrollable-region-focusable.js';
import { noEmptyLinks } from '../../src/rules/operable/no-empty-links.js';
import { tabindexRemovesFocusability } from '../../src/rules/operable/tabindex-removes-focusability.js';
import { pointerInteractionBlocked } from '../../src/rules/operable/pointer-interaction-blocked.js';
import { keyboardInputBlocked } from '../../src/rules/operable/keyboard-input-blocked.js';
import { javascriptVoidLinks } from '../../src/rules/operable/javascript-void-links.js';
import { scrollBlocked } from '../../src/rules/operable/scroll-blocked.js';

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

// ── document-title ───────────────────────────────────────────────────

describe('document-title', () => {
  it('passes with a title', async () => {
    await page.setContent('<html><head><title>My Page</title></head><body></body></html>');
    const results = await documentTitle.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without a title', async () => {
    await page.setContent('<html><head></head><body></body></html>');
    const results = await documentTitle.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('violates with empty title', async () => {
    await page.setContent('<html><head><title>  </title></head><body></body></html>');
    const results = await documentTitle.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── link-name ────────────────────────────────────────────────────────

describe('link-name', () => {
  it('passes with text content', async () => {
    await page.setContent('<a href="#">Home</a>');
    const results = await linkName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with empty link', async () => {
    await page.setContent('<a href="#"></a>');
    const results = await linkName.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('passes with aria-label', async () => {
    await page.setContent('<a href="#" aria-label="Home page"></a>');
    const results = await linkName.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('returns nothing when no links', async () => {
    await page.setContent('<p>No links</p>');
    const results = await linkName.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── bypass ───────────────────────────────────────────────────────────

describe('bypass', () => {
  it('passes with main element', async () => {
    await page.setContent('<header>Nav</header><main>Content</main>');
    const results = await bypass.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with role="main"', async () => {
    await page.setContent('<div role="main">Content</div>');
    const results = await bypass.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with skip link', async () => {
    await page.setContent('<a href="#main">Skip</a><div id="main">Content</div>');
    const results = await bypass.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without bypass mechanism', async () => {
    await page.setContent('<div>Just content, no landmarks</div>');
    const results = await bypass.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── frame-title ──────────────────────────────────────────────────────

describe('frame-title', () => {
  it('passes with titled iframe', async () => {
    await page.setContent('<iframe title="External content" src="about:blank"></iframe>');
    const results = await frameTitle.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates without title', async () => {
    await page.setContent('<iframe src="about:blank"></iframe>');
    const results = await frameTitle.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('violates with empty title', async () => {
    await page.setContent('<iframe title="" src="about:blank"></iframe>');
    const results = await frameTitle.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── tabindex ─────────────────────────────────────────────────────────

describe('tabindex', () => {
  it('passes with tabindex="0"', async () => {
    await page.setContent('<div tabindex="0">Focusable</div>');
    const results = await tabindex.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with tabindex="-1"', async () => {
    await page.setContent('<div tabindex="-1">Programmatic</div>');
    const results = await tabindex.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with positive tabindex', async () => {
    await page.setContent('<div tabindex="5">Bad order</div>');
    const results = await tabindex.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── accesskeys ───────────────────────────────────────────────────────

describe('accesskeys', () => {
  it('passes with unique accesskeys', async () => {
    await page.setContent('<button accesskey="s">Save</button><button accesskey="c">Cancel</button>');
    const results = await accesskeys.run(createRuleContext(page));
    expect(results.every(r => r.type === 'pass')).toBe(true);
  });

  it('violates with duplicate accesskeys', async () => {
    await page.setContent('<button accesskey="s">Save</button><button accesskey="s">Submit</button>');
    const results = await accesskeys.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── meta-refresh ─────────────────────────────────────────────────────

describe('meta-refresh', () => {
  it('passes with instant redirect', async () => {
    await page.setContent('<html><head><meta http-equiv="refresh" content="0;url=other.html"></head><body></body></html>');
    const results = await metaRefresh.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with timed redirect', async () => {
    await page.setContent('<html><head><meta http-equiv="refresh" content="5;url=other.html"></head><body></body></html>');
    const results = await metaRefresh.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('violates with timed refresh (no url)', async () => {
    await page.setContent('<html><head><meta http-equiv="refresh" content="30"></head><body></body></html>');
    const results = await metaRefresh.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── marquee ──────────────────────────────────────────────────────────

describe('marquee', () => {
  it('violates with marquee element', async () => {
    await page.setContent('<marquee>Scrolling text</marquee>');
    const results = await marquee.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('returns empty when no marquee', async () => {
    await page.setContent('<p>Normal text</p>');
    const results = await marquee.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── blink ────────────────────────────────────────────────────────────

describe('blink', () => {
  it('violates with blink element', async () => {
    await page.setContent('<blink>Blinking</blink>');
    const results = await blink.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('returns empty when no blink', async () => {
    await page.setContent('<p>Normal</p>');
    const results = await blink.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── server-side-image-map ────────────────────────────────────────────

describe('server-side-image-map', () => {
  it('violates with ismap', async () => {
    await page.setContent('<a href="/map"><img src="x.png" ismap alt="map"></a>');
    const results = await serverSideImageMap.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });

  it('returns empty without ismap', async () => {
    await page.setContent('<img src="x.png" alt="normal">');
    const results = await serverSideImageMap.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── focus-visible ────────────────────────────────────────────────────

describe('focus-visible', () => {
  it('detects suppressed outline via screenshot comparison', async () => {
    await page.setContent(`
      <button style="outline: none; width: 100px; height: 40px; border: none; background: white; margin: 20px;">Click</button>
      <button style="outline: none; width: 100px; height: 40px; border: none; background: white; margin: 20px;">Click 2</button>
    `);
    const results = await focusVisible.run(createRuleContext(page));
    // With screenshot-based detection, the rule produces violation, pass, or incomplete results
    expect(results.length).toBeGreaterThan(0);
    // No element should get a pure pass via CSS pre-filter since outline is none
    expect(results.every(r => r.type !== 'pass' || r.message.includes('Alternative focus style'))).toBe(true);
  });

  it('passes when outline is present', async () => {
    await page.setContent('<button style="outline: 2px solid blue;">Click</button>');
    const results = await focusVisible.run(createRuleContext(page));
    const btnResults = results.filter(r => r.element?.html?.includes('button'));
    expect(btnResults.some(r => r.type === 'pass')).toBe(true);
  });
});

// ── target-size ──────────────────────────────────────────────────────

describe('target-size', () => {
  it('warns about small targets without spacing exception', async () => {
    // Two adjacent small buttons so spacing exception doesn't apply
    await page.setContent('<button style="width: 10px; height: 10px; padding: 0; display: inline-block;">X</button><button style="width: 10px; height: 10px; padding: 0; display: inline-block;">Y</button>');
    const results = await targetSize.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('passes with large enough target', async () => {
    await page.setContent('<button style="width: 48px; height: 48px;">OK</button>');
    const results = await targetSize.run(createRuleContext(page));
    const btnResults = results.filter(r => r.element?.html?.includes('button'));
    expect(btnResults.some(r => r.type === 'pass')).toBe(true);
  });
});

// ── character-key-shortcuts ──────────────────────────────────────────

describe('character-key-shortcuts', () => {
  it('warns about single-char accesskey', async () => {
    await page.setContent('<button accesskey="s">Save</button>');
    const results = await characterKeyShortcuts.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('warns about onkeydown handler', async () => {
    await page.setContent('<div onkeydown="handleKey()">Trap</div>');
    const results = await characterKeyShortcuts.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });
});

// ── timing-adjustable ────────────────────────────────────────────────

describe('timing-adjustable', () => {
  it('warns about meta refresh with delay', async () => {
    await page.setContent('<html><head><meta http-equiv="refresh" content="60"></head><body></body></html>');
    const results = await timingAdjustable.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('warns about setTimeout in inline script', async () => {
    await page.setContent('<script>setTimeout(function() { alert("hi"); }, 5000);</script>');
    const results = await timingAdjustable.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });
});

// ── multiple-ways ────────────────────────────────────────────────────

describe('multiple-ways', () => {
  it('passes with nav element', async () => {
    await page.setContent('<nav><ul><li><a href="/">Home</a></li></ul></nav><main>Content</main>');
    const results = await multipleWays.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('passes with search input', async () => {
    await page.setContent('<input type="search" aria-label="Search"><main>Content</main>');
    const results = await multipleWays.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('warns when no navigation mechanism', async () => {
    await page.setContent('<div>Just content</div>');
    const results = await multipleWays.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });
});

// ── focus-appearance ─────────────────────────────────────────────────

describe('focus-appearance', () => {
  it('warns when outline is none', async () => {
    await page.setContent('<a href="#" style="outline: none;">Link</a>');
    const results = await focusAppearance.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });
});

// ── pointer-cancellation ─────────────────────────────────────────────

describe('pointer-cancellation', () => {
  it('warns about onmousedown', async () => {
    await page.setContent('<button onmousedown="doStuff()">Click</button>');
    const results = await pointerCancellation.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning without down handlers', async () => {
    await page.setContent('<button onclick="doStuff()">Click</button>');
    const results = await pointerCancellation.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── dragging-movements ───────────────────────────────────────────────

describe('dragging-movements', () => {
  it('warns about draggable elements', async () => {
    await page.setContent('<div draggable="true">Drag me</div>');
    const results = await draggingMovements.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('warns about slider role', async () => {
    await page.setContent('<div role="slider" aria-valuenow="5" aria-valuemin="0" aria-valuemax="10">Slider</div>');
    const results = await draggingMovements.run(createRuleContext(page));
    expect(results.some(r => r.type === 'warning')).toBe(true);
  });

  it('no warning without drag elements', async () => {
    await page.setContent('<button>Click</button>');
    const results = await draggingMovements.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── nested-interactive ──────────────────────────────────────────────

describe('nested-interactive', () => {
  it('passes with non-nested interactive', async () => {
    await page.setContent('<a href="#">Link</a><button>Button</button>');
    const results = await nestedInteractive.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with <a><button>click</button></a>', async () => {
    await page.setContent('<a href="#"><button>click</button></a>');
    const results = await nestedInteractive.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── skip-link ───────────────────────────────────────────────────────

describe('skip-link', () => {
  it('passes when first link is a skip link', async () => {
    await page.setContent('<a href="#main">Skip to content</a><div id="main"><main>Content</main></div>');
    const results = await skipLink.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('warns when no skip link', async () => {
    await page.setContent('<div>No links at all</div>');
    const results = await skipLink.run(createRuleContext(page));
    expect(results[0].type).toBe('warning');
  });
});

// ── scrollable-region-focusable ──────────────────────────────────────

describe('scrollable-region-focusable', () => {
  it('no violation with tabindex on scrollable div', async () => {
    await page.setContent('<div style="overflow:auto;height:50px" tabindex="0"><div style="height:200px">content</div></div>');
    const results = await scrollableRegionFocusable.run(createRuleContext(page));
    const violations = results.filter(r => r.type === 'violation');
    expect(violations).toHaveLength(0);
  });

  it('violates without tabindex on scrollable div', async () => {
    await page.setContent('<div style="overflow:auto;height:50px"><div style="height:200px">content</div></div>');
    const results = await scrollableRegionFocusable.run(createRuleContext(page));
    expect(results.some(r => r.type === 'violation')).toBe(true);
  });
});

// ── no-empty-links ───────────────────────────────────────────────────

describe('no-empty-links', () => {
  it('passes with text content', async () => {
    await page.setContent('<a href="#">Link text</a>');
    const results = await noEmptyLinks.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates with empty link', async () => {
    await page.setContent('<a href="#"></a>');
    const results = await noEmptyLinks.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── tabindex-removes-focusability ────────────────────────────────────

describe('tabindex-removes-focusability', () => {
  it('returns no results when no tabindex=-1 on native elements', async () => {
    await page.setContent('<button>Click</button><a href="#">Link</a><input type="text">');
    const results = await tabindexRemovesFocusability.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('warns when a single native element has tabindex=-1', async () => {
    await page.setContent('<button>OK</button><a href="#" tabindex="-1">Link</a><input type="text">');
    const results = await tabindexRemovesFocusability.run(createRuleContext(page));
    const warnings = results.filter(r => r.type === 'warning');
    expect(warnings).toHaveLength(1);
  });

  it('violates when many native elements have tabindex=-1', async () => {
    await page.setContent(`
      <a href="#" tabindex="-1">Link 1</a>
      <a href="#" tabindex="-1">Link 2</a>
      <button tabindex="-1">Button</button>
      <input type="text" tabindex="-1">
    `);
    const results = await tabindexRemovesFocusability.run(createRuleContext(page));
    const violations = results.filter(r => r.type === 'violation');
    expect(violations.length).toBeGreaterThan(0);
  });

  it('ignores tabindex=-1 inside composite widgets', async () => {
    await page.setContent(`
      <div role="tablist">
        <button role="tab" tabindex="-1">Tab 1</button>
        <button role="tab" tabindex="0">Tab 2</button>
      </div>
    `);
    const results = await tabindexRemovesFocusability.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── pointer-interaction-blocked ──────────────────────────────────────

describe('pointer-interaction-blocked', () => {
  it('returns no results on normal pages', async () => {
    await page.setContent('<main><button>Click me</button></main>');
    const results = await pointerInteractionBlocked.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('violates when pointer-events: none on content with interactive elements', async () => {
    await page.setContent('<main style="pointer-events: none"><a href="#">Link</a></main>');
    const results = await pointerInteractionBlocked.run(createRuleContext(page));
    const violations = results.filter(r => r.type === 'violation');
    expect(violations.length).toBeGreaterThan(0);
  });

  it('warns when cursor: none on content area', async () => {
    await page.setContent('<body style="cursor: none"><p>Content</p></body>');
    const results = await pointerInteractionBlocked.run(createRuleContext(page));
    const warnings = results.filter(r => r.type === 'warning');
    expect(warnings.length).toBeGreaterThan(0);
  });
});

// ── keyboard-input-blocked ───────────────────────────────────────────

describe('keyboard-input-blocked', () => {
  it('passes on pages without keyboard blocking', async () => {
    await page.setContent('<p>Normal content</p>');
    const results = await keyboardInputBlocked.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when keydown preventDefault is active', async () => {
    await page.setContent('<p>Content</p>');
    await page.evaluate(() => {
      document.addEventListener('keydown', (e) => e.preventDefault());
    });
    const results = await keyboardInputBlocked.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
  });
});

// ── javascript-void-links ─────────────────────────────────────────────

describe('javascript-void-links', () => {
  it('violates on javascript:void(0) links', async () => {
    await page.setContent('<a href="javascript:void(0)">Click me</a>');
    const results = await javascriptVoidLinks.run(createRuleContext(page));
    const violations = results.filter((r) => r.type === 'violation');
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('javascript:');
  });

  it('violates on javascript: links', async () => {
    await page.setContent('<a href="javascript:">Click me</a>');
    const results = await javascriptVoidLinks.run(createRuleContext(page));
    const violations = results.filter((r) => r.type === 'violation');
    expect(violations).toHaveLength(1);
  });

  it('warns on href="#" without role="button"', async () => {
    await page.setContent('<a href="#">Click me</a>');
    const results = await javascriptVoidLinks.run(createRuleContext(page));
    const warnings = results.filter((r) => r.type === 'warning');
    expect(warnings).toHaveLength(1);
  });

  it('passes on href="#" with role="button"', async () => {
    await page.setContent('<a href="#" role="button">Click me</a>');
    const results = await javascriptVoidLinks.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });

  it('returns no results for normal links', async () => {
    await page.setContent('<a href="/about">About</a>');
    const results = await javascriptVoidLinks.run(createRuleContext(page));
    expect(results).toHaveLength(0);
  });
});

// ── scroll-blocked ────────────────────────────────────────────────────

describe('scroll-blocked', () => {
  it('passes when page scrolls normally', async () => {
    await page.setContent('<div style="height: 5000px;">Tall content</div>');
    const results = await scrollBlocked.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });

  it('violates when body has overflow:hidden with overflowing content', async () => {
    await page.setContent('<style>body { overflow: hidden; }</style><div style="height: 5000px;">Tall content</div>');
    const results = await scrollBlocked.run(createRuleContext(page));
    expect(results[0].type).toBe('violation');
    expect(results[0].message).toContain('overflow');
  });

  it('passes when overflow:hidden but no overflowing content', async () => {
    await page.setContent('<style>body { overflow: hidden; }</style><p>Short content</p>');
    const results = await scrollBlocked.run(createRuleContext(page));
    expect(results[0].type).toBe('pass');
  });
});
