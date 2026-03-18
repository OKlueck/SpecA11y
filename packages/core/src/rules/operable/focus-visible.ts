import type { Rule, RuleResult } from '../../types.js';
import { decodePNG, countDifferentPixels } from '../../utils/visual.js';

const FOCUSABLE_SELECTOR = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
const MAX_ELEMENTS = 30;
const EXPAND_PX = 6;
const MIN_CHANGED_PIXELS = 20;
const TIME_LIMIT = 8000;

export const focusVisible: Rule = {
  meta: {
    id: 'focus-visible',
    name: 'Focusable elements should have visible focus indicators',
    description: 'Takes before/after focus screenshots to verify that focusable elements have a visible focus indicator, not just a CSS outline check.',
    wcagCriteria: ['2.4.7'],
    severity: 'serious',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const page = context.page;
    const startTime = Date.now();

    const elements = await context.querySelectorAll(FOCUSABLE_SELECTOR);

    // Phase 1: CSS pre-filter — elements with visible outline pass immediately
    const needsScreenshot: typeof elements = [];

    for (const el of elements) {
      if (needsScreenshot.length >= MAX_ELEMENTS) break;

      const visible = await el.isVisible();
      if (!visible) continue;

      const box = await el.getBoundingBox();
      if (!box || box.width < 2 || box.height < 2) continue;

      const outlineStyle = await el.getComputedStyle('outline-style');
      const outlineWidth = await el.getComputedStyle('outline-width');

      const hasOutline = outlineStyle !== 'none' && outlineWidth !== '0px';

      if (hasOutline) {
        results.push({
          ruleId: 'focus-visible',
          type: 'pass',
          message: 'Element has a visible outline style.',
          element: {
            selector: el.selector,
            cssSelector: el.cssSelector,
            accessibleName: el.accessibleName,
            role: el.role,
            html: await el.getOuterHTML(),
            boundingBox: box,
          },
        });
      } else {
        needsScreenshot.push(el);
      }
    }

    // Phase 2: Screenshot comparison for elements with suppressed outline
    let screenshotChecked = 0;
    const violations: RuleResult[] = [];

    for (const el of needsScreenshot) {
      if (Date.now() - startTime > TIME_LIMIT) {
        results.push({
          ruleId: 'focus-visible',
          type: 'incomplete',
          message: `Focus visibility check timed out after ${screenshotChecked} screenshot comparisons. Manual review recommended for remaining elements.`,
        });
        break;
      }

      const box = await el.getBoundingBox();
      if (!box || box.width < 2 || box.height < 2) continue;

      screenshotChecked++;

      const clip = {
        x: Math.max(0, box.x - EXPAND_PX),
        y: Math.max(0, box.y - EXPAND_PX),
        width: box.width + EXPAND_PX * 2,
        height: box.height + EXPAND_PX * 2,
      };

      try {
        // Screenshot before focus - round clip values for Playwright
        clip.x = Math.round(clip.x);
        clip.y = Math.round(clip.y);
        clip.width = Math.round(clip.width);
        clip.height = Math.round(clip.height);
        const beforeBuf = await page.screenshot({ clip, type: 'png' });

        // Focus the element
        await page.locator(el.selector).focus();
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

        if (changedPixels < MIN_CHANGED_PIXELS) {
          violations.push({
            ruleId: 'focus-visible',
            type: 'violation',
            message: `No visible focus indicator detected. Outline is suppressed and no alternative focus style was found (${changedPixels} pixels changed on focus).`,
            element: {
              selector: el.selector,
              cssSelector: el.cssSelector,
              accessibleName: el.accessibleName,
              role: el.role,
              html: await el.getOuterHTML(),
              boundingBox: box,
            },
          });
        } else {
          results.push({
            ruleId: 'focus-visible',
            type: 'pass',
            message: `Alternative focus style present (${changedPixels} pixels changed on focus).`,
            element: {
              selector: el.selector,
              cssSelector: el.cssSelector,
              accessibleName: el.accessibleName,
              role: el.role,
              html: await el.getOuterHTML(),
              boundingBox: box,
            },
          });
        }
      } catch (err) {
        // Screenshot or focus failed — report as incomplete
        violations.push({
          ruleId: 'focus-visible',
          type: 'incomplete',
          message: `Could not perform screenshot comparison: ${err instanceof Error ? err.message : String(err)}`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML().catch(() => ''),
          },
        });
      }
    }

    results.push(...violations);

    // Phase 3: Sampling limit note
    if (elements.length > MAX_ELEMENTS) {
      const unchecked = elements.length - MAX_ELEMENTS;
      results.push({
        ruleId: 'focus-visible',
        type: 'incomplete',
        message: `Page has ${elements.length} focusable elements. Only ${MAX_ELEMENTS} were checked; ${unchecked} require manual review.`,
      });
    }

    return results;
  },
};
