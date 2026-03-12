import type { Rule, RuleResult } from '../../types.js';

export const errorSuggestion: Rule = {
  meta: {
    id: 'error-suggestion',
    name: 'Form fields with constraints should provide helpful descriptions',
    description: 'Checks that required fields and fields with patterns have descriptive labels or instructions.',
    wcagCriteria: ['3.3.3'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const fields = await context.evaluate(() => {
      const inputs = document.querySelectorAll('input[pattern], input[required], [aria-required="true"]');
      return Array.from(inputs).map(el => {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const hasPattern = el.hasAttribute('pattern');
        const hasTitle = !!el.getAttribute('title')?.trim();
        const hasDescribedBy = !!el.getAttribute('aria-describedby');
        const hasPlaceholder = !!el.getAttribute('placeholder')?.trim();
        return {
          selector: tag + id,
          html: el.outerHTML.slice(0, 200),
          hasPattern,
          hasDescription: hasTitle || hasDescribedBy || hasPlaceholder,
        };
      });
    });

    for (const field of fields) {
      if (field.hasPattern && !field.hasDescription) {
        results.push({
          ruleId: 'error-suggestion',
          type: 'warning',
          message: 'Input has a pattern constraint but no description. Add a title or aria-describedby to explain the expected format.',
          element: { selector: field.selector, html: field.html },
        });
      }
    }

    return results;
  },
};
