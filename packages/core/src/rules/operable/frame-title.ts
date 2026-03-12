import type { Rule, RuleResult } from '../../types.js';

export const frameTitle: Rule = {
  meta: {
    id: 'frame-title',
    name: 'Frames must have a title attribute',
    description: 'Ensures <iframe> and <frame> elements have a non-empty title attribute.',
    wcagCriteria: ['2.4.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const frames = await context.querySelectorAll('iframe, frame');

    for (const frame of frames) {
      const title = await frame.getAttribute('title');

      if (title && title.trim()) {
        results.push({
          ruleId: 'frame-title',
          type: 'pass',
          message: `Frame has title: "${title.trim()}"`,
          element: {
            selector: frame.selector,
            html: await frame.getOuterHTML(),
            boundingBox: await frame.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'frame-title',
          type: 'violation',
          message: 'Frame element does not have a non-empty title attribute.',
          element: {
            selector: frame.selector,
            html: await frame.getOuterHTML(),
            boundingBox: await frame.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
