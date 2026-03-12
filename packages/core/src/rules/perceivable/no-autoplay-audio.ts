import type { Rule, RuleResult } from '../../types.js';

export const noAutoplayAudio: Rule = {
  meta: {
    id: 'no-autoplay-audio',
    name: 'Audio and video must not autoplay without muted',
    description: 'Ensures <audio autoplay> and <video autoplay> elements have the muted attribute or provide controls.',
    wcagCriteria: ['1.4.2'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const mediaElements = await context.querySelectorAll('audio[autoplay], video[autoplay]');

    for (const media of mediaElements) {
      const outerHTML = await media.getOuterHTML();
      const isMuted = await media.getAttribute('muted');
      const hasControls = await media.getAttribute('controls');

      if (isMuted !== null) {
        results.push({
          ruleId: 'no-autoplay-audio',
          type: 'pass',
          message: 'Autoplaying media element is muted.',
          element: {
            selector: media.selector,
            html: outerHTML,
            boundingBox: await media.getBoundingBox(),
          },
        });
      } else if (hasControls !== null) {
        results.push({
          ruleId: 'no-autoplay-audio',
          type: 'warning',
          message: 'Autoplaying media element is not muted but has controls. Users can stop or mute the audio, but autoplay without muting may still be disruptive.',
          element: {
            selector: media.selector,
            html: outerHTML,
            boundingBox: await media.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'no-autoplay-audio',
          type: 'violation',
          message: 'Autoplaying media element is not muted and has no controls. Add the muted attribute or provide controls so users can stop the audio.',
          element: {
            selector: media.selector,
            html: outerHTML,
            boundingBox: await media.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
