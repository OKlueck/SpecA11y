# @speca11y/cli

## 0.5.2

### Patch Changes

- [#24](https://github.com/OKlueck/SpecA11y/pull/24) [`08fc542`](https://github.com/OKlueck/SpecA11y/commit/08fc542cfc4c46717c295f14ca24f1f5028ed0f8) Thanks [@OKlueck](https://github.com/OKlueck)! - Fix AFK issue slices for workspace linting, rule filtering, SARIF metadata, include-scoped enrichment, CLI option validation, and n8n browser lifecycle handling.

- Updated dependencies [[`08fc542`](https://github.com/OKlueck/SpecA11y/commit/08fc542cfc4c46717c295f14ca24f1f5028ed0f8)]:
  - @speca11y/core@0.5.2
  - @speca11y/semantic@0.2.6

## 0.5.1

### Patch Changes

- [#17](https://github.com/OKlueck/SpecA11y/pull/17) [`9bbfb39`](https://github.com/OKlueck/SpecA11y/commit/9bbfb398fab95f7df4c59cb505e1a2644acc2318) Thanks [@OKlueck](https://github.com/OKlueck)! - Fix AFK issue slices for workspace linting, rule filtering, SARIF metadata, include-scoped enrichment, CLI option validation, and n8n browser lifecycle handling.

- Updated dependencies [[`9bbfb39`](https://github.com/OKlueck/SpecA11y/commit/9bbfb398fab95f7df4c59cb505e1a2644acc2318)]:
  - @speca11y/core@0.5.1
  - @speca11y/semantic@0.2.5

## 0.5.0

### Minor Changes

- [`0b3b14d`](https://github.com/OKlueck/SpecA11y/commit/0b3b14d463ed3df203583c9aa57c371e5b7c1c61) - Improve element identification, reduce false positives, and add real viewport testing

  - Enrich element output with CSS selectors, accessible names, and ARIA roles
  - Rewrite focus-visible rule with screenshot-based focus indicator detection
  - Rewrite reflow rule with real viewport resize to 320px
  - Reduce false positives in keyboard-trap, text-spacing, and target-size rules
  - Add WCAG 2.5.8 spacing exception and inline-link exception to target-size
  - Fix PNG decoder to support RGB format

### Patch Changes

- Updated dependencies [[`0b3b14d`](https://github.com/OKlueck/SpecA11y/commit/0b3b14d463ed3df203583c9aa57c371e5b7c1c61)]:
  - @speca11y/core@0.4.0
  - @speca11y/semantic@0.2.3

## 0.3.1

### Patch Changes

- Updated dependencies [[`8701e35`](https://github.com/OKlueck/SpecA11y/commit/8701e35ef05859be1b041998bf1ac6014a4a1b4d)]:
  - @speca11y/core@0.3.1
  - @speca11y/semantic@0.2.2

## 0.3.0

### Minor Changes

- [`3d2261f`](https://github.com/OKlueck/SpecA11y/commit/3d2261f27e1eec2fe27e72025db37e89e534b483) - Add 11 deception-detection rules (fake urgency timers, disguised ads, hidden costs, misleading buttons, bait-and-switch, trick questions, forced continuity, friend spam, confirmshaming, obstruction, sneaking) and improve contrast-ratio and alt-text checks

### Patch Changes

- Updated dependencies [[`3d2261f`](https://github.com/OKlueck/SpecA11y/commit/3d2261f27e1eec2fe27e72025db37e89e534b483)]:
  - @speca11y/core@0.3.0
  - @speca11y/semantic@0.2.1

## 0.2.1

### Patch Changes

- Updated dependencies [[`f2980ab`](https://github.com/OKlueck/SpecA11y/commit/f2980ab50a16dfdb071064f2514da55584a8f63d)]:
  - @speca11y/semantic@0.2.0

## 0.2.0

### Minor Changes

- [`f1e4491`](https://github.com/OKlueck/SpecA11y/commit/f1e4491049828b839d9eee45ca19c537e16f6202) - Add 6 semantic heuristic rules for content quality checks: img-alt-quality, link-name-quality, label-quality, lang-mismatch, focus-visible-contrast, video-caption-quality

### Patch Changes

- Updated dependencies [[`f1e4491`](https://github.com/OKlueck/SpecA11y/commit/f1e4491049828b839d9eee45ca19c537e16f6202)]:
  - @speca11y/core@0.2.0
