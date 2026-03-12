import type { Rule, RuleResult } from '../../types.js';

export const nestedInteractive: Rule = {
  meta: {
    id: 'nested-interactive',
    name: 'Interactive elements must not be nested',
    description: 'Ensures interactive elements (links, buttons, inputs, etc.) are not nested inside other interactive elements.',
    wcagCriteria: ['4.1.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const violations = await context.evaluate(() => {
      const interactiveSelector = [
        'a[href]', 'button', 'input:not([type="hidden"])', 'select', 'textarea',
        '[tabindex]', 'audio[controls]', 'video[controls]', 'details', 'embed',
        '[role="button"]', '[role="link"]', '[role="checkbox"]', '[role="radio"]',
        '[role="textbox"]', '[role="listbox"]', '[role="menu"]', '[role="menuitem"]',
        '[role="tab"]', '[role="switch"]', '[role="slider"]', '[role="spinbutton"]',
        '[role="combobox"]', '[role="searchbox"]', '[role="option"]', '[role="treeitem"]',
      ].join(', ');

      const interactiveElements = document.querySelectorAll(interactiveSelector);
      const found: Array<{ parentSelector: string; parentHtml: string; childHtml: string }> = [];

      function getUniqueSelector(el: Element): string {
        if (el.id) return `#${el.id}`;
        const tag = el.tagName.toLowerCase();
        const parent = el.parentElement;
        if (!parent) return tag;
        const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
        if (siblings.length === 1) return `${getUniqueSelector(parent)} > ${tag}`;
        const index = siblings.indexOf(el) + 1;
        return `${getUniqueSelector(parent)} > ${tag}:nth-of-type(${index})`;
      }

      for (const el of interactiveElements) {
        const nestedChild = el.querySelector(interactiveSelector);
        if (nestedChild) {
          found.push({
            parentSelector: getUniqueSelector(el),
            parentHtml: el.outerHTML.slice(0, 200),
            childHtml: nestedChild.outerHTML.slice(0, 200),
          });
        }
      }

      return found;
    });

    for (const v of violations) {
      results.push({
        ruleId: 'nested-interactive',
        type: 'violation',
        message: `Interactive element contains a nested interactive child. Nested interactive elements cause unpredictable behavior for assistive technologies.`,
        element: {
          selector: v.parentSelector,
          html: v.parentHtml,
        },
      });
    }

    if (violations.length === 0) {
      results.push({
        ruleId: 'nested-interactive',
        type: 'pass',
        message: 'No nested interactive elements found.',
      });
    }

    return results;
  },
};
