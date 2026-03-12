import type { Rule, RuleResult } from '../../types.js';

export const listStructure: Rule = {
  meta: {
    id: 'list-structure',
    name: 'Lists must only contain allowed child elements',
    description: 'Ensures <ul> and <ol> elements only contain <li>, <script>, or <template> as direct children.',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const lists = await context.querySelectorAll('ul, ol');

    for (const list of lists) {
      const invalidChildren = await context.page.locator(list.selector).evaluate((el) => {
        const allowedTags = new Set(['LI', 'SCRIPT', 'TEMPLATE']);
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
          ruleId: 'list-structure',
          type: 'violation',
          message: `List contains invalid direct children: <${invalidChildren.join('>, <')}>. Only <li>, <script>, and <template> are allowed.`,
          element: {
            selector: list.selector,
            html: await list.getOuterHTML(),
            boundingBox: await list.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'list-structure',
          type: 'pass',
          message: 'List only contains allowed child elements.',
          element: {
            selector: list.selector,
            html: await list.getOuterHTML(),
            boundingBox: await list.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
