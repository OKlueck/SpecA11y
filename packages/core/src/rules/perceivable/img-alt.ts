import type { Rule, RuleResult } from '../../types.js';

export const imgAlt: Rule = {
  meta: {
    id: 'img-alt',
    name: 'Images must have alternate text',
    description: 'Ensures <img> elements have alternative text or are marked as decorative.',
    wcagCriteria: ['1.1.1'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const images = await context.querySelectorAll('img');

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const ariaLabel = await img.getAttribute('aria-label');
      const ariaLabelledBy = await img.getAttribute('aria-labelledby');
      const role = await img.getAttribute('role');

      // Decorative images with role="presentation" or role="none" are fine
      if (role === 'presentation' || role === 'none') {
        results.push({
          ruleId: 'img-alt',
          type: 'pass',
          message: 'Image is marked as decorative.',
          element: {
            selector: img.selector,
            html: await img.getOuterHTML(),
            boundingBox: await img.getBoundingBox(),
          },
        });
        continue;
      }

      const hasAlt = alt !== null && alt !== undefined;
      const hasAriaLabel = !!ariaLabel;
      const hasAriaLabelledBy = !!ariaLabelledBy;

      if (hasAlt || hasAriaLabel || hasAriaLabelledBy) {
        // Check for empty alt without being decorative
        if (alt === '' && !hasAriaLabel && !hasAriaLabelledBy && role !== 'presentation' && role !== 'none') {
          results.push({
            ruleId: 'img-alt',
            type: 'pass',
            message: 'Image has empty alt (treated as decorative). Consider adding role="none".',
            element: {
              selector: img.selector,
              html: await img.getOuterHTML(),
              boundingBox: await img.getBoundingBox(),
            },
          });
        } else {
          results.push({
            ruleId: 'img-alt',
            type: 'pass',
            message: 'Image has alternative text.',
            element: {
              selector: img.selector,
              html: await img.getOuterHTML(),
              boundingBox: await img.getBoundingBox(),
            },
          });
        }
      } else {
        results.push({
          ruleId: 'img-alt',
          type: 'violation',
          message: 'Image is missing alternative text. Add an alt attribute or aria-label.',
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
