import type { Rule, RuleResult } from '../../types.js';
import { ARIA_ROLES, isAbstractRole } from '../../utils/aria.js';

export const ariaRoles: Rule = {
  meta: {
    id: 'aria-roles',
    name: 'ARIA role values must be valid',
    description: 'Ensures all role attribute values are valid, non-abstract ARIA roles.',
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

      // role attribute can contain multiple space-separated roles (fallback roles)
      const roles = role.trim().toLowerCase().split(/\s+/);
      const invalidRoles = roles.filter(r => {
        // A role is invalid if it doesn't exist in ARIA_ROLES or it's abstract
        if (!(r in ARIA_ROLES)) return true;
        if (isAbstractRole(r)) return true;
        return false;
      });

      if (invalidRoles.length > 0) {
        results.push({
          ruleId: 'aria-roles',
          type: 'violation',
          message: `Invalid ARIA role(s): ${invalidRoles.map(r => `"${r}"`).join(', ')}. Use valid non-abstract ARIA roles.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-roles',
          type: 'pass',
          message: 'Element has a valid ARIA role.',
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
