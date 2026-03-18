import type { Rule, RuleResult } from '../../types.js';

export const hiddenAttributeOverride: Rule = {
  meta: {
    id: 'hidden-attribute-override',
    name: 'HTML hidden attribute must not be overridden by CSS',
    description:
      'Detects elements with the HTML hidden attribute whose computed display is not "none", meaning CSS is overriding the semantic hidden state.',
    wcagCriteria: ['1.3.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[hidden]');

    for (const el of elements) {
      const display = await el.getComputedStyle('display');

      if (display !== 'none') {
        results.push({
          ruleId: 'hidden-attribute-override',
          type: 'violation',
          message:
            `Element has the HTML hidden attribute but its computed display is "${display}". ` +
            `CSS is overriding the semantic hidden state, creating a mismatch between DOM semantics and visual presentation.`,
          element: el.toTarget(await el.getOuterHTML(), await el.getBoundingBox()),
        });
      } else {
        results.push({
          ruleId: 'hidden-attribute-override',
          type: 'pass',
          message: 'Element with hidden attribute is correctly hidden (display: none).',
          element: el.toTarget(await el.getOuterHTML(), await el.getBoundingBox()),
        });
      }
    }

    return results;
  },
};
