import type { Rule, RuleResult } from '../../types.js';

export const ariaDialogName: Rule = {
  meta: {
    id: 'aria-dialog-name',
    name: 'ARIA dialog and alertdialog must have an accessible name',
    description:
      'Ensures elements with role="dialog" or role="alertdialog" have an accessible name via aria-label or aria-labelledby.',
    wcagCriteria: [],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], dialog',
    );

    for (const el of elements) {
      const ariaLabel = await el.getAttribute('aria-label');
      const ariaLabelledby = await el.getAttribute('aria-labelledby');
      const title = await el.getAttribute('title');
      const outerHTML = await el.getOuterHTML();

      const hasName =
        (ariaLabel && ariaLabel.trim().length > 0) ||
        (ariaLabelledby && ariaLabelledby.trim().length > 0) ||
        (title && title.trim().length > 0);

      if (!hasName) {
        results.push({
          ruleId: 'aria-dialog-name',
          type: 'violation',
          message:
            'Dialog element must have an accessible name. Use aria-label or aria-labelledby to provide one.',
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-dialog-name',
          type: 'pass',
          message: 'Dialog element has an accessible name.',
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
