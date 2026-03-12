import type { Rule, RuleResult } from '../../types.js';
import { parseColor, contrastRatio, getEffectiveBackgroundColor } from '../../utils/color.js';

const TEXT_ELEMENTS = 'p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6, button, div, strong, em, b, i';

export const colorContrast: Rule = {
  meta: {
    id: 'color-contrast',
    name: 'Elements must have sufficient color contrast',
    description: 'Ensures text elements have at least a 4.5:1 contrast ratio (3:1 for large text).',
    wcagCriteria: ['1.4.3'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const elements = await context.querySelectorAll(TEXT_ELEMENTS);

    for (const el of elements) {
      const textContent = await el.getTextContent();
      if (!textContent.trim()) continue;

      const visible = await el.isVisible();
      if (!visible) continue;

      const fgColor = await el.getComputedStyle('color');
      const fontSize = await el.getComputedStyle('font-size');
      const fontWeight = await el.getComputedStyle('font-weight');

      const fg = parseColor(fgColor);
      if (!fg) continue;

      // Use page.locator().evaluate() to walk the DOM tree for effective background color.
      // getEffectiveBackgroundColor is self-contained and runs in the browser.
      const effectiveBg: string | null = await context.page.locator(el.selector).evaluate(
        (target, fnBody) => {
          const fn = new Function('el', fnBody) as (el: Element) => string | null;
          return fn(target);
        },
        `return (${getEffectiveBackgroundColor.toString()})(el);`,
      );

      if (effectiveBg === null) {
        // Background image or gradient present — can't determine contrast
        results.push({
          ruleId: 'color-contrast',
          type: 'incomplete',
          message: 'Unable to determine background color due to background-image (gradient or url).',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
        continue;
      }

      const bg = parseColor(effectiveBg);
      if (!bg) continue;

      const ratio = contrastRatio(fg, bg);

      // Determine if text is "large" per WCAG: >= 18pt or >= 14pt bold
      const sizeInPx = parseFloat(fontSize);
      const sizeInPt = sizeInPx * 0.75;
      const isBold = parseInt(fontWeight) >= 700 || fontWeight === 'bold';
      const isLargeText = sizeInPt >= 18 || (sizeInPt >= 14 && isBold);

      const requiredRatio = isLargeText ? 3 : 4.5;

      if (ratio >= requiredRatio) {
        results.push({
          ruleId: 'color-contrast',
          type: 'pass',
          message: `Contrast ratio ${ratio.toFixed(2)}:1 meets ${requiredRatio}:1 requirement.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'color-contrast',
          type: 'violation',
          message: `Contrast ratio ${ratio.toFixed(2)}:1 is below the ${requiredRatio}:1 requirement for ${isLargeText ? 'large' : 'normal'} text.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
