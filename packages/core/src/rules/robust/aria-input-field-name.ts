import type { Rule, RuleResult } from '../../types.js';

const INPUT_FIELD_ROLES = ['combobox', 'listbox', 'searchbox', 'spinbutton', 'textbox'];

export const ariaInputFieldName: Rule = {
  meta: {
    id: 'aria-input-field-name',
    name: 'ARIA input fields must have an accessible name',
    description: 'Ensures elements with ARIA input field roles (combobox, listbox, searchbox, spinbutton, textbox) have an accessible name.',
    wcagCriteria: ['4.1.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const selector = INPUT_FIELD_ROLES.map(r => `[role="${r}"]`).join(', ');
    const elements = await context.querySelectorAll(selector);

    for (const el of elements) {
      const role = await el.getAttribute('role');
      if (!role) continue;

      const roleName = role.trim().toLowerCase();
      if (!INPUT_FIELD_ROLES.includes(roleName)) continue;

      const accessibleName = await el.getAccessibleName();

      if (!accessibleName || !accessibleName.trim()) {
        results.push({
          ruleId: 'aria-input-field-name',
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
          ruleId: 'aria-input-field-name',
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
