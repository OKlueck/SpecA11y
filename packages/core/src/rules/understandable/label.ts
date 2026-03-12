import type { Rule, RuleResult } from '../../types.js';

const INPUT_SELECTOR = 'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not([type="button"]):not([type="image"]), select, textarea';

export const label: Rule = {
  meta: {
    id: 'label',
    name: 'Form elements must have labels',
    description: 'Ensures every form input (excluding hidden, submit, reset, button, and image types) has an associated label.',
    wcagCriteria: ['3.3.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll(INPUT_SELECTOR);

    for (const el of elements) {
      const ariaLabel = await el.getAttribute('aria-label');
      const ariaLabelledBy = await el.getAttribute('aria-labelledby');
      const title = await el.getAttribute('title');
      const id = await el.getAttribute('id');

      let hasLabel = false;

      // Check aria-label
      if (ariaLabel && ariaLabel.trim()) {
        hasLabel = true;
      }

      // Check aria-labelledby
      if (!hasLabel && ariaLabelledBy && ariaLabelledBy.trim()) {
        hasLabel = true;
      }

      // Check title attribute
      if (!hasLabel && title && title.trim()) {
        hasLabel = true;
      }

      // Check for associated <label> via for/id or wrapping
      if (!hasLabel) {
        const labelInfo = await context.page.locator(el.selector).evaluate((target, elId) => {
          // Check for wrapping <label>
          if (target.closest('label')) return true;

          // Check for <label for="id">
          if (elId) {
            const associatedLabel = document.querySelector(`label[for="${elId}"]`);
            if (associatedLabel) return true;
          }

          return false;
        }, id);

        if (labelInfo) {
          hasLabel = true;
        }
      }

      if (hasLabel) {
        results.push({
          ruleId: 'label',
          type: 'pass',
          message: 'Form element has an associated label.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'label',
          type: 'violation',
          message: 'Form element does not have an associated label. Add a <label>, aria-label, aria-labelledby, or title attribute.',
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
