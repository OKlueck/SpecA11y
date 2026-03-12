import type { Rule, RuleResult } from '../../types.js';

export const characterKeyShortcuts: Rule = {
  meta: {
    id: 'character-key-shortcuts',
    name: 'Character key shortcuts must be remappable or disableable',
    description: 'Checks for accesskey attributes using single character keys and elements with keyboard event handler attributes that may indicate non-remappable character key shortcuts.',
    wcagCriteria: ['2.1.4'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Check for accesskey attributes with single character keys (no modifier)
    const accesskeyElements = await context.querySelectorAll('[accesskey]');

    for (const el of accesskeyElements) {
      const key = await el.getAttribute('accesskey');
      if (key && key.length === 1) {
        results.push({
          ruleId: 'character-key-shortcuts',
          type: 'warning',
          message: `Element has accesskey="${key}" which is a single character shortcut. Ensure the shortcut can be turned off, remapped, or is only active on focus (WCAG 2.1.4).`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    // Check for elements with keyboard event handler attributes
    const keyboardHandlerData = await context.evaluate(() => {
      const attrs = ['onkeydown', 'onkeypress', 'onkeyup'];
      const found: { selector: string; html: string; attr: string }[] = [];

      for (const attr of attrs) {
        const elements = document.querySelectorAll(`[${attr}]`);
        elements.forEach((el, index) => {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const cls = el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).join('.')}`
            : '';
          found.push({
            selector: `${tag}${id}${cls}[${attr}]`,
            html: el.outerHTML.slice(0, 200),
            attr,
          });
        });
      }

      return found;
    });

    for (const entry of keyboardHandlerData) {
      results.push({
        ruleId: 'character-key-shortcuts',
        type: 'warning',
        message: `Element has inline "${entry.attr}" handler which may implement character key shortcuts. Ensure any single-character shortcuts can be turned off, remapped, or are only active on focus.`,
        element: {
          selector: entry.selector,
          html: entry.html,
        },
      });
    }

    return results;
  },
};
