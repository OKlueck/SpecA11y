import type { Rule, RuleResult } from '../../types.js';

const TEXT_CONTAINERS = 'p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6, button, div, main, section, article';

interface VisibilityIssue {
  type: 'opacity-filter' | 'tiny-font' | 'scale-zero' | 'clip-hidden';
  detail: string;
}

export const cssContentVisibility: Rule = {
  meta: {
    id: 'css-content-visibility',
    name: 'Content must not be made invisible via CSS tricks',
    description:
      'Detects CSS properties that make content invisible while keeping it in the DOM: filter opacity below threshold, font-size below 4px, transform scale(0), or clip-path hiding.',
    wcagCriteria: ['1.4.3', '1.4.4'],
    severity: 'critical',
    confidence: 'certain',
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

      // Run all visibility checks in a single browser evaluate call
      const issue: VisibilityIssue | null = await context.page.locator(el.selector).evaluate((node) => {
        const cs = window.getComputedStyle(node);

        // Check filter: opacity() on element and ancestors
        let current: Element | null = node;
        while (current) {
          const filter = window.getComputedStyle(current).filter;
          if (filter && filter !== 'none') {
            const opacityMatch = filter.match(/opacity\(([^)]+)\)/);
            if (opacityMatch) {
              const value = parseFloat(opacityMatch[1]);
              // Values can be 0-1 or 0%-100%
              const normalized = opacityMatch[1].includes('%') ? value / 100 : value;
              if (normalized < 0.3) {
                return {
                  type: 'opacity-filter' as const,
                  detail: `filter: opacity(${opacityMatch[1]}) on ${current.tagName.toLowerCase()}`,
                };
              }
            }
          }
          // Also check the opacity property itself
          const opacity = parseFloat(window.getComputedStyle(current).opacity);
          if (opacity < 0.3 && opacity >= 0) {
            return {
              type: 'opacity-filter' as const,
              detail: `opacity: ${opacity} on ${current.tagName.toLowerCase()}`,
            };
          }
          current = current.parentElement;
        }

        // Check font-size below 4px
        const fontSize = parseFloat(cs.fontSize);
        if (fontSize < 4) {
          return {
            type: 'tiny-font' as const,
            detail: `font-size: ${cs.fontSize}`,
          };
        }

        // Check transform: scale(0) or extremely small
        const transform = cs.transform;
        if (transform && transform !== 'none') {
          // CSS matrix(a, b, c, d, tx, ty) — scale is encoded in a and d
          const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
          if (matrixMatch) {
            const values = matrixMatch[1].split(',').map(Number);
            const scaleX = Math.abs(values[0]);
            const scaleY = Math.abs(values[3]);
            if (scaleX < 0.1 || scaleY < 0.1) {
              return {
                type: 'scale-zero' as const,
                detail: `transform scale too small (scaleX: ${scaleX.toFixed(2)}, scaleY: ${scaleY.toFixed(2)})`,
              };
            }
          }
        }

        // Check clip-path that hides content
        const clipPath = cs.clipPath;
        if (clipPath && clipPath !== 'none') {
          if (clipPath === 'inset(100%)' || clipPath === 'inset(50%)' || clipPath === 'circle(0)' || clipPath === 'circle(0px)') {
            return {
              type: 'clip-hidden' as const,
              detail: `clip-path: ${clipPath}`,
            };
          }
        }

        return null;
      });

      if (issue) {
        results.push({
          ruleId: 'css-content-visibility',
          type: 'violation',
          message: `Content is made invisible via CSS: ${issue.detail}. This hides content from sighted users while it may still appear in the DOM.`,
          element: el.toTarget(await el.getOuterHTML(), await el.getBoundingBox()),
        });
      }
    }

    return results;
  },
};
