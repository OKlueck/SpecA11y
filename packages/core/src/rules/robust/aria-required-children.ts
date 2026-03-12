import type { Rule, RuleResult } from '../../types.js';
import { getRequiredChildren } from '../../utils/aria.js';

export const ariaRequiredChildren: Rule = {
  meta: {
    id: 'aria-required-children',
    name: 'ARIA roles must contain required children',
    description: 'Ensures elements with ARIA roles that require specific child roles contain at least one child with one of those roles.',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
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
      const requiredChildRoles = getRequiredChildren(roleName);

      if (requiredChildRoles.length === 0) continue;

      // Check direct children and owned elements (via aria-owns) for required roles
      const hasRequiredChild = await context.page.locator(el.selector).evaluate(
        (target, childRoles) => {
          function checkDescendants(parent: Element): boolean {
            for (const child of Array.from(parent.children)) {
              const childRole = child.getAttribute('role')?.trim().toLowerCase();
              if (childRole && childRoles.includes(childRole)) {
                return true;
              }
              // Check nested (e.g. a rowgroup containing rows)
              if (checkDescendants(child)) {
                return true;
              }
            }
            return false;
          }

          // Check direct descendants
          if (checkDescendants(target)) return true;

          // Check aria-owns references
          const ownsAttr = target.getAttribute('aria-owns');
          if (ownsAttr) {
            const ids = ownsAttr.trim().split(/\s+/);
            for (const id of ids) {
              const owned = document.getElementById(id);
              if (!owned) continue;
              const ownedRole = owned.getAttribute('role')?.trim().toLowerCase();
              if (ownedRole && childRoles.includes(ownedRole)) {
                return true;
              }
            }
          }

          return false;
        },
        requiredChildRoles,
      );

      if (!hasRequiredChild) {
        results.push({
          ruleId: 'aria-required-children',
          type: 'violation',
          message: `Element with role="${roleName}" must contain at least one child with role: ${requiredChildRoles.join(', ')}.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-required-children',
          type: 'pass',
          message: `Element with role="${roleName}" has required child roles.`,
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
