import type { Rule, RuleResult } from '../../types.js';

export const tabindex: Rule = {
  meta: {
    id: 'tabindex',
    name: 'Elements should not have a positive tabindex',
    description: 'Ensures no element has a tabindex greater than 0, which disrupts the natural focus order.',
    wcagCriteria: ['2.4.3'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[tabindex]');

    for (const el of elements) {
      const value = await el.getAttribute('tabindex');
      const numValue = Number(value);

      if (numValue > 0) {
        results.push({
          ruleId: 'tabindex',
          type: 'violation',
          message: `Element has tabindex="${value}". Positive tabindex values disrupt the natural focus order.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'tabindex',
          type: 'pass',
          message: `Element has tabindex="${value}", which does not disrupt focus order.`,
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
