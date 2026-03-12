import type { Rule, RuleResult } from '../../types.js';

const INTERACTIVE_ELEMENTS = new Set([
  'a', 'button', 'input', 'select', 'textarea', 'summary', 'details',
]);

export const contentOnHoverFocus: Rule = {
  meta: {
    id: 'content-on-hover-focus',
    name: 'Hover/focus triggered content must be dismissible and persistent',
    description:
      'Heuristic check for content that appears on hover only, such as title attributes on non-interactive elements which create native tooltips that cannot be dismissed or hovered over.',
    wcagCriteria: ['1.4.13'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Check for title attributes on non-interactive elements
    const titledElements = await context.querySelectorAll('[title]');

    for (const el of titledElements) {
      const title = await el.getAttribute('title');
      if (!title || !title.trim()) continue;

      const visible = await el.isVisible();
      if (!visible) continue;

      const outerHTML = await el.getOuterHTML();
      const tagMatch = outerHTML.match(/^<(\w+)/);
      const tag = tagMatch ? tagMatch[1].toLowerCase() : '';

      const role = await el.getAttribute('role');
      const isInteractive =
        INTERACTIVE_ELEMENTS.has(tag) ||
        role === 'button' ||
        role === 'link' ||
        role === 'menuitem';

      if (!isInteractive) {
        results.push({
          ruleId: 'content-on-hover-focus',
          type: 'warning',
          message: `Non-interactive <${tag}> element has a title attribute ("${title.slice(0, 60)}${title.length > 60 ? '…' : ''}"). Native tooltips appear on hover only, cannot be dismissed by the user, and disappear when the pointer moves away. Consider using a more accessible pattern.`,
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    // Check for CSS-based hover-triggered content patterns
    const hoverPatterns = await context.evaluate(() => {
      const out: { selector: string; html: string; issue: string }[] = [];

      // Look for elements that have visibility/display-based hover patterns
      // by checking stylesheets for :hover rules that change visibility/display/opacity
      const sheets = document.styleSheets;

      const hoverSelectors: string[] = [];

      for (let i = 0; i < sheets.length; i++) {
        try {
          const rules = sheets[i].cssRules;
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule instanceof CSSStyleRule && rule.selectorText.includes(':hover')) {
              const style = rule.style;
              if (
                style.display ||
                style.visibility ||
                style.opacity ||
                style.getPropertyValue('display') ||
                style.getPropertyValue('visibility') ||
                style.getPropertyValue('opacity')
              ) {
                // Extract the base selector (the part showing content on hover)
                hoverSelectors.push(rule.selectorText);
              }
            }
          }
        } catch {
          // Cross-origin stylesheets will throw — skip them
        }
      }

      // Check if hover-triggered elements are not keyboard focusable
      for (const selectorText of hoverSelectors) {
        // Try to extract the target element from patterns like ".parent:hover .child"
        const parts = selectorText.split(':hover');
        if (parts.length < 2) continue;

        const triggerSelector = parts[0].trim();
        if (!triggerSelector) continue;

        try {
          const triggers = document.querySelectorAll(triggerSelector);
          triggers.forEach((trigger) => {
            const tag = trigger.tagName.toLowerCase();
            const tabindex = trigger.getAttribute('tabindex');
            const isFocusable =
              ['a', 'button', 'input', 'select', 'textarea', 'summary'].includes(tag) ||
              tabindex !== null;

            if (!isFocusable) {
              const id = trigger.id ? `#${trigger.id}` : '';
              const cls =
                trigger.className && typeof trigger.className === 'string'
                  ? `.${trigger.className.trim().split(/\s+/).join('.')}`
                  : '';

              out.push({
                selector: `${tag}${id}${cls}`,
                html: trigger.outerHTML.slice(0, 200),
                issue: `CSS rule "${selectorText.slice(0, 80)}" shows content on hover, but the trigger element is not keyboard-focusable.`,
              });
            }
          });
        } catch {
          // Invalid selectors — skip
        }
      }

      return out;
    });

    for (const pattern of hoverPatterns) {
      results.push({
        ruleId: 'content-on-hover-focus',
        type: 'warning',
        message: `${pattern.issue} Hover-triggered content must also be available on focus, be dismissible, and be persistent.`,
        element: {
          selector: pattern.selector,
          html: pattern.html,
        },
      });
    }

    return results;
  },
};
