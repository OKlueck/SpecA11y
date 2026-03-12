import type { Rule, RuleResult } from '../../types.js';
import { getRequiredAttrs, getImplicitAriaAttrs } from '../../utils/aria.js';

export const ariaRequiredAttr: Rule = {
  meta: {
    id: 'aria-required-attr',
    name: 'Elements with ARIA roles must have required attributes',
    description: 'Ensures elements with ARIA roles have all required ARIA attributes for that role.',
    wcagCriteria: ['4.1.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[role]');

    for (const el of elements) {
      const role = await el.getAttribute('role');
      if (!role || !role.trim()) continue;

      const roleName = role.trim().toLowerCase();
      const requiredAttrs = getRequiredAttrs(roleName);

      if (requiredAttrs.length === 0) continue;

      // Determine which attrs are implicitly satisfied by native HTML semantics
      const tagAndType = await context.page.locator(el.selector).evaluate((target) => {
        return {
          tagName: target.tagName.toLowerCase(),
          type: (target as HTMLInputElement).type?.toLowerCase() || undefined,
        };
      });

      const implicitAttrs = getImplicitAriaAttrs(tagAndType.tagName, tagAndType.type);

      const missingAttrs: string[] = [];
      for (const attr of requiredAttrs) {
        // Skip if the native element implicitly satisfies this attr
        if (implicitAttrs.includes(attr)) continue;

        const value = await el.getAttribute(attr);
        if (value === null) {
          missingAttrs.push(attr);
        }
      }

      if (missingAttrs.length > 0) {
        results.push({
          ruleId: 'aria-required-attr',
          type: 'violation',
          message: `Element with role="${roleName}" is missing required ARIA attribute(s): ${missingAttrs.join(', ')}.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-required-attr',
          type: 'pass',
          message: `Element with role="${roleName}" has all required ARIA attributes.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
