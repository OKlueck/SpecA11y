import type { Rule, RuleResult } from '../../types.js';

export const linkName: Rule = {
  meta: {
    id: 'link-name',
    name: 'Links must have discernible text',
    description: 'Ensures every <a> element has accessible text that describes its purpose.',
    wcagCriteria: ['2.4.4'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const links = await context.querySelectorAll('a[href]');

    for (const link of links) {
      const name = await link.getAccessibleName();

      if (name.trim()) {
        results.push({
          ruleId: 'link-name',
          type: 'pass',
          message: 'Link has accessible name.',
          element: {
            selector: link.selector,
            html: await link.getOuterHTML(),
            boundingBox: await link.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'link-name',
          type: 'violation',
          message: 'Link has no discernible text. Add text content, aria-label, or aria-labelledby.',
          element: {
            selector: link.selector,
            html: await link.getOuterHTML(),
            boundingBox: await link.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
