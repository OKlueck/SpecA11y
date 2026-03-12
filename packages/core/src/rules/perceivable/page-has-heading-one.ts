import type { Rule, RuleResult } from '../../types.js';

export const pageHasHeadingOne: Rule = {
  meta: {
    id: 'page-has-heading-one',
    name: 'Page must contain a level-one heading',
    description: 'Ensures the page has at least one <h1> or an element with [role="heading"][aria-level="1"].',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const hasH1 = await context.evaluate(() => {
      if (document.querySelector('h1')) return true;
      if (document.querySelector('[role="heading"][aria-level="1"]')) return true;
      return false;
    });

    if (hasH1) {
      return [{
        ruleId: 'page-has-heading-one',
        type: 'pass',
        message: 'Page has a level-one heading.',
      }];
    }

    return [{
      ruleId: 'page-has-heading-one',
      type: 'violation',
      message: 'Page does not have a level-one heading. Add an <h1> element or an element with role="heading" and aria-level="1".',
    }];
  },
};
