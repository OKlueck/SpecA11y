import type { Rule, RuleResult } from '../../types.js';

export const objectAlt: Rule = {
  meta: {
    id: 'object-alt',
    name: 'Object elements must have alternate text',
    description: 'Ensures <object> elements have alternative text via aria-label, aria-labelledby, or inner text.',
    wcagCriteria: ['1.1.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const objects = await context.querySelectorAll('object');

    for (const obj of objects) {
      const ariaLabel = await obj.getAttribute('aria-label');
      const ariaLabelledBy = await obj.getAttribute('aria-labelledby');
      const textContent = (await obj.getTextContent()).trim();

      const hasAriaLabel = !!ariaLabel;
      const hasAriaLabelledBy = !!ariaLabelledBy;
      const hasInnerText = textContent.length > 0;

      if (hasAriaLabel || hasAriaLabelledBy || hasInnerText) {
        results.push({
          ruleId: 'object-alt',
          type: 'pass',
          message: 'Object element has alternative text.',
          element: {
            selector: obj.selector,
            html: await obj.getOuterHTML(),
            boundingBox: await obj.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'object-alt',
          type: 'violation',
          message: 'Object element is missing alternative text. Add aria-label, aria-labelledby, or inner text.',
          element: {
            selector: obj.selector,
            html: await obj.getOuterHTML(),
            boundingBox: await obj.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
