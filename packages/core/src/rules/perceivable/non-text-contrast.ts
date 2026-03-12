import type { Rule, RuleResult } from '../../types.js';
import { decodePNG, sampleBorderPixels, averageColor } from '../../utils/visual.js';
import { contrastRatio } from '../../utils/color.js';
import type { RGB } from '../../utils/color.js';

const UI_SELECTOR = [
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'button',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="slider"]',
  '[role="switch"]',
  '[role="tab"]',
].join(', ');

const MAX_ELEMENTS = 40;
const REQUIRED_RATIO = 3;
const EXPAND_PX = 6;

function medianColor(colors: RGB[]): RGB {
  if (colors.length === 0) return { r: 0, g: 0, b: 0 };
  const sorted = [...colors].sort((a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b));
  return sorted[Math.floor(sorted.length / 2)];
}

export const nonTextContrast: Rule = {
  meta: {
    id: 'non-text-contrast',
    name: 'UI components must have sufficient non-text contrast',
    description: 'Ensures visual boundaries of UI components (inputs, buttons, checkboxes) have at least 3:1 contrast ratio against adjacent colors.',
    wcagCriteria: ['1.4.11'],
    severity: 'serious',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const page = context.page;
    const elements = await context.querySelectorAll(UI_SELECTOR);

    let checked = 0;

    for (const el of elements) {
      if (checked >= MAX_ELEMENTS) break;

      const visible = await el.isVisible();
      if (!visible) continue;

      const box = await el.getBoundingBox();
      if (!box || box.width < 4 || box.height < 4) continue;

      checked++;

      // Capture a screenshot with padding around the element
      const clip = {
        x: Math.max(0, box.x - EXPAND_PX),
        y: Math.max(0, box.y - EXPAND_PX),
        width: box.width + EXPAND_PX * 2,
        height: box.height + EXPAND_PX * 2,
      };

      try {
        const screenshot = await page.screenshot({ clip, type: 'png' });
        const img = decodePNG(screenshot);

        // Element position within the screenshot
        const elX = EXPAND_PX;
        const elY = EXPAND_PX;
        const elW = Math.round(box.width);
        const elH = Math.round(box.height);

        // Sample the element's border pixels
        const borderColors = sampleBorderPixels(img, elX, elY, elW, elH, 2);
        if (borderColors.length === 0) continue;

        const borderColor = medianColor(borderColors);

        // Sample the surrounding background (padding area)
        const bgTop = averageColor(img, 0, 0, img.width, EXPAND_PX);
        const bgBottom = averageColor(img, 0, img.height - EXPAND_PX, img.width, EXPAND_PX);
        const bgColor: RGB = {
          r: Math.round((bgTop.r + bgBottom.r) / 2),
          g: Math.round((bgTop.g + bgBottom.g) / 2),
          b: Math.round((bgTop.b + bgBottom.b) / 2),
        };

        const ratio = contrastRatio(borderColor, bgColor);

        if (ratio < REQUIRED_RATIO) {
          results.push({
            ruleId: 'non-text-contrast',
            type: 'violation',
            message: `UI component border contrast is ${ratio.toFixed(2)}:1, below the 3:1 requirement.`,
            element: {
              selector: el.selector,
              html: await el.getOuterHTML(),
              boundingBox: box,
            },
          });
        } else {
          results.push({
            ruleId: 'non-text-contrast',
            type: 'pass',
            message: `UI component border contrast is ${ratio.toFixed(2)}:1.`,
            element: {
              selector: el.selector,
              html: await el.getOuterHTML(),
              boundingBox: box,
            },
          });
        }
      } catch {
        // Screenshot or decode failed — skip this element
      }
    }

    return results;
  },
};
