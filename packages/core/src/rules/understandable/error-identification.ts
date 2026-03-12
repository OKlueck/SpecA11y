import type { Rule, RuleResult } from '../../types.js';

export const errorIdentification: Rule = {
  meta: {
    id: 'error-identification',
    name: 'Form errors must be identified in text',
    description: 'Checks that form fields with aria-invalid have associated error messages.',
    wcagCriteria: ['3.3.1'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const invalidFields = await context.evaluate(() => {
      const fields = document.querySelectorAll('[aria-invalid="true"]');
      return Array.from(fields).map(el => {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const describedBy = el.getAttribute('aria-describedby');
        const errorMessage = el.getAttribute('aria-errormessage');

        let hasErrorText = false;
        if (describedBy) {
          for (const refId of describedBy.split(/\s+/)) {
            const ref = document.getElementById(refId);
            if (ref && ref.textContent?.trim()) { hasErrorText = true; break; }
          }
        }
        if (errorMessage) {
          const ref = document.getElementById(errorMessage);
          if (ref && ref.textContent?.trim()) hasErrorText = true;
        }

        return {
          selector: tag + id,
          html: el.outerHTML.slice(0, 200),
          hasErrorText,
        };
      });
    });

    for (const field of invalidFields) {
      if (field.hasErrorText) {
        results.push({
          ruleId: 'error-identification',
          type: 'pass',
          message: 'Invalid field has associated error message.',
          element: { selector: field.selector, html: field.html },
        });
      } else {
        results.push({
          ruleId: 'error-identification',
          type: 'violation',
          message: 'Field is marked as invalid but has no associated error message. Add aria-describedby or aria-errormessage pointing to visible error text.',
          element: { selector: field.selector, html: field.html },
        });
      }
    }

    return results;
  },
};
