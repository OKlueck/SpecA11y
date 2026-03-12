import type { Rule, RuleResult } from '../../types.js';

export const noEmptyLinks: Rule = {
  meta: {
    id: 'no-empty-links',
    name: 'Links must have discernible text',
    description: 'Ensures that all links (<a href>) have discernible text via text content, aria-label, aria-labelledby, or child img alt text.',
    wcagCriteria: ['2.4.4'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const links = await context.querySelectorAll('a[href]');

    for (const link of links) {
      const accessibleName = await link.getAccessibleName();

      if (accessibleName && accessibleName.trim()) {
        results.push({
          ruleId: 'no-empty-links',
          type: 'pass',
          message: 'Link has discernible text.',
          element: {
            selector: link.selector,
            html: await link.getOuterHTML(),
            boundingBox: await link.getBoundingBox(),
          },
        });
      } else {
        // Check for child images with alt text
        const childImgs = await context.querySelectorAll(`${link.selector} img[alt]`);
        let hasImgAlt = false;

        for (const img of childImgs) {
          const alt = await img.getAttribute('alt');
          if (alt && alt.trim()) {
            hasImgAlt = true;
            break;
          }
        }

        if (hasImgAlt) {
          results.push({
            ruleId: 'no-empty-links',
            type: 'pass',
            message: 'Link has discernible text via child image alt text.',
            element: {
              selector: link.selector,
              html: await link.getOuterHTML(),
              boundingBox: await link.getBoundingBox(),
            },
          });
        } else {
          results.push({
            ruleId: 'no-empty-links',
            type: 'violation',
            message: 'Link has no discernible text. Add text content, aria-label, aria-labelledby, or alt text to child images.',
            element: {
              selector: link.selector,
              html: await link.getOuterHTML(),
              boundingBox: await link.getBoundingBox(),
            },
          });
        }
      }
    }

    return results;
  },
};
