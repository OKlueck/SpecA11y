import type { Rule, RuleResult } from '../../types.js';

export const buttonName: Rule = {
  meta: {
    id: 'button-name',
    name: 'Buttons must have accessible names',
    description: 'Ensures every <button> and [role="button"] element has an accessible name via text content, aria-label, aria-labelledby, title, or value.',
    wcagCriteria: ['4.1.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const buttons = await context.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]');

    for (const el of buttons) {
      const ariaLabel = await el.getAttribute('aria-label');
      const ariaLabelledBy = await el.getAttribute('aria-labelledby');
      const title = await el.getAttribute('title');
      const value = await el.getAttribute('value');
      const textContent = await el.getTextContent();

      let hasName = false;

      if (ariaLabel && ariaLabel.trim()) {
        hasName = true;
      }

      if (!hasName && ariaLabelledBy && ariaLabelledBy.trim()) {
        hasName = true;
      }

      if (!hasName && textContent && textContent.trim()) {
        hasName = true;
      }

      if (!hasName && title && title.trim()) {
        hasName = true;
      }

      if (!hasName && value && value.trim()) {
        hasName = true;
      }

      if (hasName) {
        results.push({
          ruleId: 'button-name',
          type: 'pass',
          message: 'Button has an accessible name.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'button-name',
          type: 'violation',
          message: 'Button does not have an accessible name. Add text content, aria-label, aria-labelledby, title, or value.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
