import type { Rule, RuleResult } from '../../types.js';

export const emptyHeading: Rule = {
  meta: {
    id: 'empty-heading',
    name: 'Headings must have discernible text',
    description:
      'Ensures headings (h1-h6 and elements with role="heading") have text content that is accessible to screen readers.',
    wcagCriteria: [],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const headings = await context.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, [role="heading"]',
    );

    for (const heading of headings) {
      const textContent = await heading.getTextContent();
      const ariaLabel = await heading.getAttribute('aria-label');
      const ariaLabelledby = await heading.getAttribute('aria-labelledby');
      const outerHTML = await heading.getOuterHTML();

      const hasText =
        (textContent && textContent.trim().length > 0) ||
        (ariaLabel && ariaLabel.trim().length > 0) ||
        (ariaLabelledby && ariaLabelledby.trim().length > 0);

      if (!hasText) {
        results.push({
          ruleId: 'empty-heading',
          type: 'violation',
          message:
            'Heading element has no discernible text. Add text content, aria-label, or aria-labelledby.',
          element: {
            selector: heading.selector,
            html: outerHTML,
            boundingBox: await heading.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'empty-heading',
          type: 'pass',
          message: 'Heading element has discernible text.',
          element: {
            selector: heading.selector,
            html: outerHTML,
            boundingBox: await heading.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
