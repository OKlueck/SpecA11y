import type { Rule, RuleResult } from '../../types.js';

export const ariaHiddenBody: Rule = {
  meta: {
    id: 'aria-hidden-body',
    name: 'aria-hidden="true" must not be present on the body',
    description: 'Ensures aria-hidden="true" is not set on the <body> element, which would hide the entire page from assistive technologies.',
    wcagCriteria: ['4.1.2'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const ariaHidden = await context.getAttribute('body', 'aria-hidden');

    if (ariaHidden === 'true') {
      return [{
        ruleId: 'aria-hidden-body',
        type: 'violation',
        message: 'The <body> element has aria-hidden="true", which hides the entire page from assistive technologies.',
      }];
    }

    return [{
      ruleId: 'aria-hidden-body',
      type: 'pass',
      message: 'The <body> element does not have aria-hidden="true".',
    }];
  },
};
