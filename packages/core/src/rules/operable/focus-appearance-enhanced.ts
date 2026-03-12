import type { Rule, RuleResult } from '../../types.js';
import { decodePNG, countDifferentPixels } from '../../utils/visual.js';

const FOCUSABLE_SELECTOR = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
const MAX_ELEMENTS = 30;
const EXPAND_PX = 10;

export const focusAppearanceEnhanced: Rule = {
  meta: {
    id: 'focus-appearance',
    name: 'Focus indicators must be clearly visible',
    description: 'Takes before/after focus screenshots and verifies focus indicators change enough pixels to meet WCAG 2.4.13 area requirements.',
    wcagCriteria: ['2.4.13'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const page = context.page;
    const elements = await context.querySelectorAll(FOCUSABLE_SELECTOR);

    let checked = 0;

    for (const el of elements) {
      if (checked >= MAX_ELEMENTS) break;

      const visible = await el.isVisible();
      if (!visible) continue;

      const box = await el.getBoundingBox();
      if (!box || box.width < 2 || box.height < 2) continue;

      checked++;

      const clip = {
        x: Math.max(0, box.x - EXPAND_PX),
        y: Math.max(0, box.y - EXPAND_PX),
        width: box.width + EXPAND_PX * 2,
        height: box.height + EXPAND_PX * 2,
      };

      try {
        // Screenshot before focus
        const beforeBuf = await page.screenshot({ clip, type: 'png' });

        // Focus the element
        await page.locator(el.selector).focus();
        // Short delay for focus animations
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

        // Screenshot after focus
        const afterBuf = await page.screenshot({ clip, type: 'png' });

        // Blur to restore state
        await page.evaluate(() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        });

        const beforeImg = decodePNG(beforeBuf);
        const afterImg = decodePNG(afterBuf);

        const changedPixels = countDifferentPixels(beforeImg, afterImg, 30);

        // WCAG 2.4.13 requires the focus indicator area to be at least
        // as large as a 2px border around the element's shortest side perimeter
        // Simplified: minimum area = 2 * perimeter = 2 * 2 * (width + height)
        const perimeter = 2 * (box.width + box.height);
        const minimumArea = 2 * perimeter;

        if (changedPixels < minimumArea) {
          results.push({
            ruleId: 'focus-appearance',
            type: changedPixels === 0 ? 'violation' : 'warning',
            message: changedPixels === 0
              ? 'Element has no visible focus indicator. No visual change was detected on focus.'
              : `Focus indicator area (${changedPixels}px²) is below the minimum (${Math.round(minimumArea)}px²). The indicator should be at least a 2px border around the element.`,
            element: {
              selector: el.selector,
              html: await el.getOuterHTML(),
              boundingBox: box,
            },
          });
        } else {
          results.push({
            ruleId: 'focus-appearance',
            type: 'pass',
            message: `Focus indicator area (${changedPixels}px²) meets the minimum (${Math.round(minimumArea)}px²).`,
            element: {
              selector: el.selector,
              html: await el.getOuterHTML(),
              boundingBox: box,
            },
          });
        }
      } catch {
        // Screenshot or focus failed — skip
      }
    }

    return results;
  },
};
