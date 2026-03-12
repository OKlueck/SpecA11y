import type { Rule, RuleResult } from '../../types.js';

export const scopeAttrValid: Rule = {
  meta: {
    id: 'scope-attr-valid',
    name: 'Scope attribute on <th> must have a valid value',
    description: 'Ensures <th scope="..."> uses a valid value: row, col, rowgroup, colgroup, or empty string.',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const headers = await context.querySelectorAll('th[scope]');

    const validValues = new Set(['row', 'col', 'rowgroup', 'colgroup', '']);

    for (const header of headers) {
      const scopeValue = await header.getAttribute('scope');
      const normalised = (scopeValue ?? '').trim().toLowerCase();

      if (!validValues.has(normalised)) {
        results.push({
          ruleId: 'scope-attr-valid',
          type: 'violation',
          message: `<th> has an invalid scope value "${scopeValue}". Allowed values are: row, col, rowgroup, colgroup, or empty string.`,
          element: {
            selector: header.selector,
            html: await header.getOuterHTML(),
            boundingBox: await header.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'scope-attr-valid',
          type: 'pass',
          message: 'Scope attribute has a valid value.',
          element: {
            selector: header.selector,
            html: await header.getOuterHTML(),
            boundingBox: await header.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
