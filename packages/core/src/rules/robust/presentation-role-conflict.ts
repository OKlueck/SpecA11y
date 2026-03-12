import type { Rule, RuleResult } from '../../types.js';

const GLOBAL_ARIA_ATTRS = [
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-details',
  'aria-flowto',
  'aria-controls',
  'aria-owns',
  'aria-live',
  'aria-atomic',
  'aria-busy',
  'aria-relevant',
  'aria-dropeffect',
  'aria-grabbed',
  'aria-keyshortcuts',
  'aria-roledescription',
  'aria-errormessage',
  'aria-haspopup',
];

export const presentationRoleConflict: Rule = {
  meta: {
    id: 'presentation-role-conflict',
    name: 'Presentation role must not conflict with ARIA attributes or focusability',
    description: 'Elements with role="presentation" or role="none" should not have global ARIA attributes or tabindex that conflict with the presentation semantics.',
    wcagCriteria: ['best-practice'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[role="presentation"], [role="none"]');

    for (const el of elements) {
      const conflicts: string[] = [];

      for (const attr of GLOBAL_ARIA_ATTRS) {
        const value = await el.getAttribute(attr);
        if (value !== null && value !== '') {
          conflicts.push(attr);
        }
      }

      const tabindex = await el.getAttribute('tabindex');
      if (tabindex !== null) {
        conflicts.push('tabindex');
      }

      const role = await el.getAttribute('role');

      if (conflicts.length > 0) {
        results.push({
          ruleId: 'presentation-role-conflict',
          type: 'violation',
          message: `Element with role="${role}" has conflicting attributes: ${conflicts.join(', ')}. These attributes override or conflict with the presentation role.`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'presentation-role-conflict',
          type: 'pass',
          message: `Element with role="${role}" has no conflicting ARIA attributes or tabindex.`,
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
