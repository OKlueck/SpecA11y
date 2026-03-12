# SpecA11y

Automated WCAG accessibility checker powered by [Playwright](https://playwright.dev). Runs 106 rules against live pages with real browser rendering — including visual checks via pixel-level screenshot analysis and interactive checks via keyboard simulation.

## Why SpecA11y?

Traditional accessibility checkers analyze the DOM — a static snapshot of the page. That catches a lot, but some of the most impactful WCAG criteria can only be verified by actually interacting with the page. SpecA11y does both.

Because it builds on Playwright, SpecA11y can do things that DOM-only tools cannot:

- **Detect keyboard traps** by simulating real Tab key presses and tracking where focus goes
- **Verify focus indicators** by taking screenshots before and after focusing an element, then comparing pixels
- **Test text spacing compliance** by injecting the exact CSS overrides WCAG 1.4.12 requires and checking if content gets clipped
- **Validate reflow** by resizing the viewport to 320px and verifying no horizontal scroll appears
- **Measure actual target sizes** using real bounding box geometry, not just CSS values
- **Check motion preferences** by emulating `prefers-reduced-motion` and verifying animations stop

These are checks that affect real users every day — and until now required manual testing.

SpecA11y also covers the full range of DOM-based checks you would expect: ARIA validation, color contrast with parent-chain alpha compositing, accessible name computation per the accName 1.2 spec, landmark structure, form labels, and more. It includes 3 forward-looking WCAG 3.0 draft rules for text customization, reduced motion, and deceptive patterns.

All results export as [SARIF 2.1.0](https://sarifweb.azurewebsites.net/) — ready for GitHub Code Scanning, Azure DevOps, or any SARIF-compatible tool.

## Packages

| Package | Description |
|---------|-------------|
| [`@speca11y/core`](./packages/core) | Rule engine, 106 built-in rules, SARIF + JSON reporting |
| [`@speca11y/cli`](./packages/cli) | Command-line interface with text, JSON, and SARIF output |
| [`n8n-nodes-speca11y`](./packages/n8n-node) | n8n community node for workflow automation |

## Quick Start

```bash
# Install
pnpm add @speca11y/core playwright

# Install Playwright browsers
pnpm exec playwright install chromium
```

### CLI

```bash
pnpm add -g @speca11y/cli

# Check a URL
speca11y https://example.com

# WCAG AAA, SARIF output
speca11y https://example.com --level AAA --format sarif

# Local HTML file
speca11y ./page.html --format json -o report.json
```

### Programmatic API

```typescript
import { check } from '@speca11y/core';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');

const report = await check(page, { level: 'AA' });

console.log(`Violations: ${report.summary.counts.violations}`);
console.log(`Warnings: ${report.summary.counts.warnings}`);

for (const entry of report.entries) {
  for (const result of entry.results) {
    if (result.type === 'violation') {
      console.log(`[${entry.rule.id}] ${result.message}`);
    }
  }
}

await browser.close();
```

### SARIF Reports

```typescript
import { check, buildSarifReport } from '@speca11y/core';

const report = await check(page, { level: 'AA' });
const sarif = buildSarifReport(report);
// Upload to GitHub Code Scanning, Azure DevOps, etc.
```

## Rules (106)

### Perceivable (46 rules)

| Rule ID | Criterion | Type | Tags |
|---------|-----------|------|------|
| `img-alt` | 1.1.1 | dom | |
| `area-alt` | 1.1.1 | dom | |
| `input-image-alt` | 1.1.1 | dom | |
| `object-alt` | 1.1.1 | dom | |
| `svg-img-alt` | 1.1.1 | dom | |
| `video-caption` | 1.2.2 | dom | |
| `heading-order` | 1.3.1 | dom | |
| `list-structure` | 1.3.1 | dom | |
| `td-headers-attr` | 1.3.1 | dom | |
| `landmark-main` | 1.3.1 | dom | |
| `landmark-banner-top-level` | 1.3.1 | dom | |
| `landmark-contentinfo-top-level` | 1.3.1 | dom | |
| `landmark-complementary-top-level` | 1.3.1 | dom | |
| `landmark-unique` | 1.3.1 | dom | |
| `landmark-no-duplicate-banner` | — | dom | best-practice |
| `landmark-no-duplicate-contentinfo` | — | dom | best-practice |
| `page-has-heading-one` | 1.3.1 | dom | |
| `scope-attr-valid` | 1.3.1 | dom | |
| `th-has-data-cells` | 1.3.1 | dom | |
| `td-has-header` | 1.3.1 | dom | experimental |
| `definition-list` | 1.3.1 | dom | |
| `dlitem` | 1.3.1 | dom | |
| `table-has-header` | 1.3.1 | dom | |
| `table-duplicate-name` | 1.3.1 | dom | |
| `table-fake-caption` | 1.3.1 | dom | experimental |
| `empty-heading` | — | dom | best-practice |
| `empty-table-header` | — | dom | best-practice |
| `image-redundant-alt` | — | dom | best-practice |
| `region` | — | dom | best-practice |
| `meaningful-sequence` | 1.3.2 | dom | |
| `sensory-characteristics` | 1.3.3 | dom | |
| `css-orientation-lock` | 1.3.4 | dom | experimental |
| `autocomplete-valid` | 1.3.5 | dom | |
| `use-of-color` | 1.4.1 | dom | |
| `link-in-text-block` | 1.4.1 | dom | best-practice |
| `no-autoplay-audio` | 1.4.2 | dom | |
| `color-contrast` | 1.4.3 | dom | |
| `meta-viewport` | 1.4.4 | dom | |
| `meta-viewport-large` | — | dom | best-practice |
| `images-of-text` | 1.4.5 | dom | |
| `reflow` | 1.4.10 | interactive | |
| `non-text-contrast` | 1.4.11 | interactive | |
| `text-spacing` | 1.4.12 | interactive | |
| `content-on-hover-focus` | 1.4.13 | dom | |
| `hidden-content` | — | dom | experimental |
| `p-as-heading` | 1.3.1 | dom | experimental |

### Operable (25 rules)

| Rule ID | Criterion | Type | Tags |
|---------|-----------|------|------|
| `tabindex` | 2.1.1 | dom | |
| `accesskeys` | 2.1.1 | dom | |
| `server-side-image-map` | 2.1.1 | dom | |
| `no-keyboard-trap` | 2.1.2 | interactive | |
| `character-key-shortcuts` | 2.1.4 | dom | |
| `meta-refresh` | 2.2.1 | dom | |
| `timing-adjustable` | 2.2.1 | dom | |
| `marquee` | 2.2.2 | dom | |
| `blink` | 2.2.2 | dom | |
| `bypass` | 2.4.1 | dom | |
| `frame-title` | 2.4.1 | dom | |
| `skip-link` | 2.4.1 | dom | |
| `document-title` | 2.4.2 | dom | |
| `focus-order` | 2.4.3 | interactive | |
| `link-name` | 2.4.4 | dom | |
| `multiple-ways` | 2.4.5 | dom | |
| `focus-visible` | 2.4.7 | interactive | |
| `focus-not-obscured` | 2.4.11 | interactive | |
| `focus-appearance` | 2.4.13 | interactive | |
| `pointer-cancellation` | 2.5.2 | dom | |
| `dragging-movements` | 2.5.7 | dom | |
| `target-size` | 2.5.8 | interactive | |
| `nested-interactive` | 4.1.2 | dom | |
| `scrollable-region-focusable` | 2.1.1 | dom | best-practice |
| `no-empty-links` | 2.4.4 | dom | best-practice |

### Understandable (17 rules)

| Rule ID | Criterion | Type | Tags |
|---------|-----------|------|------|
| `html-has-lang` | 3.1.1 | dom | |
| `valid-lang` | 3.1.2 | dom | |
| `on-focus` | 3.2.1 | dom | |
| `consistent-navigation` | 3.2.3 | dom | |
| `consistent-identification` | 3.2.4 | dom | |
| `consistent-help` | 3.2.6 | dom | |
| `error-identification` | 3.3.1 | dom | |
| `label` | 3.3.2 | dom | |
| `select-name` | 3.3.2 | dom | |
| `button-name` | 3.3.2 | dom | |
| `form-field-multiple-labels` | 3.3.2 | dom | |
| `error-suggestion` | 3.3.3 | dom | |
| `error-prevention` | 3.3.4 | dom | |
| `redundant-entry` | 3.3.7 | dom | |
| `accessible-auth` | 3.3.8 | dom | |
| `label-title-only` | — | dom | best-practice |
| `label-content-name-mismatch` | 2.5.3 | dom | experimental |

### Robust (16 rules)

| Rule ID | Criterion | Type | Tags |
|---------|-----------|------|------|
| `duplicate-id` | 4.1.1 | dom | |
| `aria-allowed-attr` | 4.1.2 | dom | |
| `aria-required-attr` | 4.1.2 | dom | |
| `aria-valid-attr` | 4.1.2 | dom | |
| `aria-valid-attr-value` | 4.1.2 | dom | |
| `aria-roles` | 4.1.2 | dom | |
| `aria-hidden-body` | 4.1.2 | dom | |
| `aria-required-children` | 1.3.1 | dom | |
| `aria-required-parent` | 1.3.1 | dom | |
| `aria-input-field-name` | 4.1.2 | dom | |
| `aria-toggle-field-name` | 4.1.2 | dom | |
| `aria-allowed-role` | — | dom | best-practice |
| `aria-dialog-name` | — | dom | best-practice |
| `aria-text` | — | dom | best-practice |
| `aria-treeitem-name` | — | dom | best-practice |
| `presentation-role-conflict` | — | dom | best-practice |

### WCAG 3.0 Draft (3 rules)

| Rule ID | Description | Type |
|---------|-------------|------|
| `text-customization` | Text must remain readable with user style overrides | interactive |
| `reduced-motion-respect` | Animations must respect `prefers-reduced-motion` | interactive |
| `cognitive-load-deceptive` | UI must not use deceptive patterns | dom |

## Key Features

### Interactive Testing
Most accessibility tools only read the DOM. SpecA11y goes further — it drives the browser like a real user:

| What | How | WCAG |
|------|-----|------|
| Keyboard trap detection | Simulates Tab key presses, tracks focus movement | 2.1.2 |
| Focus indicator visibility | Screenshot diff before/after focus | 2.4.7, 2.4.11, 2.4.13 |
| Text spacing overflow | Injects WCAG 1.4.12 CSS overrides, checks for clipping | 1.4.12 |
| Reflow at 320px | Resizes viewport, checks for horizontal scrollbars | 1.4.10 |
| Target size measurement | Measures actual bounding boxes | 2.5.8 |
| Non-text contrast | Compares focus/unfocus screenshots for UI components | 1.4.11 |
| Reduced motion | Emulates `prefers-reduced-motion`, verifies animations stop | WCAG 3.0 |

### Accurate Color Contrast
Color contrast checks traverse the full parent chain and alpha-composite semi-transparent backgrounds — not just the element's own `background-color`. Reports `incomplete` when background images prevent reliable calculation.

### Full Accessible Name Computation
Implements the complete [accName 1.2 specification](https://www.w3.org/TR/accname-1.2/) including `aria-labelledby` traversal (with cycle detection), embedded control values, CSS `::before`/`::after` pseudo-element content, and name-from-contents for all applicable ARIA roles.

### WCAG 3.0 Draft Rules
Three forward-looking rules for the next generation of accessibility guidelines: text customization resilience, reduced motion respect, and deceptive pattern detection.

### iFrame Support
DOM rules automatically run inside iframes, with results prefixed to indicate their frame origin.

### Scoped Checks
Use `include`/`exclude` selectors to limit checks to specific page areas or skip third-party widgets you don't control.

### Performance
DOM rules run in parallel with a shared caching layer that deduplicates identical queries across rules. Interactive rules run sequentially to avoid visual conflicts.

## Rule Types

- **`dom`** — Static analysis of the DOM. Rules run in parallel for speed.
- **`interactive`** — Requires page interaction (screenshots, keyboard simulation, CSS injection). Rules run sequentially to avoid conflicts.

## Configuration

```typescript
const report = await check(page, {
  level: 'AA',              // 'A' | 'AA' | 'AAA'
  includePasses: false,      // include passing results
  disableRules: ['color-contrast'],  // skip specific rules
  ruleTimeout: 10000,        // per-rule timeout in ms
  versions: ['2.0', '2.1', '2.2'],  // WCAG versions
  include: ['#main-content'],        // only check within these selectors
  exclude: ['.third-party-widget'],  // skip these areas
});
```

## Output Formats

### Text (CLI default)
Human-readable terminal output with colors.

### JSON
Full report as structured JSON — suitable for programmatic consumption.

### SARIF
[SARIF 2.1.0](https://sarifweb.azurewebsites.net/) format — integrates with GitHub Code Scanning, Azure DevOps, VS Code SARIF Viewer, and other tools.

## Development

```bash
# Prerequisites
pnpm install
pnpm exec playwright install chromium

# Build all packages
pnpm build

# Run tests
pnpm test

# Build + test a single package
pnpm --filter @speca11y/core build
pnpm --filter @speca11y/core test
```

## Project Structure

```
packages/
  core/          # Rule engine + 106 built-in rules
    src/
      rules/
        perceivable/    # WCAG Principle 1 (46 rules)
        operable/       # WCAG Principle 2 (25 rules)
        understandable/ # WCAG Principle 3 (17 rules)
        robust/         # WCAG Principle 4 (16 rules)
        wcag3/          # WCAG 3.0 draft rules (3 rules)
      utils/            # Color, DOM, ARIA, CSS, visual, accname utilities
  cli/           # Command-line interface
  n8n-node/      # n8n community node
```

## License

[MIT](./LICENSE)
