import type { Rule, RuleResult } from '../../types.js';

export const marquee: Rule = {
  meta: {
    id: 'marquee',
    name: '<marquee> elements must not be used',
    description: 'Ensures the page does not use the deprecated <marquee> element, which cannot be paused by users.',
    wcagCriteria: ['2.2.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const marquees = await context.querySelectorAll('marquee');

    for (const el of marquees) {
      results.push({
        ruleId: 'marquee',
        type: 'violation',
        message: '<marquee> element is deprecated and not accessible. Use CSS animations with a pause mechanism instead.',
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
