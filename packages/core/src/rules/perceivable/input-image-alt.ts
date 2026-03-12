import type { Rule, RuleResult } from '../../types.js';

export const inputImageAlt: Rule = {
  meta: {
    id: 'input-image-alt',
    name: 'Image inputs must have alternate text',
    description: 'Ensures <input type="image"> elements have alternative text.',
    wcagCriteria: ['1.1.1'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const inputs = await context.querySelectorAll('input[type="image"]');

    for (const input of inputs) {
      const alt = await input.getAttribute('alt');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      const hasAlt = alt !== null && alt !== undefined && alt !== '';
      const hasAriaLabel = !!ariaLabel;
      const hasAriaLabelledBy = !!ariaLabelledBy;

      if (hasAlt || hasAriaLabel || hasAriaLabelledBy) {
        results.push({
          ruleId: 'input-image-alt',
          type: 'pass',
          message: 'Image input has alternative text.',
          element: {
            selector: input.selector,
            html: await input.getOuterHTML(),
            boundingBox: await input.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'input-image-alt',
          type: 'violation',
          message: 'Image input is missing alternative text. Add an alt attribute or aria-label.',
          element: {
            selector: input.selector,
            html: await input.getOuterHTML(),
            boundingBox: await input.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
