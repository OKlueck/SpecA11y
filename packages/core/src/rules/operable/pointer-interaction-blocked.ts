import type { Rule, RuleResult } from '../../types.js';

export const pointerInteractionBlocked: Rule = {
  meta: {
    id: 'pointer-interaction-blocked',
    name: 'Content areas must not block pointer interaction',
    description:
      'Detects pointer-events: none and cursor: none on content areas that would prevent mouse/touch interaction.',
    wcagCriteria: ['2.5.1'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    let foundPointerBlock = false;
    let foundCursorHide = false;

    // Check content containers for pointer-events: none
    const containers = await context.querySelectorAll('body, main, [role="main"], article, section, div');

    for (const el of containers) {
      const textContent = await el.getTextContent();
      if (!textContent.trim()) continue;

      const pointerEvents = await el.getComputedStyle('pointer-events');
      const cursor = await el.getComputedStyle('cursor');

      if (!foundPointerBlock && pointerEvents === 'none') {
        // Verify this is a content container, not a decorative overlay
        const hasInteractive: boolean = await context.page.locator(el.selector).evaluate((node) => {
          return node.querySelectorAll('a[href], button, input, select, textarea').length > 0;
        });

        if (hasInteractive) {
          results.push({
            ruleId: 'pointer-interaction-blocked',
            type: 'violation',
            message:
              'Content area has pointer-events: none, which prevents mouse and touch interaction with interactive elements inside it.',
            element: {
              selector: el.selector,
              html: await el.getOuterHTML(),
              boundingBox: await el.getBoundingBox(),
            },
          });
          foundPointerBlock = true;
        }
      }

      if (!foundCursorHide && cursor === 'none') {
        results.push({
          ruleId: 'pointer-interaction-blocked',
          type: 'warning',
          message: 'Content area has cursor: none, which hides the mouse pointer from users.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
        foundCursorHide = true;
      }

      if (foundPointerBlock && foundCursorHide) break;
    }

    return results;
  },
};
