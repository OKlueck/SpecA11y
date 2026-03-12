import type { Rule, RuleResult } from '../../types.js';

export const dlitem: Rule = {
  meta: {
    id: 'dlitem',
    name: 'Definition list items must be properly nested',
    description: 'Ensures <dt> and <dd> elements are direct children of a <dl> or a <div> that is a direct child of a <dl>.',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const items = await context.querySelectorAll('dt, dd');

    for (const item of items) {
      const isProperlyNested = await context.page.locator(item.selector).evaluate((el) => {
        const parent = el.parentElement;
        if (!parent) return false;

        // Direct child of <dl>
        if (parent.tagName === 'DL') return true;

        // Direct child of <div> that is a direct child of <dl>
        if (parent.tagName === 'DIV' && parent.parentElement?.tagName === 'DL') return true;

        return false;
      });

      const tagName = await context.page.locator(item.selector).evaluate((el) => el.tagName.toLowerCase());

      if (!isProperlyNested) {
        results.push({
          ruleId: 'dlitem',
          type: 'violation',
          message: `<${tagName}> is not a direct child of a <dl> or a <div> inside a <dl>.`,
          element: {
            selector: item.selector,
            html: await item.getOuterHTML(),
            boundingBox: await item.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'dlitem',
          type: 'pass',
          message: `<${tagName}> is properly nested within a definition list.`,
          element: {
            selector: item.selector,
            html: await item.getOuterHTML(),
            boundingBox: await item.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
