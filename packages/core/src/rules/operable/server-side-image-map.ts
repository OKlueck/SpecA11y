import type { Rule, RuleResult } from '../../types.js';

export const serverSideImageMap: Rule = {
  meta: {
    id: 'server-side-image-map',
    name: 'Server-side image maps must not be used',
    description: 'Ensures <img ismap> is not used, as server-side image maps are not keyboard accessible.',
    wcagCriteria: ['2.1.1'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const images = await context.querySelectorAll('img[ismap]');

    for (const img of images) {
      results.push({
        ruleId: 'server-side-image-map',
        type: 'violation',
        message: 'Server-side image map detected. Use a client-side image map (<map> with <area>) instead for keyboard accessibility.',
        element: {
          selector: img.selector,
          html: await img.getOuterHTML(),
          boundingBox: await img.getBoundingBox(),
        },
      });
    }

    return results;
  },
};
