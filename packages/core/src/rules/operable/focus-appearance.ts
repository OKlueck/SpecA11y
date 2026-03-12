import type { Rule, RuleResult } from '../../types.js';

export const focusAppearance: Rule = {
  meta: {
    id: 'focus-appearance',
    name: 'Focus indicators must be clearly visible',
    description: 'Checks that interactive elements have visible focus indicators beyond just outline.',
    wcagCriteria: ['2.4.13'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const focusable = await context.querySelectorAll(
      'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    for (const el of focusable) {
      const visible = await el.isVisible();
      if (!visible) continue;

      const outline = await el.getComputedStyle('outline-style');
      const outlineWidth = await el.getComputedStyle('outline-width');

      if (outline === 'none' || outlineWidth === '0px') {
        results.push({
          ruleId: 'focus-appearance',
          type: 'warning',
          message: 'Element has no outline and may lack a visible focus indicator. Ensure focus is indicated via border, box-shadow, or background change.',
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
