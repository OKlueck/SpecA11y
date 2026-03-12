import type { Rule, RuleResult } from '../../types.js';

export const hiddenContent: Rule = {
  meta: {
    id: 'hidden-content',
    name: 'Hidden content should be reviewed for accessibility',
    description: 'Informs about content hidden via CSS (display:none, visibility:hidden) or the hidden attribute that may need manual review to ensure important content is not inaccessible.',
    wcagCriteria: ['best-practice'],
    severity: 'minor',
    confidence: 'possible',
    type: 'dom',
    tags: ['experimental'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const hiddenElements = await context.querySelectorAll('[hidden], [aria-hidden="true"]');

    for (const el of hiddenElements) {
      const textContent = await el.getTextContent();
      if (!textContent || !textContent.trim()) continue;

      results.push({
        ruleId: 'hidden-content',
        type: 'incomplete',
        message: 'Element is hidden but contains text content. Verify that this content does not need to be accessible to users.',
        element: {
          selector: el.selector,
          html: await el.getOuterHTML().then(h => h.substring(0, 200)),
          boundingBox: await el.getBoundingBox(),
        },
      });
    }

    // Check elements with display:none or visibility:hidden via inline styles
    const styledElements = await context.querySelectorAll('[style]');

    for (const el of styledElements) {
      const style = await el.getAttribute('style');
      if (!style) continue;

      const isHidden = /display\s*:\s*none/i.test(style) || /visibility\s*:\s*hidden/i.test(style);
      if (!isHidden) continue;

      const textContent = await el.getTextContent();
      if (!textContent || !textContent.trim()) continue;

      results.push({
        ruleId: 'hidden-content',
        type: 'incomplete',
        message: 'Element is hidden via inline CSS but contains text content. Verify that this content does not need to be accessible to users.',
        element: {
          selector: el.selector,
          html: await el.getOuterHTML().then(h => h.substring(0, 200)),
          boundingBox: await el.getBoundingBox(),
        },
      });
    }

    return results;
  },
};
