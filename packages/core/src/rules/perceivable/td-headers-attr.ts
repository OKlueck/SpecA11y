import type { Rule, RuleResult } from '../../types.js';

export const tdHeadersAttr: Rule = {
  meta: {
    id: 'td-headers-attr',
    name: 'Table cell headers attribute must reference valid th IDs',
    description: 'Ensures <td> elements with a headers attribute reference valid <th> IDs within the same table.',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const cells = await context.querySelectorAll('td[headers]');

    for (const cell of cells) {
      const headersAttr = await cell.getAttribute('headers');

      if (!headersAttr || headersAttr.trim() === '') {
        results.push({
          ruleId: 'td-headers-attr',
          type: 'violation',
          message: 'Table cell has an empty headers attribute.',
          element: {
            selector: cell.selector,
            html: await cell.getOuterHTML(),
            boundingBox: await cell.getBoundingBox(),
          },
        });
        continue;
      }

      const invalidIds = await context.page.locator(cell.selector).evaluate(
        (td, headers) => {
          const table = td.closest('table');
          if (!table) return [];

          const headerIds = headers.trim().split(/\s+/);
          const invalid: string[] = [];

          for (const id of headerIds) {
            const th = table.querySelector(`th[id="${CSS.escape(id)}"]`);
            if (!th) {
              invalid.push(id);
            }
          }

          return invalid;
        },
        headersAttr,
      );

      if (invalidIds.length > 0) {
        results.push({
          ruleId: 'td-headers-attr',
          type: 'violation',
          message: `Table cell references invalid header IDs: ${invalidIds.join(', ')}. Each ID must match a <th> in the same table.`,
          element: {
            selector: cell.selector,
            html: await cell.getOuterHTML(),
            boundingBox: await cell.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'td-headers-attr',
          type: 'pass',
          message: 'Table cell headers attribute references valid th IDs.',
          element: {
            selector: cell.selector,
            html: await cell.getOuterHTML(),
            boundingBox: await cell.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
