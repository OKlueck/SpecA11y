import type { Rule, RuleResult } from '../../types.js';

export const tableDuplicateName: Rule = {
  meta: {
    id: 'table-duplicate-name',
    name: 'Tables should not have the same summary and caption',
    description: 'Ensures data tables do not have identical summary and <caption> text, which causes screen readers to read the same text twice.',
    wcagCriteria: ['1.3.1'],
    severity: 'minor',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const tables = await context.querySelectorAll('table');

    for (const table of tables) {
      const evaluation = await context.page.locator(table.selector).evaluate((el) => {
        const summary = (el.getAttribute('summary') ?? '').trim();
        const caption = el.querySelector('caption');
        const captionText = caption ? (caption.textContent ?? '').trim() : '';

        // Only relevant when both summary and caption exist and are non-empty
        if (!summary || !captionText) {
          return { applicable: false, isDuplicate: false };
        }

        return {
          applicable: true,
          isDuplicate: summary.toLowerCase() === captionText.toLowerCase(),
        };
      });

      if (!evaluation.applicable) continue;

      if (evaluation.isDuplicate) {
        results.push({
          ruleId: 'table-duplicate-name',
          type: 'violation',
          message: 'Table has the same summary and caption text. Screen readers will read this text twice.',
          element: {
            selector: table.selector,
            html: await table.getOuterHTML(),
            boundingBox: await table.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'table-duplicate-name',
          type: 'pass',
          message: 'Table summary and caption text are different.',
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
