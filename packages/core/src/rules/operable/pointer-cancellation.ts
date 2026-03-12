import type { Rule, RuleResult } from '../../types.js';

export const pointerCancellation: Rule = {
  meta: {
    id: 'pointer-cancellation',
    name: 'Actions should trigger on up-events, not down-events',
    description: 'Checks for elements using mousedown/touchstart handlers that may prevent pointer cancellation.',
    wcagCriteria: ['2.5.2'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const elements = await context.evaluate(() => {
      const found: Array<{ selector: string; html: string; attr: string }> = [];
      const all = document.querySelectorAll('[onmousedown], [ontouchstart]');
      for (const el of all) {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const attr = el.hasAttribute('onmousedown') ? 'onmousedown' : 'ontouchstart';
        found.push({
          selector: tag + id,
          html: el.outerHTML.slice(0, 200),
          attr,
        });
      }
      return found;
    });

    for (const el of elements) {
      results.push({
        ruleId: 'pointer-cancellation',
        type: 'warning',
        message: `Element uses ${el.attr} which fires on pointer down. Use click/mouseup/touchend for cancellable actions.`,
        element: { selector: el.selector, html: el.html },
      });
    }

    return results;
  },
};
