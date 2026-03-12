import type { Rule, RuleResult } from '../../types.js';

/** Validators for ARIA attributes that have constrained value sets. */
const ARIA_VALUE_VALIDATORS: Record<string, (value: string) => boolean> = {
  'aria-autocomplete': (v) => ['inline', 'list', 'both', 'none'].includes(v),
  'aria-busy': (v) => ['true', 'false'].includes(v),
  'aria-checked': (v) => ['true', 'false', 'mixed', 'undefined'].includes(v),
  'aria-current': (v) => ['page', 'step', 'location', 'date', 'time', 'true', 'false'].includes(v),
  'aria-disabled': (v) => ['true', 'false'].includes(v),
  'aria-dropeffect': (v) => v.split(/\s+/).every(t => ['copy', 'execute', 'link', 'move', 'none', 'popup'].includes(t)),
  'aria-expanded': (v) => ['true', 'false', 'undefined'].includes(v),
  'aria-grabbed': (v) => ['true', 'false', 'undefined'].includes(v),
  'aria-haspopup': (v) => ['true', 'false', 'menu', 'listbox', 'tree', 'grid', 'dialog'].includes(v),
  'aria-hidden': (v) => ['true', 'false'].includes(v),
  'aria-invalid': (v) => ['true', 'false', 'grammar', 'spelling'].includes(v),
  'aria-level': (v) => /^\d+$/.test(v) && parseInt(v, 10) >= 1,
  'aria-live': (v) => ['polite', 'assertive', 'off'].includes(v),
  'aria-modal': (v) => ['true', 'false'].includes(v),
  'aria-multiline': (v) => ['true', 'false'].includes(v),
  'aria-multiselectable': (v) => ['true', 'false'].includes(v),
  'aria-orientation': (v) => ['horizontal', 'vertical', 'undefined'].includes(v),
  'aria-pressed': (v) => ['true', 'false', 'mixed', 'undefined'].includes(v),
  'aria-readonly': (v) => ['true', 'false'].includes(v),
  'aria-relevant': (v) => v.split(/\s+/).every(t => ['additions', 'removals', 'text', 'all'].includes(t)),
  'aria-required': (v) => ['true', 'false'].includes(v),
  'aria-selected': (v) => ['true', 'false', 'undefined'].includes(v),
  'aria-sort': (v) => ['ascending', 'descending', 'none', 'other'].includes(v),
  'aria-valuemax': (v) => !isNaN(Number(v)),
  'aria-valuemin': (v) => !isNaN(Number(v)),
  'aria-valuenow': (v) => !isNaN(Number(v)),
};

export const ariaValidAttrValue: Rule = {
  meta: {
    id: 'aria-valid-attr-value',
    name: 'ARIA attributes must have valid values',
    description: 'Ensures ARIA attributes have values that conform to the specification (e.g. aria-hidden must be "true" or "false", aria-level must be a positive integer).',
    wcagCriteria: ['4.1.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const elementsWithAriaAttrs = await context.page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const found: Array<{ selector: string; html: string; attrs: Array<{ name: string; value: string }> }> = [];

      allElements.forEach((el) => {
        const ariaAttrs = Array.from(el.attributes)
          .filter(attr => attr.name.startsWith('aria-'))
          .map(attr => ({ name: attr.name, value: attr.value }));

        if (ariaAttrs.length === 0) return;

        let selector = el.tagName.toLowerCase();
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.className && typeof el.className === 'string') {
          selector += '.' + el.className.trim().split(/\s+/).join('.');
        }

        found.push({
          selector,
          html: el.outerHTML.slice(0, 200),
          attrs: ariaAttrs,
        });
      });

      return found;
    });

    for (const entry of elementsWithAriaAttrs) {
      for (const attr of entry.attrs) {
        const validator = ARIA_VALUE_VALIDATORS[attr.name];
        if (!validator) continue;

        if (!validator(attr.value)) {
          results.push({
            ruleId: 'aria-valid-attr-value',
            type: 'violation',
            message: `ARIA attribute "${attr.name}" has an invalid value: "${attr.value}".`,
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
        ruleId: 'aria-valid-attr-value',
        type: 'pass',
        message: 'All ARIA attribute values on the page are valid.',
      });
    }

    return results;
  },
};
