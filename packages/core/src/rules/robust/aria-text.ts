import type { Rule, RuleResult } from '../../types.js';

export const ariaText: Rule = {
  meta: {
    id: 'aria-text',
    name: 'Elements with role="text" must not contain focusable children',
    description:
      'Ensures elements with role="text" do not contain interactive/focusable descendants, which would break the text grouping semantics.',
    wcagCriteria: [],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[role="text"]');

    for (const el of elements) {
      const outerHTML = await el.getOuterHTML();

      // Check the outer HTML for focusable child elements
      // Strip the opening tag itself to only inspect children
      const focusablePattern =
        /<(a\s[^>]*href|button|input|select|textarea|\w+[^>]*tabindex)/i;
      const innerContent = outerHTML.replace(/^<[^>]+>/, '').replace(/<\/[^>]+>$/, '');
      const containsFocusable = focusablePattern.test(innerContent);

      if (containsFocusable) {
        results.push({
          ruleId: 'aria-text',
          type: 'violation',
          message:
            'Element with role="text" contains focusable children. Focusable elements inside role="text" break the grouping semantics.',
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-text',
          type: 'pass',
          message:
            'Element with role="text" does not contain focusable children.',
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
