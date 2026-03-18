---
'@speca11y/core': minor
'@speca11y/cli': minor
---

Improve element identification, reduce false positives, and add real viewport testing

- Enrich element output with CSS selectors, accessible names, and ARIA roles
- Rewrite focus-visible rule with screenshot-based focus indicator detection
- Rewrite reflow rule with real viewport resize to 320px
- Reduce false positives in keyboard-trap, text-spacing, and target-size rules
- Add WCAG 2.5.8 spacing exception and inline-link exception to target-size
- Fix PNG decoder to support RGB format
