# @speca11y/core

Core rule engine for [SpecA11y](../../README.md) — an automated WCAG accessibility checker powered by Playwright. Goes beyond static DOM analysis with interactive checks: keyboard trap detection, focus indicator verification via screenshot diffs, text spacing injection, viewport reflow testing, and real target size measurement.

## Installation

```bash
pnpm add @speca11y/core playwright
pnpm exec playwright install chromium
```

## Usage

```typescript
import { check } from '@speca11y/core';
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');

const report = await check(page, { level: 'AA' });

for (const entry of report.entries) {
  for (const result of entry.results) {
    console.log(`[${result.type}] ${entry.rule.id}: ${result.message}`);
  }
}

await browser.close();
```

## API

### `check(page, config?): Promise<Report>`

Runs all registered rules against a Playwright `Page`.

**Config options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `level` | `'A' \| 'AA' \| 'AAA'` | `'AA'` | WCAG conformance level |
| `versions` | `WcagVersion[]` | `['2.0','2.1','2.2']` | WCAG versions to include |
| `includePasses` | `boolean` | `false` | Include passing results |
| `disableRules` | `string[]` | `undefined` | Rule IDs to skip |
| `enableRules` | `string[]` | `undefined` | Rule IDs to force-enable |
| `ruleTimeout` | `number` | `10000` | Per-rule timeout (ms) |
| `include` | `string[]` | `undefined` | CSS selectors to scope checks to |
| `exclude` | `string[]` | `undefined` | CSS selectors to skip |

### `buildSarifReport(report): SarifLog`

Converts a `Report` into SARIF 2.1.0 format.

### `buildReport(entries, page, duration): Report`

Low-level report builder.

### `registerRule(rule) / getRule(id) / getAllRules() / filterRules(config)`

Rule registry management.

### `createRuleContext(page): RuleContext`

Creates a rule execution context from a Playwright `Page`.

## 106 Built-in Rules

- **46 Perceivable** — image alt text, color contrast, text spacing, reflow, landmarks, tables, lists, orientation, etc.
- **25 Operable** — keyboard traps, focus indicators, target size, skip links, scrollable regions, etc.
- **17 Understandable** — labels, language, error handling, consistent UI, label-content matching, etc.
- **16 Robust** — ARIA attributes, roles, required children/parents, dialog names, field names, etc.
- **3 WCAG 3.0 Draft** — text customization, reduced motion, deceptive patterns

See the [full rule list](../../README.md#rules-106) in the root README.

## License

[MIT](../../LICENSE)
