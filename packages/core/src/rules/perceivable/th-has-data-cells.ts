import type { Rule, RuleResult } from '../../types.js';

export const thHasDataCells: Rule = {
  meta: {
    id: 'th-has-data-cells',
    name: 'Table headers must have associated data cells',
    description: 'Ensures every <th> element has at least one associated <td> data cell in its row or column.',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const headers = await context.querySelectorAll('th');

    for (const header of headers) {
      const hasDataCells = await context.page.locator(header.selector).evaluate((th) => {
        const table = th.closest('table');
        if (!table) return false;

        const scope = (th.getAttribute('scope') ?? '').toLowerCase();
        const row = th.closest('tr');
        if (!row) return false;

        // Check row for td cells
        if (scope === 'row' || scope === 'rowgroup') {
          return row.querySelector('td') !== null;
        }

        // Check column for td cells
        if (scope === 'col' || scope === 'colgroup') {
          const cellIndex = Array.from(row.cells).indexOf(th as HTMLTableCellElement);
          if (cellIndex < 0) return false;
          const rows = Array.from(table.rows);
          for (const r of rows) {
            if (r === row) continue;
            const cell = r.cells[cellIndex];
            if (cell && cell.tagName === 'TD') return true;
          }
          return false;
        }

        // No scope: check either row or column
        if (row.querySelector('td')) return true;

        const cellIndex = Array.from(row.cells).indexOf(th as HTMLTableCellElement);
        if (cellIndex < 0) return false;
        const rows = Array.from(table.rows);
        for (const r of rows) {
          if (r === row) continue;
          const cell = r.cells[cellIndex];
          if (cell && cell.tagName === 'TD') return true;
        }
        return false;
      });

      if (!hasDataCells) {
        results.push({
          ruleId: 'th-has-data-cells',
          type: 'violation',
          message: 'Table header <th> has no associated data cells.',
          element: {
            selector: header.selector,
            html: await header.getOuterHTML(),
            boundingBox: await header.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'th-has-data-cells',
          type: 'pass',
          message: 'Table header has associated data cells.',
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
