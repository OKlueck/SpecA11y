import type { Rule, RuleResult } from '../../types.js';

const TEXT_BLOCK_SELECTORS = 'p a[href], li a[href], td a[href], dd a[href], blockquote a[href], div a[href]';

export const linkInTextBlock: Rule = {
  meta: {
    id: 'link-in-text-block',
    name: 'Links in text blocks must be distinguishable by more than color',
    description: 'Ensures links within blocks of text are visually distinguishable from surrounding text by means other than color alone, such as underline, border, or font-weight change.',
    wcagCriteria: ['1.4.1'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const links = await context.querySelectorAll(TEXT_BLOCK_SELECTORS);

    for (const link of links) {
      const visible = await link.isVisible();
      if (!visible) continue;

      const textDecoration = await link.getComputedStyle('text-decoration');
      const textDecorationLine = await link.getComputedStyle('text-decoration-line');
      const borderBottom = await link.getComputedStyle('border-bottom-width');
      const fontWeight = await link.getComputedStyle('font-weight');
      const outline = await link.getComputedStyle('outline-width');

      const hasUnderline = textDecoration.includes('underline') || textDecorationLine.includes('underline');
      const hasBorderBottom = parseFloat(borderBottom) > 0;
      const hasBoldWeight = parseInt(fontWeight, 10) >= 700;
      const hasOutline = parseFloat(outline) > 0;

      const isDistinguishable = hasUnderline || hasBorderBottom || hasBoldWeight || hasOutline;

      if (isDistinguishable) {
        results.push({
          ruleId: 'link-in-text-block',
          type: 'pass',
          message: 'Link in text block is visually distinguishable by more than color.',
          element: {
            selector: link.selector,
            html: await link.getOuterHTML(),
            boundingBox: await link.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'link-in-text-block',
          type: 'violation',
          message: 'Link in text block may only be distinguishable by color. Add underline, border, font-weight change, or other visual indicator.',
          element: {
            selector: link.selector,
            html: await link.getOuterHTML(),
            boundingBox: await link.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
