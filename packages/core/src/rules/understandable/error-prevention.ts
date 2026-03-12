import type { Rule, RuleResult } from '../../types.js';

export const errorPrevention: Rule = {
  meta: {
    id: 'error-prevention',
    name: 'Forms handling sensitive data should provide confirmation mechanisms',
    description: 'Checks forms that handle financial/legal data for review or confirmation steps.',
    wcagCriteria: ['3.3.4'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const sensitiveFormsInfo = await context.evaluate(() => {
      const found: Array<{ selector: string; html: string; hasConfirm: boolean }> = [];
      const forms = document.querySelectorAll('form');
      const sensitivePatterns = /payment|checkout|purchase|billing|order|transfer|delete|remove/i;

      for (const form of forms) {
        const action = form.getAttribute('action') ?? '';
        const hasSensitiveInputs = form.querySelector(
          '[autocomplete*="cc-"], [autocomplete*="transaction"], [name*="payment"], [name*="credit"]'
        );

        if (sensitivePatterns.test(action) || hasSensitiveInputs) {
          const submitBtn = form.querySelector('[type="submit"], button:not([type])');
          const btnText = submitBtn?.textContent?.trim().toLowerCase() ?? '';
          const hasConfirm = /confirm|review|verify|überprüfen|bestätigen/.test(btnText);

          found.push({
            selector: 'form' + (form.id ? `#${form.id}` : ''),
            html: form.outerHTML.slice(0, 200),
            hasConfirm,
          });
        }
      }
      return found;
    });

    for (const form of sensitiveFormsInfo) {
      if (!form.hasConfirm) {
        results.push({
          ruleId: 'error-prevention',
          type: 'warning',
          message: 'Form appears to handle sensitive data but submit button does not suggest a confirmation step. Consider adding a review/confirm step.',
          element: { selector: form.selector, html: form.html },
        });
      }
    }

    return results;
  },
};
