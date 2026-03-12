import type { Rule, RuleResult } from '../../types.js';

export const videoCaption: Rule = {
  meta: {
    id: 'video-caption',
    name: 'Video elements must have captions',
    description: 'Ensures <video> elements have a <track kind="captions"> child for accessibility.',
    wcagCriteria: ['1.2.2'],
    severity: 'critical',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const videos = await context.querySelectorAll('video');

    for (const video of videos) {
      const hasCaptionTrack = await context.page.locator(video.selector).evaluate((el) => {
        const tracks = el.querySelectorAll('track[kind="captions"]');
        return tracks.length > 0;
      });

      if (hasCaptionTrack) {
        results.push({
          ruleId: 'video-caption',
          type: 'pass',
          message: 'Video element has a captions track.',
          element: {
            selector: video.selector,
            html: await video.getOuterHTML(),
            boundingBox: await video.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'video-caption',
          type: 'violation',
          message: 'Video element is missing captions. Add a <track kind="captions"> element.',
          element: {
            selector: video.selector,
            html: await video.getOuterHTML(),
            boundingBox: await video.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
