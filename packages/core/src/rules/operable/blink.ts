import type { Rule, RuleResult } from '../../types.js';

export const blink: Rule = {
  meta: {
    id: 'blink',
    name: '<blink> elements must not be used',
    description: 'Ensures the page does not use the deprecated <blink> element, which users cannot stop.',
    wcagCriteria: ['2.2.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const blinks = await context.querySelectorAll('blink');

    for (const el of blinks) {
      results.push({
        ruleId: 'blink',
        type: 'violation',
        message: '<blink> element is deprecated and not accessible. Content must not blink without a mechanism to stop it.',
        element: {
          selector: el.selector,
          html: await el.getOuterHTML(),
          boundingBox: await el.getBoundingBox(),
        },
      });
    }

    return results;
  },
};
