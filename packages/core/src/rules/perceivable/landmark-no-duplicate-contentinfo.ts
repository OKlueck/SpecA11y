import type { Rule, RuleResult } from '../../types.js';

export const landmarkNoDuplicateContentinfo: Rule = {
  meta: {
    id: 'landmark-no-duplicate-contentinfo',
    name: 'Page must not have more than one contentinfo landmark',
    description:
      'Ensures the page has at most one contentinfo landmark (<footer> at top level or [role="contentinfo"]).',
    wcagCriteria: [],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const contentinfoCount = await context.evaluate(() => {
      // Count explicit role="contentinfo" elements
      const explicitContentinfos = document.querySelectorAll(
        '[role="contentinfo"]',
      );

      // Count top-level <footer> elements (those not inside article, aside, main, nav, section)
      const footers = document.querySelectorAll('footer');
      let topLevelFooterCount = 0;
      for (const footer of footers) {
        if (footer.getAttribute('role') === 'contentinfo') continue; // already counted
        const parent = footer.closest(
          'article, aside, main, nav, section',
        );
        if (!parent) topLevelFooterCount++;
      }

      return explicitContentinfos.length + topLevelFooterCount;
    });

    if (contentinfoCount > 1) {
      const footers = await context.querySelectorAll(
        '[role="contentinfo"], footer',
      );

      for (const footer of footers) {
        const outerHTML = await footer.getOuterHTML();
        results.push({
          ruleId: 'landmark-no-duplicate-contentinfo',
          type: 'violation',
          message: `Page has ${contentinfoCount} contentinfo landmarks. There should be at most one contentinfo landmark per page.`,
          element: {
            selector: footer.selector,
            html: outerHTML,
            boundingBox: await footer.getBoundingBox(),
          },
        });
      }
    } else {
      const footers = await context.querySelectorAll(
        '[role="contentinfo"], footer',
      );
      for (const footer of footers) {
        const outerHTML = await footer.getOuterHTML();
        results.push({
          ruleId: 'landmark-no-duplicate-contentinfo',
          type: 'pass',
          message: 'Page has at most one contentinfo landmark.',
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
