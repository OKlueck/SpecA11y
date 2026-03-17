import type { Rule, RuleResult } from '../../types.js';

export const focusVisible: Rule = {
  meta: {
    id: 'focus-visible',
    name: 'Focusable elements should have visible focus indicators',
    description: 'Checks that focusable elements do not suppress focus outlines without providing an alternative focus style.',
    wcagCriteria: ['2.4.7'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const suppressed: RuleResult[] = [];
    const selector = 'a[href], button, input, select, textarea, [tabindex]';
    const elements = await context.querySelectorAll(selector);

    for (const el of elements) {
      const outline = await el.getComputedStyle('outline-style');
      const outlineWidth = await el.getComputedStyle('outline-width');

      const outlineSuppressed =
        outline === 'none' ||
        outlineWidth === '0px';

      if (outlineSuppressed) {
        suppressed.push({
          ruleId: 'focus-visible',
          type: 'warning',
          message: 'Element has outline suppressed (outline: none or 0px). Ensure an alternative focus indicator is provided.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'focus-visible',
          type: 'pass',
          message: 'Element has a visible outline style.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    // Escalate to violation if majority of focusable elements have outline suppressed
    const threshold = Math.max(3, Math.floor(elements.length * 0.5));
    if (suppressed.length >= threshold) {
      for (const result of suppressed) {
        results.push({
          ...result,
          type: 'violation',
          message:
            `Element has outline suppressed (outline: none or 0px). ` +
            `${suppressed.length} of ${elements.length} focusable elements have focus indicators removed, ` +
            `indicating systematic suppression of focus visibility.`,
        });
      }
    } else {
      results.push(...suppressed);
    }

    return results;
  },
};
