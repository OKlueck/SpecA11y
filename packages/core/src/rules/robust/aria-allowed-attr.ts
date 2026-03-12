import type { Rule, RuleResult } from '../../types.js';
import { ARIA_ROLES, getSupportedAttrs, getImplicitRole } from '../../utils/aria.js';

export const ariaAllowedAttr: Rule = {
  meta: {
    id: 'aria-allowed-attr',
    name: 'ARIA attributes must be allowed for the element role',
    description: 'Ensures ARIA attributes used on elements are valid for that element\'s role.',
    wcagCriteria: ['4.1.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Check elements with explicit roles
    const elementsWithRole = await context.querySelectorAll('[role]');

    for (const el of elementsWithRole) {
      const role = await el.getAttribute('role');
      if (!role || !role.trim()) continue;

      const roleName = role.trim().toLowerCase();
      const roleDef = ARIA_ROLES[roleName];

      // Skip roles we don't know about (aria-roles rule handles invalid roles)
      if (!roleDef) continue;

      const allowedAttrs = roleDef.supportedAttrs;

      const ariaAttrs = await context.page.locator(el.selector).evaluate((target) => {
        return Array.from(target.attributes)
          .filter(attr => attr.name.startsWith('aria-'))
          .map(attr => attr.name);
      });

      let hasViolation = false;
      for (const attr of ariaAttrs) {
        if (!allowedAttrs.includes(attr)) {
          hasViolation = true;
          results.push({
            ruleId: 'aria-allowed-attr',
            type: 'violation',
            message: `ARIA attribute "${attr}" is not allowed on role "${roleName}".`,
            element: {
              selector: el.selector,
              html: await el.getOuterHTML(),
              boundingBox: await el.getBoundingBox(),
            },
          });
        }
      }

      if (!hasViolation && ariaAttrs.length > 0) {
        results.push({
          ruleId: 'aria-allowed-attr',
          type: 'pass',
          message: `All ARIA attributes are allowed on role "${roleName}".`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    // Check elements without explicit role but with aria-* attrs
    const allAriaElements = await context.page.evaluate(() => {
      const elems = document.querySelectorAll('*');
      const found: Array<{ selector: string; html: string; tagName: string; attrs: Record<string, string>; ariaAttrs: string[] }> = [];
      elems.forEach((el) => {
        if (el.hasAttribute('role')) return; // already handled
        const ariaAttrs = Array.from(el.attributes)
          .filter(a => a.name.startsWith('aria-'))
          .map(a => a.name);
        if (ariaAttrs.length === 0) return;

        let selector = el.tagName.toLowerCase();
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.className && typeof el.className === 'string') {
          selector += '.' + el.className.trim().split(/\s+/).join('.');
        }

        const attrs: Record<string, string> = {};
        for (const a of Array.from(el.attributes)) {
          attrs[a.name] = a.value;
        }

        found.push({
          selector,
          html: el.outerHTML.slice(0, 200),
          tagName: el.tagName.toLowerCase(),
          attrs,
          ariaAttrs,
        });
      });
      return found;
    });

    for (const entry of allAriaElements) {
      const implicitRole = getImplicitRole(entry.tagName, entry.attrs);
      if (!implicitRole) continue;

      const allowedAttrs = getSupportedAttrs(implicitRole);
      if (allowedAttrs.length === 0) continue;

      for (const attr of entry.ariaAttrs) {
        if (!allowedAttrs.includes(attr)) {
          results.push({
            ruleId: 'aria-allowed-attr',
            type: 'violation',
            message: `ARIA attribute "${attr}" is not allowed on implicit role "${implicitRole}" (from <${entry.tagName}>).`,
            element: {
              selector: entry.selector,
              html: entry.html,
            },
          });
        }
      }
    }

    return results;
  },
};
