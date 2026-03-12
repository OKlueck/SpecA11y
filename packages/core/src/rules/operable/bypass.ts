import type { Rule, RuleResult } from '../../types.js';

export const bypass: Rule = {
  meta: {
    id: 'bypass',
    name: 'Page must provide a mechanism to bypass repeated blocks of content',
    description: 'Ensures the page has a skip link, <main> landmark, or [role="main"] to allow users to bypass repeated content.',
    wcagCriteria: ['2.4.1'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const result = await context.evaluate(() => {
      // Check for <main> landmark
      if (document.querySelector('main')) return 'main';

      // Check for role="main"
      if (document.querySelector('[role="main"]')) return 'role-main';

      // Check for skip link early in DOM (within first 8 elements)
      const allElements = document.body?.querySelectorAll('*');
      if (allElements) {
        const earlyElements = Array.from(allElements).slice(0, 8);
        for (const el of earlyElements) {
          if (el.tagName === 'A' && (el as HTMLAnchorElement).getAttribute('href')?.startsWith('#')) {
            return 'skip-link';
          }
        }
      }

      return null;
    });

    if (result) {
      const descriptions: Record<string, string> = {
        'main': 'Page has a <main> landmark.',
        'role-main': 'Page has an element with role="main".',
        'skip-link': 'Page has a skip navigation link.',
      };
      return [{
        ruleId: 'bypass',
        type: 'pass',
        message: descriptions[result],
      }];
    }

    return [{
      ruleId: 'bypass',
      type: 'violation',
      message: 'Page does not have a mechanism to bypass repeated blocks of content. Add a skip link, <main> element, or role="main".',
    }];
  },
};
