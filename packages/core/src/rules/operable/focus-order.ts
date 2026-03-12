import type { Rule, RuleResult } from '../../types.js';

export const focusOrder: Rule = {
  meta: {
    id: 'focus-order',
    name: 'Focus order should follow visual layout',
    description: 'Tabs through focusable elements and verifies that the focus order follows a logical top-to-bottom, left-to-right visual sequence.',
    wcagCriteria: ['2.4.3'],
    severity: 'serious',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const page = context.page;
    const maxElements = 50;

    // Tab through focusable elements and record their positions
    const focusedPositions: {
      index: number;
      selector: string;
      html: string;
      box: { x: number; y: number; width: number; height: number };
    }[] = [];

    // Start from the beginning of the page
    await page.keyboard.press('Tab');

    for (let i = 0; i < maxElements; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return null;

        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? `.${el.className.trim().split(/\s+/).join('.')}`
          : '';

        return {
          selector: `${tag}${id}${cls}`,
          html: el.outerHTML.slice(0, 200),
          box: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
        };
      });

      if (!info) break;

      // Stop if we've looped back to a previously focused element
      if (focusedPositions.length > 0) {
        const first = focusedPositions[0];
        if (info.selector === first.selector && info.box.x === first.box.x && info.box.y === first.box.y) {
          break;
        }
      }

      focusedPositions.push({ index: i, ...info });

      await page.keyboard.press('Tab');
    }

    if (focusedPositions.length < 2) {
      return results;
    }

    // Check for significant order violations
    // A violation is when focus jumps significantly backward (upward) in the page
    const ROW_THRESHOLD = 50; // pixels - elements within this vertical range are considered same row

    for (let i = 1; i < focusedPositions.length; i++) {
      const prev = focusedPositions[i - 1];
      const curr = focusedPositions[i];

      const prevCenterY = prev.box.y + prev.box.height / 2;
      const currCenterY = curr.box.y + curr.box.height / 2;
      const prevCenterX = prev.box.x + prev.box.width / 2;
      const currCenterX = curr.box.x + curr.box.width / 2;

      // Check if focus jumped significantly backward (up the page)
      const jumpedUp = currCenterY < prevCenterY - ROW_THRESHOLD;

      // Check if on same row but jumped backward (right-to-left)
      const sameRow = Math.abs(currCenterY - prevCenterY) <= ROW_THRESHOLD;
      const jumpedLeft = sameRow && currCenterX < prevCenterX - ROW_THRESHOLD;

      if (jumpedUp || jumpedLeft) {
        results.push({
          ruleId: 'focus-order',
          type: 'warning',
          message: `Focus order may not follow visual layout: element ${i + 1} (at y:${Math.round(currCenterY)}, x:${Math.round(currCenterX)}) appears before element ${i} (at y:${Math.round(prevCenterY)}, x:${Math.round(prevCenterX)}) visually but receives focus after it.`,
          element: {
            selector: curr.selector,
            html: curr.html,
            boundingBox: curr.box,
          },
        });
      }
    }

    return results;
  },
};
