import type { Rule, RuleResult } from '../../types.js';

export const tdHasHeader: Rule = {
  meta: {
    id: 'td-has-header',
    name: 'Data cells in large tables must have associated headers',
    description: 'Ensures that data cells (<td>) in large tables (3+ rows and 3+ columns) have associated header cells via <th> elements in the same row/column or via the headers attribute.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
    tags: ['experimental'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const tables = await context.querySelectorAll('table');

    for (const table of tables) {
      // Analyze table structure in-browser to avoid selector chaining issues
      const analysis = await context.page.locator(table.selector).evaluate((tableEl) => {
        const rows = tableEl.querySelectorAll('tr');
        if (rows.length < 3) return null;

        let maxCols = 0;
        for (const row of rows) {
          const cells = row.querySelectorAll(':scope > td, :scope > th');
          if (cells.length > maxCols) maxCols = cells.length;
        }
        if (maxCols < 3) return null;

        const hasHeaders = tableEl.querySelectorAll('th').length > 0;
        const tds = tableEl.querySelectorAll('td');
        const tdInfo: { html: string; hasHeadersAttr: boolean }[] = [];
        for (const td of tds) {
          tdInfo.push({
            html: td.outerHTML,
            hasHeadersAttr: td.hasAttribute('headers'),
          });
        }
        return { hasHeaders, tdInfo };
      });

      if (!analysis) continue;

      // Get td elements for selectors and bounding boxes
      const tdElements = await context.querySelectorAll(`td`);
      // Filter to only tds belonging to this table
      const tableTds: typeof tdElements = [];
      for (const td of tdElements) {
        const belongsToTable = await context.page.locator(td.selector).evaluate(
          (el, tableSelector) => {
            const closestTable = el.closest('table');
            if (!closestTable) return false;
            // Check if this td's closest table matches our target table
            const doc = el.ownerDocument;
            const tables = doc.querySelectorAll('table');
            let tableIndex = -1;
            tables.forEach((t, i) => { if (t === closestTable) tableIndex = i; });
            return tableSelector.includes(`nth=${tableIndex}`) || tables.length === 1;
          },
          table.selector,
        );
        if (belongsToTable) tableTds.push(td);
      }

      for (let i = 0; i < tableTds.length && i < analysis.tdInfo.length; i++) {
        const td = tableTds[i];
        const info = analysis.tdInfo[i];

        if (info.hasHeadersAttr) {
          results.push({
            ruleId: 'td-has-header',
            type: 'pass',
            message: 'Data cell has explicit headers attribute.',
            element: {
              selector: td.selector,
              html: info.html,
              boundingBox: await td.getBoundingBox(),
            },
          });
        } else if (analysis.hasHeaders) {
          results.push({
            ruleId: 'td-has-header',
            type: 'pass',
            message: 'Data cell has associated header elements in the table.',
            element: {
              selector: td.selector,
              html: info.html,
              boundingBox: await td.getBoundingBox(),
            },
          });
        } else {
          results.push({
            ruleId: 'td-has-header',
            type: 'violation',
            message: 'Data cell in a large table has no associated header. Add <th> elements or use the headers attribute.',
            element: {
              selector: td.selector,
              html: info.html,
              boundingBox: await td.getBoundingBox(),
            },
          });
        }
      }
    }

    return results;
  },
};
