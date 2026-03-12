import type { Rule, RuleResult } from '../../types.js';

export const pAsHeading: Rule = {
  meta: {
    id: 'p-as-heading',
    name: 'Paragraphs should not be styled to look like headings',
    description: 'Checks for <p> elements that are styled with large font-size, bold weight, and short text, which suggests they should be headings instead.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
    tags: ['experimental'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const paragraphs = await context.querySelectorAll('p');

    // Get base body font size for comparison
    let bodyFontSize = 16;
    const bodyElements = await context.querySelectorAll('body');
    if (bodyElements.length > 0) {
      const bodyFontStr = await bodyElements[0].getComputedStyle('font-size');
      const parsed = parseFloat(bodyFontStr);
      if (!isNaN(parsed)) {
        bodyFontSize = parsed;
      }
    }

    for (const p of paragraphs) {
      const textContent = await p.getTextContent();
      if (!textContent || !textContent.trim()) continue;

      const visible = await p.isVisible();
      if (!visible) continue;

      const trimmedText = textContent.trim();

      // Skip if text is too long to be a heading
      if (trimmedText.length >= 50) continue;

      const fontSizeStr = await p.getComputedStyle('font-size');
      const fontWeightStr = await p.getComputedStyle('font-weight');

      const fontSize = parseFloat(fontSizeStr);
      const fontWeight = parseInt(fontWeightStr, 10);
      const isBold = fontWeight >= 700 || fontWeightStr === 'bold' || fontWeightStr === 'bolder';
      const isLargeFont = fontSize >= bodyFontSize * 1.5;

      if (isLargeFont && isBold) {
        results.push({
          ruleId: 'p-as-heading',
          type: 'violation',
          message: `Paragraph appears to be styled as a heading (font-size: ${fontSize}px, font-weight: ${fontWeight}, text length: ${trimmedText.length} chars). Use a proper heading element (h1-h6) instead.`,
          element: {
            selector: p.selector,
            html: await p.getOuterHTML(),
            boundingBox: await p.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
