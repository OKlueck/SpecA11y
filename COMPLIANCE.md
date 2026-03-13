# WCAG Compliance Map

This document tracks the implementation status of WCAG criteria within **SpecA11y**.

## Status Legend
- ✅ **Implemented**: Fully or partially automated check available.
- ❌ **Not automatable**: Requires manual testing (e.g., subjective quality of alt text, live captions).
- 🧪 **Experimental**: Implementation exists but is based on draft specifications (e.g., WCAG 3.0).

---

## WCAG 2.0 / 2.1 / 2.2 Implementation Status

### 1. Perceivable

| Criterion | Name | Level | Status | Rules |
|:---|:---|:---:|:---:|:---|
| 1.1.1 | Non-text Content | A | ✅ | `img-alt`, `area-alt`, `input-image-alt`, `object-alt`, `svg-img-alt` |
| 1.2.1 | Audio-only and Video-only | A | ❌ | Requires manual review of media content. |
| 1.2.2 | Captions (Prerecorded) | A | ✅ | `video-caption` |
| 1.2.3 | Audio Description | A | ❌ | Requires manual review of media content. |
| 1.2.4 | Captions (Live) | AA | ❌ | Requires manual review. |
| 1.2.5 | Audio Description (Prerecorded) | AA | ❌ | Requires manual review of media content. |
| 1.3.1 | Info and Relationships | A | ✅ | `heading-order`, `list-structure`, `td-headers-attr`, `landmark-main`, `landmark-banner-top-level`, `landmark-contentinfo-top-level`, `landmark-complementary-top-level`, `landmark-unique`, `page-has-heading-one`, `scope-attr-valid`, `th-has-data-cells`, `td-has-header`, `definition-list`, `dlitem`, `table-has-header`, `table-duplicate-name`, `table-fake-caption`, `p-as-heading`, `aria-required-children`, `aria-required-parent` |
| 1.3.2 | Meaningful Sequence | A | ✅ | `meaningful-sequence` |
| 1.3.3 | Sensory Characteristics | A | ✅ | `sensory-characteristics` |
| 1.3.4 | Orientation | AA | ✅ | `css-orientation-lock` |
| 1.3.5 | Identify Input Purpose | AA | ✅ | `autocomplete-valid` |
| 1.4.1 | Use of Color | A | ✅ | `use-of-color`, `link-in-text-block` |
| 1.4.2 | Audio Control | A | ✅ | `no-autoplay-audio` |
| 1.4.3 | Contrast (Minimum) | AA | ✅ | `color-contrast` (with parent-chain alpha compositing) |
| 1.4.4 | Resize Text | AA | ✅ | `meta-viewport` |
| 1.4.5 | Images of Text | AA | ✅ | `images-of-text` |
| 1.4.10 | Reflow | AA | ✅ | `reflow` (interactive — resizes viewport to 320px) |
| 1.4.11 | Non-text Contrast | AA | ✅ | `non-text-contrast` (interactive — screenshot comparison) |
| 1.4.12 | Text Spacing | AA | ✅ | `text-spacing` (interactive — injects WCAG CSS overrides) |
| 1.4.13 | Content on Hover or Focus | AA | ✅ | `content-on-hover-focus` |

### 2. Operable

| Criterion | Name | Level | Status | Rules |
|:---|:---|:---:|:---:|:---|
| 2.1.1 | Keyboard | A | ✅ | `tabindex`, `accesskeys`, `server-side-image-map`, `scrollable-region-focusable` |
| 2.1.2 | No Keyboard Trap | A | ✅ | `no-keyboard-trap` (interactive — simulates Tab navigation) |
| 2.1.4 | Character Key Shortcuts | A | ✅ | `character-key-shortcuts` |
| 2.2.1 | Timing Adjustable | A | ✅ | `meta-refresh`, `timing-adjustable` |
| 2.2.2 | Pause, Stop, Hide | A | ✅ | `marquee`, `blink` |
| 2.3.1 | Three Flashes | A | ❌ | Requires temporal analysis of screen recordings. |
| 2.4.1 | Bypass Blocks | A | ✅ | `bypass`, `frame-title`, `skip-link` |
| 2.4.2 | Page Titled | A | ✅ | `document-title` |
| 2.4.3 | Focus Order | A | ✅ | `focus-order` (interactive — tracks focus sequence) |
| 2.4.4 | Link Purpose (In Context) | A | ✅ | `link-name`, `no-empty-links` |
| 2.4.5 | Multiple Ways | AA | ✅ | `multiple-ways` |
| 2.4.6 | Headings and Labels | AA | ✅ | `empty-heading`, `empty-table-header` |
| 2.4.7 | Focus Visible | AA | ✅ | `focus-visible` (interactive — screenshot diff) |
| 2.4.11 | Focus Not Obscured (Minimum) | AA | ✅ | `focus-not-obscured` (interactive) — **WCAG 2.2** |
| 2.4.13 | Focus Appearance | AAA | ✅ | `focus-appearance` (interactive) — **WCAG 2.2** |
| 2.5.1 | Pointer Gestures | A | ❌ | Requires manual review of gesture-based interactions. |
| 2.5.2 | Pointer Cancellation | A | ✅ | `pointer-cancellation` |
| 2.5.3 | Label in Name | A | ✅ | `label-content-name-mismatch` |
| 2.5.4 | Motion Actuation | A | ❌ | Requires manual review of motion-based interactions. |
| 2.5.7 | Dragging Movements | AA | ✅ | `dragging-movements` — **WCAG 2.2** |
| 2.5.8 | Target Size (Minimum) | AA | ✅ | `target-size` (interactive — bounding box measurement) — **WCAG 2.2** |

