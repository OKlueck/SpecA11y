import type { Rule, RuleResult } from '../../types.js';

export const meaningfulSequence: Rule = {
  meta: {
    id: 'meaningful-sequence',
    name: 'Content must have a meaningful reading sequence',
    description:
      'Heuristic check that CSS-positioned elements (absolute/fixed) with text content appear in a logical reading order in the DOM.',
    wcagCriteria: ['1.3.2'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const positioned = await context.evaluate(() => {
      const out: {
        selector: string;
        html: string;
        position: string;
        domIndex: number;
        visualTop: number;
        visualLeft: number;
        textContent: string;
      }[] = [];

      const allElements = document.querySelectorAll('*');
      let index = 0;

      allElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const pos = style.position;

        if (pos !== 'absolute' && pos !== 'fixed') {
          index++;
          return;
        }

        const text = (el.textContent ?? '').trim();
        if (!text || text.length < 2) {
          index++;
          return;
        }

        const rect = el.getBoundingClientRect();
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? `.${el.className.trim().split(/\s+/).join('.')}`
          : '';

        out.push({
          selector: `${tag}${id}${cls}`,
          html: el.outerHTML.slice(0, 200),
          position: pos,
          domIndex: index,
          visualTop: rect.top,
          visualLeft: rect.left,
          textContent: text.slice(0, 80),
        });
        index++;
      });

      return out;
    });

    // Sort by visual position (top-to-bottom, left-to-right)
    const bySortedVisual = [...positioned].sort((a, b) => {
      if (Math.abs(a.visualTop - b.visualTop) > 50) return a.visualTop - b.visualTop;
      return a.visualLeft - b.visualLeft;
    });

    for (let i = 0; i < bySortedVisual.length; i++) {
      const el = bySortedVisual[i];
      // Check if the DOM order differs significantly from visual order
      const visualRank = i;
      const domRank = positioned.findIndex((p) => p.selector === el.selector && p.domIndex === el.domIndex);

      if (Math.abs(visualRank - domRank) > 1) {
        results.push({
          ruleId: 'meaningful-sequence',
          type: 'warning',
          message: `Element with position:${el.position} may disrupt reading order. It appears at DOM position ${el.domIndex} but is visually at a different location. Review that the reading sequence remains meaningful.`,
          element: {
            selector: el.selector,
            html: el.html,
          },
        });
      }
    }

    return results;
  },
};
