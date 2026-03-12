import type { Rule, RuleResult } from '../../types.js';

export const landmarkContentinfoTopLevel: Rule = {
  meta: {
    id: 'landmark-contentinfo-top-level',
    name: 'Contentinfo landmark must be top level',
    description: 'Ensures <footer> (acting as contentinfo) and [role="contentinfo"] elements are not nested inside sectioning landmarks.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const footers = await context.querySelectorAll('footer, [role="contentinfo"]');

    for (const footer of footers) {
      const outerHTML = await footer.getOuterHTML();

      const isNested = await context.page.locator(footer.selector).evaluate((el) => {
        return !!el.closest('article, aside, main, nav, section, [role="article"], [role="complementary"], [role="main"], [role="navigation"], [role="region"]');
      });

      if (isNested) {
        results.push({
          ruleId: 'landmark-contentinfo-top-level',
          type: 'violation',
          message: 'Contentinfo landmark is nested inside another landmark. <footer> or [role="contentinfo"] must be a top-level landmark.',
          element: {
            selector: footer.selector,
            html: outerHTML,
            boundingBox: await footer.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'landmark-contentinfo-top-level',
          type: 'pass',
          message: 'Contentinfo landmark is at the top level.',
          element: {
            selector: footer.selector,
            html: outerHTML,
            boundingBox: await footer.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
