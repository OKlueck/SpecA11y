import type { Rule, RuleResult } from '../../types.js';

export const videoCaptionQuality: Rule = {
  meta: {
    id: 'video-caption-quality',
    name: 'Video caption tracks should contain actual cues',
    description:
      'Checks that video caption track files (VTT/SRT) are not empty and contain actual subtitle cues.',
    wcagCriteria: ['1.2.2'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
    tags: ['semantic', 'heuristic'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const videos = await context.querySelectorAll('video');

    for (const video of videos) {
      const trackInfos: Array<{ src: string; hasCues: boolean | null }> =
        await context.page.locator(video.selector).evaluate((el) => {
          const tracks = el.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
          const infos: Array<{ src: string; hasCues: boolean | null }> = [];

          for (const track of tracks) {
            const src = track.getAttribute('src') ?? '';
            const htmlTrack = track as HTMLTrackElement;

            // Check if the TextTrack API gives us cue information
            if (htmlTrack.track && htmlTrack.track.cues !== null) {
              infos.push({
                src,
                hasCues: htmlTrack.track.cues.length > 0,
              });
            } else {
              // Cues not loaded yet or not accessible
              infos.push({ src, hasCues: null });
            }
          }

          return infos;
        });

      if (trackInfos.length === 0) continue; // No tracks — caught by video-caption rule

      const element = {
        selector: video.selector,
        html: await video.getOuterHTML(),
        boundingBox: await video.getBoundingBox(),
      };

      for (const track of trackInfos) {
        if (!track.src || track.src.trim() === '') {
          results.push({
            ruleId: 'video-caption-quality',
            type: 'warning',
            message: 'Caption track has an empty src attribute. The track file cannot be loaded.',
            element,
          });
          continue;
        }

        if (track.hasCues === false) {
          results.push({
            ruleId: 'video-caption-quality',
            type: 'warning',
            message: `Caption track "${track.src}" has no cues. The subtitle file may be empty or malformed.`,
            element,
          });
          continue;
        }

        if (track.hasCues === null) {
          // Try fetching the VTT file to check content
          const hasContent = await checkTrackFileHasContent(context, track.src);

          if (hasContent === false) {
            results.push({
              ruleId: 'video-caption-quality',
              type: 'warning',
              message: `Caption track "${track.src}" appears to be empty or contains no cues.`,
              element,
            });
            continue;
          }

          if (hasContent === null) {
            results.push({
              ruleId: 'video-caption-quality',
              type: 'pass',
              message: `Caption track "${track.src}" exists but could not be verified for content.`,
              element,
            });
            continue;
          }
        }

        results.push({
          ruleId: 'video-caption-quality',
          type: 'pass',
          message: `Caption track "${track.src}" contains cues.`,
          element,
        });
      }
    }

    return results;
  },
};

async function checkTrackFileHasContent(
  context: { page: { locator: (sel: string) => { evaluate: (fn: (...args: unknown[]) => unknown, ...args: unknown[]) => Promise<unknown> } } },
  src: string,
): Promise<boolean | null> {
  try {
    const result = await context.page.locator('body').evaluate(
      async (_el: unknown, trackSrc: unknown) => {
        try {
          const response = await fetch(trackSrc as string);
          if (!response.ok) return null;
          const text = await response.text();
          const trimmed = text.trim();

          // Check if it's a valid VTT/SRT with actual cues
          if (trimmed === '' || trimmed === 'WEBVTT' || trimmed === 'WEBVTT\n') {
            return false;
          }

          // VTT files: check for timestamp pattern (00:00:00.000 --> 00:00:00.000)
          const hasTimestamps = /\d{2}:\d{2}[.:]\d{2,3}\s*-->\s*\d{2}:\d{2}[.:]\d{2,3}/.test(trimmed);
          return hasTimestamps;
        } catch {
          return null;
        }
      },
      src,
    );

    return result as boolean | null;
  } catch {
    return null;
  }
}
