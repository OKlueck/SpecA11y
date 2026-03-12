import type { Rule, RuleResult } from '../../types.js';

export const svgImgAlt: Rule = {
  meta: {
    id: 'svg-img-alt',
    name: 'SVG elements with img role must have accessible name',
    description: 'Ensures <svg> elements with role="img" have an accessible name via <title>, aria-label, or aria-labelledby.',
    wcagCriteria: ['1.1.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const svgs = await context.querySelectorAll('svg[role="img"]');

    for (const svg of svgs) {
      const ariaLabel = await svg.getAttribute('aria-label');
      const ariaLabelledBy = await svg.getAttribute('aria-labelledby');

      // Check for a <title> child element within the SVG
      const hasTitleElement = await context.page.locator(svg.selector).evaluate((el) => {
        const title = el.querySelector('title');
        return !!title && title.textContent!.trim().length > 0;
      });

      const hasAriaLabel = !!ariaLabel;
      const hasAriaLabelledBy = !!ariaLabelledBy;

      if (hasAriaLabel || hasAriaLabelledBy || hasTitleElement) {
        results.push({
          ruleId: 'svg-img-alt',
          type: 'pass',
          message: 'SVG element with role="img" has an accessible name.',
          element: {
            selector: svg.selector,
            html: await svg.getOuterHTML(),
            boundingBox: await svg.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'svg-img-alt',
          type: 'violation',
          message: 'SVG element with role="img" is missing an accessible name. Add a <title> element, aria-label, or aria-labelledby.',
          element: {
            selector: svg.selector,
            html: await svg.getOuterHTML(),
            boundingBox: await svg.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
