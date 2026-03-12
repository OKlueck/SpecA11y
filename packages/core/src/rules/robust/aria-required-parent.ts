import type { Rule, RuleResult } from '../../types.js';
import { getRequiredParent } from '../../utils/aria.js';

export const ariaRequiredParent: Rule = {
  meta: {
    id: 'aria-required-parent',
    name: 'ARIA roles must be contained in required parent',
    description: 'Ensures elements with ARIA roles that require a specific parent role are nested inside an element with one of those roles.',
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
      const requiredParentRoles = getRequiredParent(roleName);

      if (requiredParentRoles.length === 0) continue;

      const hasRequiredParent = await context.page.locator(el.selector).evaluate(
        (target, parentRoles) => {
          let current = target.parentElement;
          while (current) {
            const parentRole = current.getAttribute('role')?.trim().toLowerCase();
            if (parentRole && parentRoles.includes(parentRole)) {
              return true;
            }
            current = current.parentElement;
          }

          // Also check if this element is referenced by aria-owns from an element
          // with one of the required parent roles
          const id = target.id;
          if (id) {
            const owners = document.querySelectorAll('[aria-owns]');
            for (const owner of Array.from(owners)) {
              const ownsIds = owner.getAttribute('aria-owns')?.trim().split(/\s+/) ?? [];
              if (ownsIds.includes(id)) {
                const ownerRole = owner.getAttribute('role')?.trim().toLowerCase();
                if (ownerRole && parentRoles.includes(ownerRole)) {
                  return true;
                }
              }
            }
          }

          return false;
        },
        requiredParentRoles,
      );

      if (!hasRequiredParent) {
        results.push({
          ruleId: 'aria-required-parent',
          type: 'violation',
          message: `Element with role="${roleName}" must be contained in an element with role: ${requiredParentRoles.join(', ')}.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-required-parent',
          type: 'pass',
          message: `Element with role="${roleName}" is correctly nested in a required parent role.`,
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
