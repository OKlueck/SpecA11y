import type { Rule, RuleResult } from '../../types.js';

export const cssOrientationLock: Rule = {
  meta: {
    id: 'css-orientation-lock',
    name: 'Content must not be locked to a specific display orientation',
    description: 'Checks for CSS media queries that restrict content to a specific orientation by hiding or transforming content based on portrait or landscape orientation.',
    wcagCriteria: ['1.3.4'],
    severity: 'serious',
    confidence: 'possible',
    type: 'dom',
    tags: ['experimental'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const styleElements = await context.querySelectorAll('style');

    for (const style of styleElements) {
      const textContent = await style.getTextContent();
      if (!textContent) continue;

      const orientationPattern = /@media[^{]*\b(orientation\s*:\s*(portrait|landscape))\b[^{]*\{[^}]*(display\s*:\s*none|transform\s*:\s*rotate)/i;
      const match = textContent.match(orientationPattern);

      if (match) {
        const orientation = match[2];
        results.push({
          ruleId: 'css-orientation-lock',
          type: 'violation',
          message: `Inline style contains an orientation media query that may lock content to ${orientation === 'portrait' ? 'landscape' : 'portrait'} mode by hiding or transforming content in ${orientation} orientation.`,
          element: {
            selector: style.selector,
            html: await style.getOuterHTML().then(h => h.substring(0, 200)),
            boundingBox: await style.getBoundingBox(),
          },
        });
      }
    }

    // Check for inline styles on elements that use orientation-based transforms
    const allElements = await context.querySelectorAll('[style]');

    for (const el of allElements) {
      const inlineStyle = await el.getAttribute('style');
      if (!inlineStyle) continue;

      const hasRotate90 = /transform\s*:\s*rotate\(\s*-?90deg\s*\)/i.test(inlineStyle);
      if (hasRotate90) {
        results.push({
          ruleId: 'css-orientation-lock',
          type: 'incomplete',
          message: 'Element has a 90-degree rotation transform in inline styles. Verify this is not used to lock content orientation.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML().then(h => h.substring(0, 200)),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