### 3. Understandable

| Criterion | Name | Level | Status | Rules |
|:---|:---|:---:|:---:|:---|
| 3.1.1 | Language of Page | A | ✅ | `html-has-lang` |
| 3.1.2 | Language of Parts | AA | ✅ | `valid-lang` |
| 3.2.1 | On Focus | A | ✅ | `on-focus` |
| 3.2.2 | On Input | A | ❌ | Requires monitoring runtime behavior during input changes. |
| 3.2.3 | Consistent Navigation | AA | ✅ | `consistent-navigation` |
| 3.2.4 | Consistent Identification | AA | ✅ | `consistent-identification` |
| 3.2.6 | Consistent Help | A | ✅ | `consistent-help` — **WCAG 2.2** |
| 3.3.1 | Error Identification | A | ✅ | `error-identification` |
| 3.3.2 | Labels or Instructions | A | ✅ | `label`, `select-name`, `button-name`, `form-field-multiple-labels` |
| 3.3.3 | Error Suggestion | AA | ✅ | `error-suggestion` |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | AA | ✅ | `error-prevention` |
| 3.3.7 | Redundant Entry | A | ✅ | `redundant-entry` — **WCAG 2.2** |
| 3.3.8 | Accessible Authentication (Minimum) | AA | ✅ | `accessible-auth` — **WCAG 2.2** |

### 4. Robust

| Criterion | Name | Level | Status | Rules |
|:---|:---|:---:|:---:|:---|
| 4.1.1 | Parsing | A | ✅ | `duplicate-id` (obsolete in WCAG 2.2 but still checked) |
| 4.1.2 | Name, Role, Value | A | ✅ | `aria-allowed-attr`, `aria-required-attr`, `aria-valid-attr`, `aria-valid-attr-value`, `aria-roles`, `aria-hidden-body`, `aria-input-field-name`, `aria-toggle-field-name`, `nested-interactive` |
| 4.1.3 | Status Messages | AA | ❌ | Requires monitoring live region updates at runtime. |

### Best-Practice Rules (no WCAG criterion)

These rules go beyond WCAG requirements but catch common accessibility issues:

| Rule | Category |
|:---|:---|
| `landmark-no-duplicate-banner` | Perceivable |
| `landmark-no-duplicate-contentinfo` | Perceivable |
| `empty-heading` | Perceivable |
| `empty-table-header` | Perceivable |
| `image-redundant-alt` | Perceivable |
| `region` | Perceivable |
| `meta-viewport-large` | Perceivable |
| `link-in-text-block` | Perceivable |
| `scrollable-region-focusable` | Operable |
| `no-empty-links` | Operable |
| `label-title-only` | Understandable |
| `aria-allowed-role` | Robust |
| `aria-dialog-name` | Robust |
| `aria-text` | Robust |
| `aria-treeitem-name` | Robust |
| `presentation-role-conflict` | Robust |

### Semantic Heuristic Rules

These rules go beyond structural checks to evaluate **content quality** using heuristics:

| Rule | WCAG | Description | Type |
|:---|:---|:---|:---|
| `img-alt-quality` | 1.1.1 | Detects generic, file-name-based, or suspiciously short/long alt text | dom |
| `link-name-quality` | 2.4.4 | Detects generic link text like "click here", "more", "weiterlesen" | dom |
| `label-quality` | 3.3.2 | Detects generic form labels like "field", "input", "Eingabe" | dom |
| `lang-mismatch` | 3.1.1 | Detects mismatch between declared `lang` attribute and actual page content language | dom |
| `focus-visible-contrast` | 2.4.7 | Checks that focus outline color has sufficient contrast against background | dom |
| `video-caption-quality` | 1.2.2 | Checks that caption track files actually contain cues (not empty) | dom |

---

## WCAG 3.0 Draft (Experimental)

| Rule | Description | Type |
|:---|:---|:---|
| `text-customization` 🧪 | Text must remain readable with user style overrides | interactive |
| `reduced-motion-respect` 🧪 | Animations must respect `prefers-reduced-motion` | interactive |
| `cognitive-load-deceptive` 🧪 | UI must not use deceptive patterns | dom |

---

## Summary

| | Implemented | Not automatable | Total |
|:---|:---:|:---:|:---:|
| Perceivable | 16/19 | 3 | 19 |
| Operable | 17/20 | 3 | 20 |
| Understandable | 12/13 | 1 | 13 |
| Robust | 2/3 | 1 | 3 |
| **Total** | **47/55** | **8** | **55** |

The 8 criteria without automated checks all require manual human judgement (e.g., quality of audio descriptions, live captions, gesture alternatives, motion actuation). These cannot be reliably automated.

Additionally, 6 **semantic heuristic rules** extend coverage by evaluating content quality for criteria that were previously only structurally checked (1.1.1, 1.2.2, 2.4.4, 2.4.7, 3.1.1, 3.3.2).

For the full list of all 113 rules, see the [rule reference](./docs/rules.md). For LLM-powered enrichment of heuristic warnings, see [`@speca11y/semantic`](./packages/semantic).
