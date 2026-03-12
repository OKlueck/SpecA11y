import type { Rule, RuleResult } from '../../types.js';

export const focusNotObscured: Rule = {
  meta: {
    id: 'focus-not-obscured',
    name: 'Focused elements must not be fully obscured',
    description: 'Checks that focused interactive elements are not hidden behind fixed/sticky positioned elements.',
    wcagCriteria: ['2.4.11'],
    severity: 'serious',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Find fixed/sticky elements
    const fixedRects = await context.evaluate(() => {
      const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky') {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            rects.push({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
          }
        }
      }
      return rects;
    });

    if (fixedRects.length === 0) return results;

    // Tab through elements and check for overlap
    const page = context.page;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');

      const focusedInfo = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const rect = el.getBoundingClientRect();
        return {
          selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ''),
          html: el.outerHTML.slice(0, 200),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        };
      });

      if (!focusedInfo || focusedInfo.rect.width === 0) continue;

      const fr = focusedInfo.rect;
      for (const sr of fixedRects) {
        const overlapX = Math.max(0, Math.min(fr.x + fr.width, sr.x + sr.width) - Math.max(fr.x, sr.x));
        const overlapY = Math.max(0, Math.min(fr.y + fr.height, sr.y + sr.height) - Math.max(fr.y, sr.y));
        const overlapArea = overlapX * overlapY;
        const focusArea = fr.width * fr.height;

        if (focusArea > 0 && overlapArea / focusArea > 0.5) {
          results.push({
            ruleId: 'focus-not-obscured',
            type: 'warning',
            message: 'Focused element is more than 50% obscured by a fixed/sticky positioned element.',
            element: {
              selector: focusedInfo.selector,
              html: focusedInfo.html,
              boundingBox: fr,
            },
          });
          break;
        }
      }
    }

    return results;
  },
};
