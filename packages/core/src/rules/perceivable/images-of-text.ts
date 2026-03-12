import type { Rule, RuleResult } from '../../types.js';

const LONG_ALT_THRESHOLD = 50;

export const imagesOfText: Rule = {
  meta: {
    id: 'images-of-text',
    name: 'Images should not be used to present text',
    description:
      'Heuristic check for <img> elements that may contain text (very long alt text or CSS text-replacement patterns), suggesting real text should be used instead.',
    wcagCriteria: ['1.4.5'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const images = await context.querySelectorAll('img');

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Skip decorative images
      if (role === 'presentation' || role === 'none') continue;
      if (alt === '') continue;

      const warnings: string[] = [];

      // Check for very long alt text — suggests the image contains text
      if (alt && alt.length > LONG_ALT_THRESHOLD) {
        warnings.push(
          `Alt text is ${alt.length} characters long, which suggests this image may contain text that should be presented as real text.`,
        );
      }

      // Check for CSS patterns suggesting text replacement
      const textIndent = await img.getComputedStyle('text-indent');
      const overflow = await img.getComputedStyle('overflow');
      const parent = await context.evaluate(() => {
        // Find images used in text-replacement patterns (negative text-indent on parent)
        const imgs = document.querySelectorAll('img');
        const matches: { selector: string; parentTextIndent: string; parentHasText: boolean }[] = [];

        imgs.forEach((imgEl) => {
          const parentEl = imgEl.parentElement;
          if (!parentEl) return;
          const pStyle = window.getComputedStyle(parentEl);
          const indent = parseFloat(pStyle.textIndent);
          const hasText = (parentEl.textContent ?? '').replace(imgEl.textContent ?? '', '').trim().length > 0;

          const tag = imgEl.tagName.toLowerCase();
          const id = imgEl.id ? `#${imgEl.id}` : '';
          const cls =
            imgEl.className && typeof imgEl.className === 'string'
              ? `.${imgEl.className.trim().split(/\s+/).join('.')}`
              : '';

          matches.push({
            selector: `${tag}${id}${cls}`,
            parentTextIndent: pStyle.textIndent,
            parentHasText: hasText && indent < -999,
          });
        });

        return matches;
      });

      // Check for text-replacement pattern on parent
      const imgInfo = parent.find((p) => p.selector === img.selector);
      if (imgInfo?.parentHasText) {
        warnings.push(
          'Image appears to be inside a text-replacement pattern (parent has large negative text-indent with hidden text).',
        );
      }

      // Check for common image-of-text filename patterns
      const src = await img.getAttribute('src');
      if (src) {
        const filename = src.split('/').pop()?.toLowerCase() ?? '';
        if (/\b(text|heading|title|banner|logo[-_]?text|word|label)\b/.test(filename)) {
          warnings.push(
            `Image filename "${filename}" suggests it may contain text content.`,
          );
        }
      }

      if (warnings.length > 0) {
        results.push({
          ruleId: 'images-of-text',
          type: 'warning',
          message: warnings.join(' '),
          element: {
            selector: img.selector,
            html: await img.getOuterHTML(),
            boundingBox: await img.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
