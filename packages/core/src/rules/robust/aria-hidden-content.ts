import type { Rule, RuleResult } from '../../types.js';

export const ariaHiddenContent: Rule = {
  meta: {
    id: 'aria-hidden-content',
    name: 'aria-hidden must not hide significant visible content',
    description:
      'Ensures aria-hidden="true" is not set on elements that contain significant visible content such as text, images, or form controls.',
    wcagCriteria: ['4.1.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[aria-hidden="true"]');

    for (const el of elements) {
      const tagName = (await el.getOuterHTML()).match(/^<(\w+)/i)?.[1]?.toLowerCase() ?? '';

      // Skip the body (already caught by aria-hidden-body)
      if (tagName === 'body') continue;

      // Check if this hidden element contains significant visible content
      const contentInfo: { textLength: number; interactiveCount: number; imgCount: number } =
        await context.page.locator(el.selector).evaluate((node) => {
          const text = (node.textContent ?? '').trim();
          const interactiveEls = node.querySelectorAll(
            'a[href], button, input, select, textarea, [role="button"], [role="link"]',
          );
          const imgs = node.querySelectorAll('img, svg, video, canvas');
          return {
            textLength: text.length,
            interactiveCount: interactiveEls.length,
            imgCount: imgs.length,
          };
        });

      const hasSignificantContent =
        contentInfo.textLength > 20 ||
        contentInfo.interactiveCount > 0 ||
        contentInfo.imgCount > 0;

      if (hasSignificantContent) {
        results.push({
          ruleId: 'aria-hidden-content',
          type: 'violation',
          message:
            `Element with aria-hidden="true" contains significant visible content ` +
            `(${contentInfo.textLength} chars of text, ${contentInfo.interactiveCount} interactive elements, ` +
            `${contentInfo.imgCount} images). This hides content from assistive technologies.`,
          element: el.toTarget(await el.getOuterHTML(), await el.getBoundingBox()),
        });
      } else {
        results.push({
          ruleId: 'aria-hidden-content',
          type: 'pass',
          message: 'Element with aria-hidden="true" does not contain significant visible content.',
          element: el.toTarget(await el.getOuterHTML(), await el.getBoundingBox()),
        });
      }
    }

    return results;
  },
};
