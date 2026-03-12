import type { Rule, RuleResult } from '../../types.js';

const TOGGLE_FIELD_ROLES = ['checkbox', 'menuitemcheckbox', 'menuitemradio', 'radio', 'switch'];

export const ariaToggleFieldName: Rule = {
  meta: {
    id: 'aria-toggle-field-name',
    name: 'ARIA toggle fields must have an accessible name',
    description: 'Ensures elements with ARIA toggle field roles (checkbox, menuitemcheckbox, menuitemradio, radio, switch) have an accessible name.',
    wcagCriteria: ['4.1.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const selector = TOGGLE_FIELD_ROLES.map(r => `[role="${r}"]`).join(', ');
    const elements = await context.querySelectorAll(selector);

    for (const el of elements) {
      const role = await el.getAttribute('role');
      if (!role) continue;

      const roleName = role.trim().toLowerCase();
      if (!TOGGLE_FIELD_ROLES.includes(roleName)) continue;

      const accessibleName = await el.getAccessibleName();

      if (!accessibleName || !accessibleName.trim()) {
        results.push({
          ruleId: 'aria-toggle-field-name',
          type: 'violation',
          message: `Element with role="${roleName}" does not have an accessible name. Add aria-label, aria-labelledby, or a visible label.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-toggle-field-name',
          type: 'pass',
          message: `Element with role="${roleName}" has an accessible name.`,
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
