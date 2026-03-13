# SpecA11y

Automated WCAG accessibility checker powered by [Playwright](https://playwright.dev). Runs 113 rules against live pages with real browser rendering — including visual checks via pixel-level screenshot analysis, interactive checks via keyboard simulation, and semantic heuristics for content quality.

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

## Packages

| Package | Description |
|---------|-------------|
| [`@speca11y/core`](./packages/core) | Rule engine, 113 built-in rules, SARIF + JSON reporting |
| [`@speca11y/semantic`](./packages/semantic) | LLM-powered semantic quality analysis (Anthropic, OpenAI, Ollama) |
| [`@speca11y/cli`](./packages/cli) | Command-line interface with text, JSON, and SARIF output |
| [`n8n-nodes-speca11y`](./packages/n8n-node) | n8n community node for workflow automation |

## Quick Start

```bash
# Install
pnpm add @speca11y/core playwright
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

### LLM Semantic Analysis

Enrich reports with AI-powered content quality assessment using `@speca11y/semantic`:

```bash
# CLI — uses ANTHROPIC_API_KEY env var
speca11y https://example.com --semantic --format json

# With OpenAI
speca11y https://example.com --semantic --llm-provider openai

# With local Ollama (no API key needed)
speca11y https://example.com --semantic --llm-provider ollama
```

```typescript
import { check } from '@speca11y/core';
import { enrich } from '@speca11y/semantic';

const report = await check(page, { level: 'AA' });
const enriched = await enrich(report, {
  provider: { provider: 'anthropic' },
  page, // optional — enables element screenshots for vision models
});

// Each flagged result now has a semantic annotation:
// { verdict: 'good' | 'poor' | 'unclear', confidence, explanation, suggestion }
```

Supports **Anthropic Claude**, **OpenAI**, and **Ollama** (local). LLM SDKs are optional peer dependencies — install only what you need.

## Rules (113)

SpecA11y covers all four WCAG principles plus forward-looking WCAG 3.0 draft rules:

| Category | Rules | Examples |
|----------|-------|---------|
| **Perceivable** | 48 | Image alt text, color contrast, text spacing, reflow, landmarks, tables |
| **Operable** | 27 | Keyboard traps, focus indicators, target size, skip links |
| **Understandable** | 19 | Labels, language, error handling, consistent UI |
| **Robust** | 16 | ARIA attributes, roles, required children/parents, dialog names |
| **WCAG 3.0 Draft** | 3 | Text customization, reduced motion, deceptive patterns |

See the [full rule reference](./docs/rules.md) for all rules with WCAG criteria mappings and tags.

## Key Features

### Interactive Testing

Most accessibility tools only read the DOM. SpecA11y drives the browser like a real user:

| What | How | WCAG |
|------|-----|------|
| Keyboard trap detection | Simulates Tab key presses, tracks focus movement | 2.1.2 |
| Focus indicator visibility | Screenshot diff before/after focus | 2.4.7, 2.4.11, 2.4.13 |
| Text spacing overflow | Injects WCAG 1.4.12 CSS overrides, checks for clipping | 1.4.12 |
| Reflow at 320px | Resizes viewport, checks for horizontal scrollbars | 1.4.10 |
| Target size measurement | Measures actual bounding boxes | 2.5.8 |
| Non-text contrast | Compares focus/unfocus screenshots for UI components | 1.4.11 |
| Reduced motion | Emulates `prefers-reduced-motion`, verifies animations stop | WCAG 3.0 |

### Semantic Heuristics

Most tools only check if an alt text *exists* — SpecA11y also checks if it's *meaningful*. Six heuristic rules go beyond structural validation:

| What | How | WCAG |
|------|-----|------|
| Alt text quality | Blacklist of generic terms ("image", "bild"), file name detection, length checks | 1.1.1 |
| Link text quality | Detects vague link text ("click here", "mehr", "weiterlesen") | 2.4.4 |
| Label quality | Detects generic form labels ("field", "input", "Eingabe") | 3.3.2 |
| Language mismatch | Trigram-based detection (9 languages) vs. declared `lang` attribute | 3.1.1 |
| Focus indicator contrast | Checks outline color contrast against background (min. 3:1) | 2.4.7 |
| Caption file content | Verifies VTT/SRT files contain actual cues, not empty shells | 1.2.2 |

These rules emit **warnings** (not violations), since heuristic detection is not 100% certain.

### Accurate Color Contrast

Color contrast checks traverse the full parent chain and alpha-composite semi-transparent backgrounds — not just the element's own `background-color`. Reports `incomplete` when background images prevent reliable calculation.

### Full Accessible Name Computation

Implements the complete [accName 1.2 specification](https://www.w3.org/TR/accname-1.2/) including `aria-labelledby` traversal (with cycle detection), embedded control values, CSS `::before`/`::after` pseudo-element content, and name-from-contents for all applicable ARIA roles.

### SARIF Reports

All results export as [SARIF 2.1.0](https://sarifweb.azurewebsites.net/) — ready for GitHub Code Scanning, Azure DevOps, or any SARIF-compatible tool.

```typescript
import { check, buildSarifReport } from '@speca11y/core';

const report = await check(page, { level: 'AA' });
const sarif = buildSarifReport(report);
```

### Scoped Checks

Use `include`/`exclude` selectors to limit checks to specific page areas or skip third-party widgets you don't control.

## Configuration

```typescript
const report = await check(page, {
  level: 'AA',                         // 'A' | 'AA' | 'AAA'
  includePasses: false,                 // include passing results
  disableRules: ['color-contrast'],     // skip specific rules
  enableRules: ['hidden-content'],      // force-enable specific rules
  ruleTimeout: 10000,                   // per-rule timeout in ms
  versions: ['2.0', '2.1', '2.2'],     // WCAG versions
  include: ['#main-content'],           // only check within these selectors
  exclude: ['.third-party-widget'],     // skip these areas
});
```

## Development

```bash
pnpm install
pnpm exec playwright install chromium
pnpm build
pnpm test
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on adding rules and project conventions.

## License

[MIT](./LICENSE)
