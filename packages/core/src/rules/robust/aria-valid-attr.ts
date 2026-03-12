import type { Rule, RuleResult } from '../../types.js';
import { VALID_ARIA_ATTRS } from '../../utils/aria.js';

export const ariaValidAttr: Rule = {
  meta: {
    id: 'aria-valid-attr',
    name: 'ARIA attributes must be valid',
    description: 'Ensures all aria-* attributes used are actual valid ARIA attributes from the specification.',
    wcagCriteria: ['4.1.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const elementsWithAriaAttrs = await context.page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const found: Array<{ selector: string; html: string; invalidAttrs: string[] }> = [];

      allElements.forEach((el) => {
        const ariaAttrs = Array.from(el.attributes)
          .filter(attr => attr.name.startsWith('aria-'))
          .map(attr => attr.name);

        if (ariaAttrs.length === 0) return;

        // Build a simple selector for identification
        let selector = el.tagName.toLowerCase();
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.className && typeof el.className === 'string') {
          selector += '.' + el.className.trim().split(/\s+/).join('.');
        }

        found.push({
          selector,
          html: el.outerHTML.slice(0, 200),
          invalidAttrs: ariaAttrs,
        });
      });

      return found;
    });

    // We need to pass the valid attrs set into the filter since it can't be
    // serialized into the page evaluate. Filter on the Node.js side instead.
    const validAttrs = VALID_ARIA_ATTRS;

    for (const entry of elementsWithAriaAttrs) {
      const invalidAttrs = entry.invalidAttrs.filter(attr => !validAttrs.has(attr));

      if (invalidAttrs.length > 0) {
        for (const attr of invalidAttrs) {
          results.push({
            ruleId: 'aria-valid-attr',
            type: 'violation',
            message: `Invalid ARIA attribute "${attr}". This is not a recognized ARIA attribute.`,
            element: {
              selector: entry.selector,
              html: entry.html,
            },
          });
        }
      }
    }

    if (results.length === 0 && elementsWithAriaAttrs.length > 0) {
      results.push({
        ruleId: 'aria-valid-attr',
        type: 'pass',
        message: 'All ARIA attributes used on the page are valid.',
      });
    }

    return results;
  },
};
