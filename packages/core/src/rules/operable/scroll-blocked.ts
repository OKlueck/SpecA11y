import type { Rule, RuleResult } from '../../types.js';

export const scrollBlocked: Rule = {
  meta: {
    id: 'scroll-blocked',
    name: 'Page must not block scrolling when content overflows',
    description:
      'Detects overflow: hidden on html or body when the page has more content than fits in the viewport, which prevents users from scrolling.',
    wcagCriteria: ['2.1.1'],
    severity: 'critical',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const scrollInfo: { blocked: boolean; element: string; overflow: string } | null =
      await context.page.evaluate(() => {
        for (const el of [document.documentElement, document.body]) {
          if (!el) continue;
          const cs = window.getComputedStyle(el);
          const overflowY = cs.overflowY;
          const overflow = cs.overflow;

          const isHidden = overflowY === 'hidden' || overflow === 'hidden';
          if (isHidden && el.scrollHeight > el.clientHeight) {
            return {
              blocked: true,
              element: el.tagName.toLowerCase(),
              overflow: `overflow: ${overflow}, overflow-y: ${overflowY}`,
            };
          }
        }
        return null;
      });

    if (scrollInfo) {
      results.push({
        ruleId: 'scroll-blocked',
        type: 'violation',
        message:
          `<${scrollInfo.element}> has ${scrollInfo.overflow} but the page content overflows the viewport. ` +
          `This prevents users from scrolling to reach all content.`,
      });
    } else {
      results.push({
        ruleId: 'scroll-blocked',
        type: 'pass',
        message: 'Page does not block scrolling when content overflows.',
      });
    }

    return results;
  },
};
