import type { Rule, RuleResult } from '../../types.js';

const TEXT_CONTAINERS = 'p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6, button, div, main, section, article';

interface DistortionIssue {
  type: 'extreme-rotation' | 'bidi-override';
  detail: string;
}

export const cssTextDistortion: Rule = {
  meta: {
    id: 'css-text-distortion',
    name: 'Text must not be distorted to be unreadable via CSS',
    description:
      'Detects CSS properties that make text unreadable: extreme rotation (>45°) or direction:rtl with unicode-bidi:bidi-override on Latin text.',
    wcagCriteria: ['1.4.3', '1.3.2'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll(TEXT_CONTAINERS);

    for (const el of elements) {
      const textContent = await el.getTextContent();
      if (!textContent.trim()) continue;

      const visible = await el.isVisible();
      if (!visible) continue;

      const issue: DistortionIssue | null = await context.page.locator(el.selector).evaluate((node) => {
        const cs = window.getComputedStyle(node);

        // Check transform for extreme rotation
        const transform = cs.transform;
        if (transform && transform !== 'none') {
          const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
          if (matrixMatch) {
            const values = matrixMatch[1].split(',').map(Number);
            // matrix(a, b, c, d, tx, ty) — rotation angle = atan2(b, a)
            const angle = Math.abs(Math.atan2(values[1], values[0]) * (180 / Math.PI));
            if (angle > 45) {
              return {
                type: 'extreme-rotation' as const,
                detail: `transform rotation of ${Math.round(angle)}°`,
              };
            }
          }
        }

        // Check bidi-override on Latin text
        const direction = cs.direction;
        const unicodeBidi = cs.unicodeBidi;
        if (direction === 'rtl' && (unicodeBidi === 'bidi-override' || unicodeBidi === 'isolate-override')) {
          const text = (node.textContent ?? '').trim();
          // Check if text contains mostly Latin characters
          const latinChars = (text.match(/[a-zA-Z]/g) ?? []).length;
          if (latinChars > text.length * 0.5) {
            return {
              type: 'bidi-override' as const,
              detail: `direction: rtl with unicode-bidi: ${unicodeBidi} on Latin text`,
            };
          }
        }

        return null;
      });

      if (issue) {
        results.push({
          ruleId: 'css-text-distortion',
          type: 'violation',
          message: `Text is distorted and unreadable via CSS: ${issue.detail}. This makes content inaccessible to sighted users.`,
          element: el.toTarget(await el.getOuterHTML(), await el.getBoundingBox()),
        });
      }
    }

    return results;
  },
};
