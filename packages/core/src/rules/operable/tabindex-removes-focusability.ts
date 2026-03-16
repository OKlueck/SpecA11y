import type { Rule, RuleResult } from '../../types.js';

const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea';

export const tabindexRemovesFocusability: Rule = {
  meta: {
    id: 'tabindex-removes-focusability',
    name: 'Natively focusable elements should not have tabindex="-1"',
    description:
      'Detects natively focusable elements (links, buttons, form controls) that have tabindex="-1", which removes them from the keyboard tab order.',
    wcagCriteria: ['2.1.1'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const allFocusable = await context.querySelectorAll(NATIVELY_FOCUSABLE);
    const defocused: RuleResult[] = [];

    for (const el of allFocusable) {
      const tabindexAttr = await el.getAttribute('tabindex');
      if (tabindexAttr === null) continue;

      const value = Number(tabindexAttr);
      if (value !== -1) continue;

      // Check if element is inside a composite widget where tabindex="-1" is valid
      // (e.g., tabs, menus, tree items use roving tabindex)
      const isRovingTabindex: boolean = await context.page.locator(el.selector).evaluate((node) => {
        const parent = node.closest(
          '[role="tablist"], [role="menu"], [role="menubar"], [role="tree"], [role="listbox"], [role="radiogroup"], [role="toolbar"]',
        );
        return parent !== null;
      });

      if (isRovingTabindex) continue;

      defocused.push({
        ruleId: 'tabindex-removes-focusability',
        type: 'warning',
        message: 'Natively focusable element has tabindex="-1", removing it from the keyboard tab order.',
        element: {
          selector: el.selector,
          html: await el.getOuterHTML(),
          boundingBox: await el.getBoundingBox(),
        },
      });
    }

    // Escalate to violation if many elements are affected (indicates systematic removal)
    const threshold = Math.max(3, Math.floor(allFocusable.length * 0.5));
    if (defocused.length >= threshold) {
      for (const result of defocused) {
        results.push({
          ...result,
          type: 'violation',
          message:
            `Natively focusable element has tabindex="-1". ` +
            `${defocused.length} of ${allFocusable.length} focusable elements are removed from the tab order, ` +
            `indicating systematic removal of keyboard accessibility.`,
        });
      }
    } else {
      results.push(...defocused);
    }

    return results;
  },
};
