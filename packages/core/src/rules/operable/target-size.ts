import type { Rule, RuleResult } from '../../types.js';

export const targetSize: Rule = {
  meta: {
    id: 'target-size',
    name: 'Interactive targets must have a minimum size',
    description: 'Ensures interactive targets have a minimum size of 24x24 CSS pixels or sufficient spacing (WCAG 2.2 Success Criterion 2.5.8 Target Size (Minimum)).',
    wcagCriteria: ['2.5.8'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const selectors = 'button, a[href], input, select, textarea, [tabindex]';
    const elements = await context.querySelectorAll(selectors);

    for (const el of elements) {
      const box = await el.getBoundingBox();
      if (!box) continue;

      const { width, height } = box;
      
      // WCAG 2.2 2.5.8: Minimum target size is 24x24 CSS pixels
      // Exception: Inline text, link within text, etc. (simplified for this rule)
      if (width < 24 || height < 24) {
        results.push({
          ruleId: 'target-size',
          type: 'warning',
          message: `Interactive target is too small (${Math.round(width)}x${Math.round(height)}px). Target size must be at least 24x24 CSS pixels unless it meets spacing or other exceptions.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: box,
          },
        });
      } else {
        results.push({
          ruleId: 'target-size',
          type: 'pass',
          message: `Target size is sufficient (${Math.round(width)}x${Math.round(height)}px).`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: box,
          },
        });
      }
    }

    return results;
  },
};
