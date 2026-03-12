import type { Rule, RuleResult } from '../../types.js';

export const tableHasHeader: Rule = {
  meta: {
    id: 'table-has-header',
    name: 'Data tables must have header cells',
    description: 'Ensures data tables have at least one <th> or element with role="columnheader" or role="rowheader".',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const tables = await context.querySelectorAll('table');

    for (const table of tables) {
      const evaluation = await context.page.locator(table.selector).evaluate((el) => {
        const role = (el.getAttribute('role') ?? '').toLowerCase();

        // Skip presentation/none tables
        if (role === 'presentation' || role === 'none') {
          return { skip: true, hasHeader: false, isLayoutTable: false };
        }

        // Skip layout tables (single row with single cell)
        const rows = el.querySelectorAll('tr');
        if (rows.length <= 1) {
          const cells = el.querySelectorAll('td, th');
          if (cells.length <= 1) {
            return { skip: true, hasHeader: false, isLayoutTable: true };
          }
        }

        // Check for <th> elements
        if (el.querySelector('th')) {
          return { skip: false, hasHeader: true, isLayoutTable: false };
        }

        // Check for role="columnheader" or role="rowheader"
        if (el.querySelector('[role="columnheader"], [role="rowheader"]')) {
          return { skip: false, hasHeader: true, isLayoutTable: false };
        }

        return { skip: false, hasHeader: false, isLayoutTable: false };
      });

      if (evaluation.skip) continue;

      if (!evaluation.hasHeader) {
        results.push({
          ruleId: 'table-has-header',
          type: 'violation',
          message: 'Data table does not have any header cells (<th>, role="columnheader", or role="rowheader").',
          element: {
            selector: table.selector,
            html: await table.getOuterHTML(),
            boundingBox: await table.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'table-has-header',
          type: 'pass',
          message: 'Data table has header cells.',
          element: {
            selector: table.selector,
            html: await table.getOuterHTML(),
            boundingBox: await table.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
