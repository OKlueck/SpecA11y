import type { Rule, RuleResult } from '../../types.js';

export const tableFakeCaption: Rule = {
  meta: {
    id: 'table-fake-caption',
    name: 'Tables should use <caption> instead of a spanning cell as a caption',
    description: 'Checks for tables where the first row contains a single cell with colspan equal to the number of columns, which suggests a fake caption that should use <caption> instead.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
    tags: ['experimental'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const tables = await context.querySelectorAll('table');

    for (const table of tables) {
      const outerHTML = await table.getOuterHTML();

      const info = await context.page.locator(table.selector).evaluate((tableEl) => {
        const rows = tableEl.querySelectorAll('tr');
        if (rows.length < 2) return null;

        const firstRowCells = rows[0].querySelectorAll(':scope > td, :scope > th');
        if (firstRowCells.length !== 1) return null;

        const colspan = firstRowCells[0].getAttribute('colspan');
        if (!colspan) return null;

        const secondRowCells = rows[1].querySelectorAll(':scope > td, :scope > th');
        const colCount = secondRowCells.length;

        if (colCount > 1 && parseInt(colspan, 10) >= colCount) {
          return (firstRowCells[0].textContent ?? '').trim().substring(0, 50);
        }
        return null;
      });

      if (info !== null) {
        results.push({
          ruleId: 'table-fake-caption',
          type: 'violation',
          message: `Table appears to use a spanning cell ("${info}") as a caption. Use a <caption> element instead for better accessibility.`,
          element: {
            selector: table.selector,
            html: outerHTML.substring(0, 200),
            boundingBox: await table.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
