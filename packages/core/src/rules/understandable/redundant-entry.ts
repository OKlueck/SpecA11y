import type { Rule, RuleResult } from '../../types.js';

export const redundantEntry: Rule = {
  meta: {
    id: 'redundant-entry',
    name: 'Users should not need to re-enter previously provided information',
    description: 'Checks for forms with duplicate input purposes that may require redundant data entry.',
    wcagCriteria: ['3.3.7'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const duplicates = await context.evaluate(() => {
      const found: Array<{ selector: string; html: string; autocomplete: string; count: number }> = [];
      const inputs = document.querySelectorAll('input[autocomplete], select[autocomplete], textarea[autocomplete]');
      const byAutocomplete = new Map<string, Element[]>();

      for (const input of inputs) {
        const ac = input.getAttribute('autocomplete')?.trim().toLowerCase();
        if (ac && ac !== 'off' && ac !== 'on') {
          const list = byAutocomplete.get(ac) ?? [];
          list.push(input);
          byAutocomplete.set(ac, list);
        }
      }

      for (const [ac, elements] of byAutocomplete) {
        if (elements.length > 1) {
          for (const el of elements) {
            const tag = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            found.push({
              selector: tag + id,
              html: el.outerHTML.slice(0, 200),
              autocomplete: ac,
              count: elements.length,
            });
          }
        }
      }
      return found;
    });

    for (const dup of duplicates) {
      results.push({
        ruleId: 'redundant-entry',
        type: 'warning',
        message: `Multiple inputs share autocomplete="${dup.autocomplete}" (${dup.count} instances). Ensure users don't need to re-enter the same information.`,
        element: { selector: dup.selector, html: dup.html },
      });
    }

    return results;
  },
};
