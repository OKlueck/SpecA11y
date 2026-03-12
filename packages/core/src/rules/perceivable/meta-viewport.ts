import type { Rule, RuleResult } from '../../types.js';

export const metaViewport: Rule = {
  meta: {
    id: 'meta-viewport',
    name: 'Meta viewport must not disable user scaling',
    description: 'Ensures <meta name="viewport"> does not set maximum-scale=1 or user-scalable=no, which prevents zooming.',
    wcagCriteria: ['1.4.4'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const metas = await context.querySelectorAll('meta[name="viewport"]');

    for (const meta of metas) {
      const content = await meta.getAttribute('content');

      if (!content) {
        results.push({
          ruleId: 'meta-viewport',
          type: 'pass',
          message: 'Meta viewport has no content attribute.',
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
            boundingBox: await meta.getBoundingBox(),
          },
        });
        continue;
      }

      const contentLower = content.toLowerCase().replace(/\s/g, '');
      const hasUserScalableNo = /user-scalable=no/.test(contentLower);
      const hasMaxScaleOne = /maximum-scale=1(\.0)?(?!\d)/.test(contentLower);

      const violations: string[] = [];
      if (hasUserScalableNo) {
        violations.push('user-scalable=no');
      }
      if (hasMaxScaleOne) {
        violations.push('maximum-scale=1');
      }

      if (violations.length > 0) {
        results.push({
          ruleId: 'meta-viewport',
          type: 'violation',
          message: `Meta viewport disables user scaling with ${violations.join(' and ')}. Users must be able to zoom.`,
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
            boundingBox: await meta.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'meta-viewport',
          type: 'pass',
          message: 'Meta viewport does not restrict user scaling.',
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
            boundingBox: await meta.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
