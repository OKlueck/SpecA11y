import type { Rule, RuleResult } from '../../types.js';

export const ariaTreeitemName: Rule = {
  meta: {
    id: 'aria-treeitem-name',
    name: 'Elements with role="treeitem" must have an accessible name',
    description:
      'Ensures elements with role="treeitem" have an accessible name via text content, aria-label, or aria-labelledby.',
    wcagCriteria: [],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[role="treeitem"]');

    for (const el of elements) {
      const ariaLabel = await el.getAttribute('aria-label');
      const ariaLabelledby = await el.getAttribute('aria-labelledby');
      const title = await el.getAttribute('title');
      const textContent = await el.getTextContent();
      const outerHTML = await el.getOuterHTML();

      const hasName =
        (ariaLabel && ariaLabel.trim().length > 0) ||
        (ariaLabelledby && ariaLabelledby.trim().length > 0) ||
        (title && title.trim().length > 0) ||
        (textContent && textContent.trim().length > 0);

      if (!hasName) {
        results.push({
          ruleId: 'aria-treeitem-name',
          type: 'violation',
          message:
            'Element with role="treeitem" must have an accessible name. Provide text content, aria-label, or aria-labelledby.',
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-treeitem-name',
          type: 'pass',
          message: 'Element with role="treeitem" has an accessible name.',
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
