import type { Rule, RuleResult } from '../../types.js';

export const areaAlt: Rule = {
  meta: {
    id: 'area-alt',
    name: 'Area elements in image maps must have alternate text',
    description: 'Ensures <area> elements in image maps have alt text or aria-label.',
    wcagCriteria: ['1.1.1'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const areas = await context.querySelectorAll('area');

    for (const area of areas) {
      const alt = await area.getAttribute('alt');
      const ariaLabel = await area.getAttribute('aria-label');
      const ariaLabelledBy = await area.getAttribute('aria-labelledby');

      const hasAlt = alt !== null && alt !== undefined && alt !== '';
      const hasAriaLabel = !!ariaLabel;
      const hasAriaLabelledBy = !!ariaLabelledBy;

      if (hasAlt || hasAriaLabel || hasAriaLabelledBy) {
        results.push({
          ruleId: 'area-alt',
          type: 'pass',
          message: 'Area element has alternative text.',
          element: {
            selector: area.selector,
            html: await area.getOuterHTML(),
            boundingBox: await area.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'area-alt',
          type: 'violation',
          message: 'Area element in an image map is missing alternative text. Add an alt attribute or aria-label.',
          element: {
            selector: area.selector,
            html: await area.getOuterHTML(),
            boundingBox: await area.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
