import type { Rule, RuleResult } from '../../types.js';

export const landmarkMain: Rule = {
  meta: {
    id: 'landmark-main',
    name: 'Page must have exactly one main landmark',
    description: 'Ensures the page contains exactly one <main> or [role="main"] landmark. Zero is a violation, multiple produces a warning.',
    wcagCriteria: ['1.3.1'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const count = await context.evaluate(() => {
      const mains = document.querySelectorAll('main, [role="main"]');
      return mains.length;
    });

    if (count === 1) {
      return [{
        ruleId: 'landmark-main',
        type: 'pass',
        message: 'Page has exactly one main landmark.',
      }];
    }

    if (count === 0) {
      return [{
        ruleId: 'landmark-main',
        type: 'violation',
        message: 'Page does not have a main landmark. Add a <main> element or an element with role="main".',
      }];
    }

    // count > 1
    return [{
      ruleId: 'landmark-main',
      type: 'warning',
      message: `Page has ${count} main landmarks. There should be exactly one <main> or [role="main"].`,
    }];
  },
};
