import type { Rule, RuleResult } from '../../types.js';

const GENERIC_ALT_PATTERNS: RegExp[] = [
  /^image$/i,
  /^img$/i,
  /^foto$/i,
  /^photo$/i,
  /^bild$/i,
  /^picture$/i,
  /^graphic$/i,
  /^grafik$/i,
  /^icon$/i,
  /^logo$/i,
  /^banner$/i,
  /^placeholder$/i,
  /^untitled$/i,
  /^alt$/i,
  /^alt text$/i,
  /^spacer$/i,
  /^thumbnail$/i,
  /^\*$/,
  /^\.$/,
  /^\s+$/,
];

/** Matches file-name-like patterns: image.png, IMG_1234.jpg, DSC_0001.JPEG, hero-bg.webp */
const FILENAME_PATTERN = /^[\w\-. ]+\.(jpe?g|png|gif|webp|svg|bmp|tiff?|avif|ico)$/i;

/** Matches very short (1 char) or very long (>150 char) alt text */
function isSuspiciousLength(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length === 1 || trimmed.length > 150;
}

export const imgAltQuality: Rule = {
  meta: {
    id: 'img-alt-quality',
    name: 'Image alt text should be meaningful',
    description:
      'Checks that image alt text is not a generic placeholder, file name, or suspiciously short/long value.',
    wcagCriteria: ['1.1.1'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
    tags: ['semantic', 'heuristic'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const images = await context.querySelectorAll('img');

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Skip decorative images
      if (role === 'presentation' || role === 'none') continue;
      // Skip images without alt (caught by img-alt rule)
      if (alt === null || alt === undefined) continue;
      // Empty alt = intentionally decorative
      if (alt === '') continue;

      const trimmed = alt.trim();
      const element = {
        selector: img.selector,
        html: await img.getOuterHTML(),
        boundingBox: await img.getBoundingBox(),
      };

      // Check generic placeholder patterns
      const isGeneric = GENERIC_ALT_PATTERNS.some((p) => p.test(trimmed));
      if (isGeneric) {
        results.push({
          ruleId: 'img-alt-quality',
          type: 'warning',
          message: `Image has generic alt text "${trimmed}". Alt text should describe the image content or purpose.`,
          element,
        });
        continue;
      }

      // Check filename patterns
      if (FILENAME_PATTERN.test(trimmed)) {
        results.push({
          ruleId: 'img-alt-quality',
          type: 'warning',
          message: `Image alt text appears to be a file name: "${trimmed}". Use a descriptive text instead.`,
          element,
        });
        continue;
      }

      // Check suspicious length
      if (isSuspiciousLength(trimmed)) {
        results.push({
          ruleId: 'img-alt-quality',
          type: 'warning',
          message:
            trimmed.length === 1
              ? `Image alt text is only one character: "${trimmed}". This is likely not meaningful.`
              : `Image alt text is very long (${trimmed.length} characters). Consider a shorter description and use a long description if needed.`,
          element,
        });
        continue;
      }

      results.push({
        ruleId: 'img-alt-quality',
        type: 'pass',
        message: 'Image alt text appears to be meaningful.',
        element,
      });
    }

    return results;
  },
};
