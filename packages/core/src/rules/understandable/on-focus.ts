import type { Rule, RuleResult } from '../../types.js';

export const onFocus: Rule = {
  meta: {
    id: 'on-focus',
    name: 'Focus should not trigger context changes',
    description: 'Checks for onfocus event handler attributes that could trigger context changes such as form submissions, navigation, or new windows.',
    wcagCriteria: ['3.2.1'],
    severity: 'serious',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const contextChangingElements = await context.evaluate(() => {
      const contextChangePatterns = /submit|location|window\.open|navigate|redirect|href/i;
      const allElements = document.querySelectorAll('[onfocus]');
      const found: Array<{ selector: string; html: string; handler: string }> = [];

      allElements.forEach((el, index) => {
        const handler = el.getAttribute('onfocus') || '';
        if (contextChangePatterns.test(handler)) {
          const tag = el.tagName.toLowerCase();
          const id = el.getAttribute('id');
          const selector = id ? `#${id}` : `${tag}[onfocus]:nth-of-type(${index + 1})`;
          found.push({
            selector,
            html: el.outerHTML.slice(0, 200),
            handler,
          });
        }
      });

      return found;
    });

    for (const el of contextChangingElements) {
      results.push({
        ruleId: 'on-focus',
        type: 'warning',
        message: `Element has an onfocus handler that may trigger a context change: "${el.handler.slice(0, 100)}". Receiving focus should not cause a change of context.`,
        element: {
          selector: el.selector,
          html: el.html,
        },
      });
    }

    if (contextChangingElements.length === 0) {
      results.push({
        ruleId: 'on-focus',
        type: 'pass',
        message: 'No onfocus handlers that trigger context changes were found.',
      });
    }

    return results;
  },
};
