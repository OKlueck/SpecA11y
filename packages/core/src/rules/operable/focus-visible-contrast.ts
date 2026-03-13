import type { Rule, RuleResult } from '../../types.js';
import { parseColor, contrastRatio } from '../../utils/index.js';
import type { RGB } from '../../utils/index.js';

function parseRgbColor(colorStr: string): RGB | null {
  const parsed = parseColor(colorStr);
  if (parsed) return parsed;

  // Handle "rgb(r, g, b)" and "rgba(r, g, b, a)" formats
  const rgbMatch = colorStr.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/,
  );
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  return null;
}

function isTransparentOrNone(color: string): boolean {
  if (color === 'transparent' || color === 'none') return true;
  // Match rgba with alpha 0, e.g. rgba(0, 0, 0, 0) or rgba(255, 255, 255, 0)
  const rgbaMatch = color.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
  if (rgbaMatch && parseFloat(rgbaMatch[1]) === 0) return true;
  return false;
}

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const focusVisibleContrast: Rule = {
  meta: {
    id: 'focus-visible-contrast',
    name: 'Focus indicator should have sufficient contrast',
    description:
      'Checks that focus outline/border color has sufficient contrast against the background, ensuring the focus indicator is actually visible.',
    wcagCriteria: ['2.4.7'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
    tags: ['semantic', 'heuristic'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll(FOCUSABLE_SELECTOR);

    for (const el of elements) {
      const outlineStyle = await el.getComputedStyle('outline-style');
      const outlineWidth = await el.getComputedStyle('outline-width');
      const outlineColor = await el.getComputedStyle('outline-color');
      const bgColor = await el.getComputedStyle('background-color');

      // Skip if no outline (caught by focus-visible rule)
      if (outlineStyle === 'none' || outlineWidth === '0px') continue;

      // Skip transparent outlines
      if (isTransparentOrNone(outlineColor)) {
        results.push({
          ruleId: 'focus-visible-contrast',
          type: 'warning',
          message:
            'Focus outline color is transparent. The focus indicator will not be visible.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
        continue;
      }

      const outlineRgb = parseRgbColor(outlineColor);

      // Determine background: use element bg or fall back to white
      let bgRgb: RGB = { r: 255, g: 255, b: 255 };
      if (bgColor && !isTransparentOrNone(bgColor)) {
        const parsed = parseRgbColor(bgColor);
        if (parsed) bgRgb = parsed;
      }

      if (!outlineRgb) continue;

      const ratio = contrastRatio(outlineRgb, bgRgb);

      const element = {
        selector: el.selector,
        html: await el.getOuterHTML(),
        boundingBox: await el.getBoundingBox(),
      };

      // WCAG 2.4.11 requires 3:1 contrast for focus indicators
      if (ratio < 3) {
        results.push({
          ruleId: 'focus-visible-contrast',
          type: 'warning',
          message: `Focus outline contrast ratio is ${ratio.toFixed(2)}:1 (outline: ${outlineColor}, background: ${bgColor || 'white'}). Minimum recommended is 3:1.`,
          element,
        });
      } else {
        results.push({
          ruleId: 'focus-visible-contrast',
          type: 'pass',
          message: `Focus outline has sufficient contrast (${ratio.toFixed(2)}:1).`,
          element,
        });
      }
    }

    return results;
  },
};
