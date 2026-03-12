import type { Rule, RuleResult } from '../../types.js';

export const selectName: Rule = {
  meta: {
    id: 'select-name',
    name: 'Select elements must have accessible names',
    description: 'Ensures every <select> element has an accessible name via label, aria-label, or aria-labelledby.',
    wcagCriteria: ['4.1.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const selects = await context.querySelectorAll('select');

    for (const el of selects) {
      const ariaLabel = await el.getAttribute('aria-label');
      const ariaLabelledBy = await el.getAttribute('aria-labelledby');
      const id = await el.getAttribute('id');

      let hasName = false;

      if (ariaLabel && ariaLabel.trim()) {
        hasName = true;
      }

      if (!hasName && ariaLabelledBy && ariaLabelledBy.trim()) {
        hasName = true;
      }

      // Check for associated <label> via for/id or wrapping
      if (!hasName) {
        const hasAssociatedLabel = await context.page.locator(el.selector).evaluate((target, elId) => {
          if (target.closest('label')) return true;

          if (elId) {
            const associatedLabel = document.querySelector(`label[for="${elId}"]`);
            if (associatedLabel) return true;
          }

          return false;
        }, id);

        if (hasAssociatedLabel) {
          hasName = true;
        }
      }

      if (hasName) {
        results.push({
          ruleId: 'select-name',
          type: 'pass',
          message: 'Select element has an accessible name.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'select-name',
          type: 'violation',
          message: 'Select element does not have an accessible name. Add a <label>, aria-label, or aria-labelledby.',
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
