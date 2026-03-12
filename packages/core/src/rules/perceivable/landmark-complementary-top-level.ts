import type { Rule, RuleResult } from '../../types.js';

export const landmarkComplementaryTopLevel: Rule = {
  meta: {
    id: 'landmark-complementary-top-level',
    name: 'Complementary landmark must be top level',
    description: 'Ensures <aside> and [role="complementary"] elements are not nested inside other landmarks.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const asides = await context.querySelectorAll('aside, [role="complementary"]');

    for (const aside of asides) {
      const outerHTML = await aside.getOuterHTML();

      const isNested = await context.page.locator(aside.selector).evaluate((el) => {
        return !!el.closest('article, main, nav, section, [role="article"], [role="banner"], [role="contentinfo"], [role="main"], [role="navigation"], [role="region"]');
      });

      if (isNested) {
        results.push({
          ruleId: 'landmark-complementary-top-level',
          type: 'violation',
          message: 'Complementary landmark is nested inside another landmark. <aside> or [role="complementary"] must be a top-level landmark.',
          element: {
            selector: aside.selector,
            html: outerHTML,
            boundingBox: await aside.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'landmark-complementary-top-level',
          type: 'pass',
          message: 'Complementary landmark is at the top level.',
          element: {
            selector: aside.selector,
            html: outerHTML,
            boundingBox: await aside.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
