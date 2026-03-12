import type { Rule, RuleResult } from '../../types.js';

export const metaViewportLarge: Rule = {
  meta: {
    id: 'meta-viewport-large',
    name: 'Viewport meta should allow scaling to at least 500%',
    description: 'Ensures <meta name="viewport"> does not restrict maximum-scale below 5, allowing users to zoom to at least 500%.',
    wcagCriteria: ['best-practice'],
    severity: 'minor',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const metas = await context.querySelectorAll('meta[name="viewport"]');

    for (const meta of metas) {
      const content = await meta.getAttribute('content');

      if (!content) {
        results.push({
          ruleId: 'meta-viewport-large',
          type: 'pass',
          message: 'Meta viewport has no content attribute restricting scale.',
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
            boundingBox: await meta.getBoundingBox(),
          },
        });
        continue;
      }

      const contentLower = content.toLowerCase().replace(/\s/g, '');
      const maxScaleMatch = contentLower.match(/maximum-scale=(\d+\.?\d*)/);

      if (maxScaleMatch) {
        const maxScale = parseFloat(maxScaleMatch[1]);

        if (maxScale < 5) {
          results.push({
            ruleId: 'meta-viewport-large',
            type: 'violation',
            message: `Meta viewport sets maximum-scale=${maxScale}, which is below 5. Allow scaling to at least 500% for users who need significant magnification.`,
            element: {
              selector: meta.selector,
              html: await meta.getOuterHTML(),
              boundingBox: await meta.getBoundingBox(),
            },
          });
        } else {
          results.push({
            ruleId: 'meta-viewport-large',
            type: 'pass',
            message: `Meta viewport allows scaling to ${maxScale * 100}%.`,
            element: {
              selector: meta.selector,
              html: await meta.getOuterHTML(),
              boundingBox: await meta.getBoundingBox(),
            },
          });
        }
      } else {
        results.push({
          ruleId: 'meta-viewport-large',
          type: 'pass',
          message: 'Meta viewport does not restrict maximum-scale.',
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
