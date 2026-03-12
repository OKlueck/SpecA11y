import type { Rule, RuleResult } from '../../types.js';

export const draggingMovements: Rule = {
  meta: {
    id: 'dragging-movements',
    name: 'Dragging functionality must have single-pointer alternatives',
    description: 'Checks for draggable elements that may lack single-pointer alternatives.',
    wcagCriteria: ['2.5.7'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const elements = await context.evaluate(() => {
      const found: Array<{ selector: string; html: string; reason: string }> = [];
      const draggable = document.querySelectorAll('[draggable="true"], [ondrag], [ondragstart]');
      for (const el of draggable) {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        found.push({
          selector: tag + id,
          html: el.outerHTML.slice(0, 200),
          reason: 'draggable element',
        });
      }

      const sliders = document.querySelectorAll('[role="slider"]');
      for (const el of sliders) {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        found.push({
          selector: tag + id,
          html: el.outerHTML.slice(0, 200),
          reason: 'slider role',
        });
      }

      return found;
    });

    for (const el of elements) {
      results.push({
        ruleId: 'dragging-movements',
        type: 'warning',
        message: `Element uses ${el.reason}. Ensure a single-pointer alternative (e.g., click, tap) is available.`,
        element: { selector: el.selector, html: el.html },
      });
    }

    return results;
  },
};
