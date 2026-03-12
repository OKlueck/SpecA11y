import type { Rule, RuleResult } from '../../types.js';

export const emptyTableHeader: Rule = {
  meta: {
    id: 'empty-table-header',
    name: 'Table header cells must have discernible text',
    description:
      'Ensures <th> elements have text content that is accessible to screen readers.',
    wcagCriteria: [],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const headers = await context.querySelectorAll('th');

    for (const th of headers) {
      const textContent = await th.getTextContent();
      const ariaLabel = await th.getAttribute('aria-label');
      const ariaLabelledby = await th.getAttribute('aria-labelledby');
      const outerHTML = await th.getOuterHTML();

      const hasText =
        (textContent && textContent.trim().length > 0) ||
        (ariaLabel && ariaLabel.trim().length > 0) ||
        (ariaLabelledby && ariaLabelledby.trim().length > 0);

      if (!hasText) {
        results.push({
          ruleId: 'empty-table-header',
          type: 'violation',
          message:
            'Table header <th> has no discernible text. Add text content, aria-label, or aria-labelledby.',
          element: {
            selector: th.selector,
            html: outerHTML,
            boundingBox: await th.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'empty-table-header',
          type: 'pass',
          message: 'Table header <th> has discernible text.',
          element: {
            selector: th.selector,
            html: outerHTML,
            boundingBox: await th.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
