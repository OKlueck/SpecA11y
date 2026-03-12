import type { Rule, RuleResult } from '../../types.js';

export const consistentIdentification: Rule = {
  meta: {
    id: 'consistent-identification',
    name: 'Components with the same functionality must be consistently identified',
    description: 'Checks that search inputs and common UI patterns have consistent labeling.',
    wcagCriteria: ['3.2.4'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const searchInputs = await context.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="search"], [role="search"] input, [role="searchbox"]');
      return Array.from(inputs).map(el => {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const ariaLabel = el.getAttribute('aria-label') ?? '';
        const placeholder = el.getAttribute('placeholder') ?? '';
        const labelEl = el.id ? document.querySelector(`label[for="${el.id}"]`) : null;
        const labelText = labelEl?.textContent?.trim() ?? '';
        return {
          selector: tag + id,
          html: el.outerHTML.slice(0, 200),
          label: ariaLabel || labelText || placeholder,
        };
      });
    });

    for (const input of searchInputs) {
      if (!input.label) {
        results.push({
          ruleId: 'consistent-identification',
          type: 'warning',
          message: 'Search input has no accessible label. Use aria-label, a <label>, or placeholder for consistent identification.',
          element: { selector: input.selector, html: input.html },
        });
      }
    }

    return results;
  },
};
