import type { Rule, RuleResult } from '../../types.js';

export const headingOrder: Rule = {
  meta: {
    id: 'heading-order',
    name: 'Heading levels should not skip',
    description: 'Ensures heading levels (h1-h6) increase sequentially without skipping levels.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const headings = await context.querySelectorAll('h1, h2, h3, h4, h5, h6');

    let previousLevel = 0;

    for (const heading of headings) {
      const outerHTML = await heading.getOuterHTML();
      const tagMatch = outerHTML.match(/^<h([1-6])/i);
      const level = tagMatch ? parseInt(tagMatch[1], 10) : 0;

      if (level === 0) continue;

      if (previousLevel > 0 && level > previousLevel + 1) {
        results.push({
          ruleId: 'heading-order',
          type: 'violation',
          message: `Heading level h${level} skips from h${previousLevel}. Heading levels should increase by one.`,
          element: {
            selector: heading.selector,
            html: outerHTML,
            boundingBox: await heading.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'heading-order',
          type: 'pass',
          message: `Heading level h${level} follows correct order.`,
          element: {
            selector: heading.selector,
            html: outerHTML,
            boundingBox: await heading.getBoundingBox(),
          },
        });
      }

      previousLevel = level;
    }

    return results;
  },
};
