import type { Rule, RuleResult } from '../../types.js';

export const landmarkBannerTopLevel: Rule = {
  meta: {
    id: 'landmark-banner-top-level',
    name: 'Banner landmark must be top level',
    description: 'Ensures <header> (acting as banner) and [role="banner"] elements are not nested inside sectioning landmarks.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const banners = await context.querySelectorAll('header, [role="banner"]');

    for (const banner of banners) {
      const outerHTML = await banner.getOuterHTML();

      const isNested = await context.page.locator(banner.selector).evaluate((el) => {
        return !!el.closest('article, aside, main, nav, section, [role="article"], [role="complementary"], [role="main"], [role="navigation"], [role="region"]');
      });

      if (isNested) {
        results.push({
          ruleId: 'landmark-banner-top-level',
          type: 'violation',
          message: 'Banner landmark is nested inside another landmark. <header> or [role="banner"] must be a top-level landmark.',
          element: {
            selector: banner.selector,
            html: outerHTML,
            boundingBox: await banner.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'landmark-banner-top-level',
          type: 'pass',
          message: 'Banner landmark is at the top level.',
          element: {
            selector: banner.selector,
            html: outerHTML,
            boundingBox: await banner.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
