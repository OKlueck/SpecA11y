import type { Rule, RuleResult } from '../../types.js';

export const useOfColor: Rule = {
  meta: {
    id: 'use-of-color',
    name: 'Color must not be the only visual means of conveying information',
    description: 'Checks that links and interactive elements are distinguishable from surrounding text by more than just color (e.g. underline, font-weight, border).',
    wcagCriteria: ['1.4.1'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const flagged = await context.evaluate(() => {
      const found: Array<{
        selector: string;
        html: string;
        linkColor: string;
        parentColor: string;
      }> = [];

      const links = document.querySelectorAll('a[href]');

      for (const link of links) {
        const parent = link.parentElement;
        if (!parent) continue;

        // Skip if link or parent is not visible
        const linkStyle = window.getComputedStyle(link);
        const parentStyle = window.getComputedStyle(parent);

        if (linkStyle.display === 'none' || linkStyle.visibility === 'hidden') continue;
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') continue;

        // Skip links that are the only content in their parent (e.g. nav items)
        const parentText = parent.textContent?.trim() ?? '';
        const linkText = link.textContent?.trim() ?? '';
        if (parentText === linkText) continue;

        const linkColor = linkStyle.color;
        const parentColor = parentStyle.color;

        // Only flag if colors differ
        if (linkColor === parentColor) continue;

        // Check for visual distinguishers beyond color
        const hasUnderline = linkStyle.textDecorationLine.includes('underline');
        const parentHasUnderline = parentStyle.textDecorationLine.includes('underline');
        const underlineDiffers = hasUnderline && !parentHasUnderline;

        const linkWeight = parseInt(linkStyle.fontWeight) || 400;
        const parentWeight = parseInt(parentStyle.fontWeight) || 400;
        const weightDiffers = Math.abs(linkWeight - parentWeight) >= 200;

        const linkBg = linkStyle.backgroundColor;
        const parentBg = parentStyle.backgroundColor;
        const bgDiffers = linkBg !== parentBg &&
          !/rgba\([^)]+,\s*0\)/.test(linkBg); // ignore transparent

        const hasBorder = linkStyle.borderBottomStyle !== 'none' &&
          linkStyle.borderBottomWidth !== '0px';

        const hasOutline = linkStyle.outlineStyle !== 'none' &&
          linkStyle.outlineWidth !== '0px';

        // If no visual distinguisher besides color, flag it
        if (!underlineDiffers && !weightDiffers && !bgDiffers && !hasBorder && !hasOutline) {
          const tag = 'a';
          const id = link.id ? `#${link.id}` : '';
          found.push({
            selector: tag + id,
            html: link.outerHTML.slice(0, 200),
            linkColor,
            parentColor,
          });
        }
      }

      return found;
    });

    for (const item of flagged) {
      results.push({
        ruleId: 'use-of-color',
        type: 'warning',
        message: `Link is only distinguished from surrounding text by color (${item.linkColor} vs ${item.parentColor}). Add underline, font-weight, border, or other non-color visual indicator.`,
        element: { selector: item.selector, html: item.html },
      });
    }

    return results;
  },
};
