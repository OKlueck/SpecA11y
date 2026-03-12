import type { Rule, RuleResult } from '../../types.js';

export const imageRedundantAlt: Rule = {
  meta: {
    id: 'image-redundant-alt',
    name: 'Image alt text should not duplicate surrounding text',
    description:
      'Ensures image alt text does not repeat the same text already present in the surrounding link or button.',
    wcagCriteria: [],
    severity: 'minor',
    confidence: 'likely',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Find images inside links and buttons
    const images = await context.querySelectorAll('a img[alt], button img[alt]');

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt || !alt.trim()) continue;

      const outerHTML = await img.getOuterHTML();

      // Get the parent container's full text and compare
      // We use evaluate to get the parent's text excluding the image alt
      const redundant = await context.evaluate(() => {
        const imgs = document.querySelectorAll('a img[alt], button img[alt]');
        const redundantMap: string[] = [];

        for (const image of imgs) {
          const parent = image.closest('a, button');
          if (!parent) continue;

          const imgAlt = image.getAttribute('alt')?.trim().toLowerCase() || '';
          if (!imgAlt) continue;

          // Get text content of the parent excluding the image
          const clone = parent.cloneNode(true) as HTMLElement;
          const cloneImgs = clone.querySelectorAll('img');
          for (const ci of cloneImgs) ci.remove();
          const parentText = clone.textContent?.trim().toLowerCase() || '';

          if (parentText && imgAlt === parentText) {
            // Build a simple identifier from the img's src or position
            const src = image.getAttribute('src') || '';
            const altVal = image.getAttribute('alt') || '';
            redundantMap.push(`${src}||${altVal}`);
          }
        }

        return redundantMap;
      });

      // Check if this specific image was found redundant
      const imgSrc = await img.getAttribute('src');
      const key = `${imgSrc || ''}||${alt || ''}`;
      const isRedundant = redundant.includes(key);

      if (isRedundant) {
        results.push({
          ruleId: 'image-redundant-alt',
          type: 'violation',
          message: `Image alt text "${alt}" is the same as the surrounding link or button text. Remove the redundant alt or differentiate it.`,
          element: {
            selector: img.selector,
            html: outerHTML,
            boundingBox: await img.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'image-redundant-alt',
          type: 'pass',
          message: 'Image alt text does not duplicate surrounding text.',
          element: {
            selector: img.selector,
            html: outerHTML,
            boundingBox: await img.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
