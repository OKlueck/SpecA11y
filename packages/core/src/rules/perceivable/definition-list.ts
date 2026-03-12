import type { Rule, RuleResult } from '../../types.js';

export const definitionList: Rule = {
  meta: {
    id: 'definition-list',
    name: 'Definition lists must only contain allowed child elements',
    description: 'Ensures <dl> elements only directly contain <dt>, <dd>, <div>, <script>, or <template> elements.',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const dlElements = await context.querySelectorAll('dl');

    for (const dl of dlElements) {
      const invalidChildren = await context.page.locator(dl.selector).evaluate((el) => {
        const allowedTags = new Set(['DT', 'DD', 'DIV', 'SCRIPT', 'TEMPLATE']);
        const invalid: string[] = [];
        for (const child of Array.from(el.children)) {
          if (!allowedTags.has(child.tagName)) {
            invalid.push(child.tagName.toLowerCase());
          }
        }
        return invalid;
      });

      if (invalidChildren.length > 0) {
        results.push({
          ruleId: 'definition-list',
          type: 'violation',
          message: `Definition list contains invalid direct children: <${invalidChildren.join('>, <')}>. Only <dt>, <dd>, <div>, <script>, and <template> are allowed.`,
          element: {
            selector: dl.selector,
            html: await dl.getOuterHTML(),
            boundingBox: await dl.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'definition-list',
          type: 'pass',
          message: 'Definition list only contains allowed child elements.',
          element: {
            selector: dl.selector,
            html: await dl.getOuterHTML(),
            boundingBox: await dl.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
