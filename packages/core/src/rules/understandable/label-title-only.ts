import type { Rule, RuleResult } from '../../types.js';

export const labelTitleOnly: Rule = {
  meta: {
    id: 'label-title-only',
    name: 'Form elements should not use title as only label',
    description:
      'Ensures form elements with a title attribute also have a visible label via <label>, aria-label, or aria-labelledby.',
    wcagCriteria: [],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll(
      'input[title], select[title], textarea[title]',
    );

    for (const el of elements) {
      const title = await el.getAttribute('title');
      if (!title || !title.trim()) continue;

      const ariaLabel = await el.getAttribute('aria-label');
      const ariaLabelledby = await el.getAttribute('aria-labelledby');
      const id = await el.getAttribute('id');
      const outerHTML = await el.getOuterHTML();

      // Check if there is an aria-label or aria-labelledby
      const hasAriaName =
        (ariaLabel && ariaLabel.trim().length > 0) ||
        (ariaLabelledby && ariaLabelledby.trim().length > 0);

      if (hasAriaName) {
        results.push({
          ruleId: 'label-title-only',
          type: 'pass',
          message: 'Form element has a label beyond just the title attribute.',
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
        continue;
      }

      // Check if there is a <label> element pointing to this element via for/id
      if (id) {
        const labels = await context.querySelectorAll(`label[for="${id}"]`);
        if (labels.length > 0) {
          results.push({
            ruleId: 'label-title-only',
            type: 'pass',
            message: 'Form element has a <label> element associated with it.',
            element: {
              selector: el.selector,
              html: outerHTML,
              boundingBox: await el.getBoundingBox(),
            },
          });
          continue;
        }
      }

      // No visible label found, only title
      results.push({
        ruleId: 'label-title-only',
        type: 'violation',
        message:
          'Form element uses only the title attribute as its label. Provide a visible <label>, aria-label, or aria-labelledby for better accessibility.',
        element: {
          selector: el.selector,
          html: outerHTML,
          boundingBox: await el.getBoundingBox(),
        },
      });
    }

    return results;
  },
};
