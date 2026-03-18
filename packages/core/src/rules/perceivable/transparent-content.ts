import type { Rule, RuleResult } from '../../types.js';

const TEXT_CONTAINERS = 'p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6, button, div, main, section, article';

interface TransparencyIssue {
  type: 'transparent-color' | 'negative-letter-spacing' | 'negative-word-spacing' | 'low-opacity';
  detail: string;
}

export const transparentContent: Rule = {
  meta: {
    id: 'transparent-content',
    name: 'Text must not be made invisible via transparent color, low opacity, or extreme spacing',
    description:
      'Detects text elements with color: transparent, rgba with alpha 0, low effective opacity (CSS opacity or filter: opacity()), or extremely negative letter-spacing/word-spacing that makes text unreadable.',
    wcagCriteria: ['1.4.3'],
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

      const issue: TransparencyIssue | null = await context.page.locator(el.selector).evaluate((node) => {
        const cs = window.getComputedStyle(node);

        // Check for transparent color (alpha channel 0 or near 0)
        const color = cs.color;
        if (color) {
          // Match rgba(r, g, b, a) format
          const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
          if (rgbaMatch) {
            const parts = rgbaMatch[1].split(',').map((s) => s.trim());
            if (parts.length === 4) {
              const alpha = parseFloat(parts[3]);
              if (alpha < 0.05) {
                return {
                  type: 'transparent-color' as const,
                  detail: `color: ${color}`,
                };
              }
            }
          }
          // "transparent" keyword is computed as rgba(0, 0, 0, 0)
        }

        // Check for extremely negative letter-spacing
        const letterSpacing = cs.letterSpacing;
        if (letterSpacing && letterSpacing !== 'normal') {
          const fontSize = parseFloat(cs.fontSize) || 16;
          const lsValue = parseFloat(letterSpacing);
          // Convert to em-equivalent
          if (lsValue / fontSize < -0.5) {
            return {
              type: 'negative-letter-spacing' as const,
              detail: `letter-spacing: ${letterSpacing} (${(lsValue / fontSize).toFixed(2)}em relative to font-size)`,
            };
          }
        }

        // Check for extremely negative word-spacing
        const wordSpacing = cs.wordSpacing;
        if (wordSpacing && wordSpacing !== 'normal') {
          const fontSize = parseFloat(cs.fontSize) || 16;
          const wsValue = parseFloat(wordSpacing);
          if (wsValue / fontSize < -0.5) {
            return {
              type: 'negative-word-spacing' as const,
              detail: `word-spacing: ${wordSpacing} (${(wsValue / fontSize).toFixed(2)}em relative to font-size)`,
            };
          }
        }

        // Check for low effective opacity (CSS opacity + filter: opacity())
        let effectiveOpacity = 1;
        let current: Element | null = node;
        while (current) {
          const ancestorCs = window.getComputedStyle(current);
          effectiveOpacity *= parseFloat(ancestorCs.opacity);
          if (ancestorCs.filter && ancestorCs.filter !== 'none') {
            const opMatch = ancestorCs.filter.match(/opacity\(([^)]+)\)/);
            if (opMatch) {
              const val = parseFloat(opMatch[1]);
              effectiveOpacity *= opMatch[1].includes('%') ? val / 100 : val;
            }
          }
          current = current.parentElement;
        }
        if (effectiveOpacity < 0.3) {
          return {
            type: 'low-opacity' as const,
            detail: `effective opacity: ${effectiveOpacity.toFixed(3)} (content nearly invisible)`,
          };
        }

        return null;
      });

      if (issue) {
        results.push({
          ruleId: 'transparent-content',
          type: 'violation',
          message: `Text is made invisible or unreadable via CSS: ${issue.detail}. This hides content from sighted users while it may still be in the DOM.`,
          element: el.toTarget(await el.getOuterHTML(), await el.getBoundingBox()),
        });
      }
    }

    return results;
  },
};
