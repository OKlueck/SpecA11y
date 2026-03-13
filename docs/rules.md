# Rules (113)

SpecA11y ships with 113 built-in rules across five categories. Rules tagged `semantic, heuristic` use pattern matching and language detection to evaluate content quality; they emit warnings rather than violations.

## Perceivable (48 rules)

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
| `img-alt-quality` | 1.1.1 | dom | semantic, heuristic |
| `video-caption-quality` | 1.2.2 | dom | semantic, heuristic |

## Operable (27 rules)

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
| `link-name-quality` | 2.4.4 | dom | semantic, heuristic |
| `focus-visible-contrast` | 2.4.7 | dom | semantic, heuristic |

## Understandable (19 rules)

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
| `label-quality` | 3.3.2 | dom | semantic, heuristic |
| `lang-mismatch` | 3.1.1 | dom | semantic, heuristic |

## Robust (16 rules)

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

## WCAG 3.0 Draft (3 rules)

| Rule ID | Description | Type |
|---------|-------------|------|
| `text-customization` | Text must remain readable with user style overrides | interactive |
| `reduced-motion-respect` | Animations must respect `prefers-reduced-motion` | interactive |
| `cognitive-load-deceptive` | UI must not use deceptive patterns | dom |

## Rule Types

- **`dom`** — Static analysis of the DOM. Rules run in parallel for speed.
- **`interactive`** — Requires page interaction (screenshots, keyboard simulation, CSS injection). Rules run sequentially to avoid conflicts.
