import type { Rule, RuleResult } from '../../types.js';

export const landmarkNoDuplicateBanner: Rule = {
  meta: {
    id: 'landmark-no-duplicate-banner',
    name: 'Page must not have more than one banner landmark',
    description:
      'Ensures the page has at most one banner landmark (<header> at top level or [role="banner"]).',
    wcagCriteria: [],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const bannerCount = await context.evaluate(() => {
      // Count explicit role="banner" elements
      const explicitBanners = document.querySelectorAll('[role="banner"]');

      // Count top-level <header> elements (those not inside article, aside, main, nav, section)
      const headers = document.querySelectorAll('header');
      let topLevelHeaderCount = 0;
      for (const header of headers) {
        if (header.getAttribute('role') === 'banner') continue; // already counted
        const parent = header.closest('article, aside, main, nav, section');
        if (!parent) topLevelHeaderCount++;
      }

      return explicitBanners.length + topLevelHeaderCount;
    });

    if (bannerCount > 1) {
      // Report violation on all banner elements
      const banners = await context.querySelectorAll(
        '[role="banner"], header',
      );

      for (const banner of banners) {
        const outerHTML = await banner.getOuterHTML();
        results.push({
          ruleId: 'landmark-no-duplicate-banner',
          type: 'violation',
          message: `Page has ${bannerCount} banner landmarks. There should be at most one banner landmark per page.`,
          element: {
            selector: banner.selector,
            html: outerHTML,
            boundingBox: await banner.getBoundingBox(),
          },
        });
      }
    } else {
      // If there is exactly one or zero, report a pass
      const banners = await context.querySelectorAll(
        '[role="banner"], header',
      );
      for (const banner of banners) {
        const outerHTML = await banner.getOuterHTML();
        results.push({
          ruleId: 'landmark-no-duplicate-banner',
          type: 'pass',
          message: 'Page has at most one banner landmark.',
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
