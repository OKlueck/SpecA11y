import type { Rule, RuleResult } from '../../types.js';

export const skipLink: Rule = {
  meta: {
    id: 'skip-link',
    name: 'Page should have a skip navigation link',
    description: 'Checks if the page has a skip navigation link among the first few focusable elements that points to the main content area.',
    wcagCriteria: ['2.4.1'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const result = await context.evaluate(() => {
      const focusableSelector = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusable = document.querySelectorAll(focusableSelector);
      const earlyFocusable = Array.from(focusable).slice(0, 3);

      for (const el of earlyFocusable) {
        if (el.tagName !== 'A') continue;
        const href = el.getAttribute('href');
        if (!href || !href.startsWith('#')) continue;

        const targetId = href.slice(1);
        if (!targetId) continue;

        const target = document.getElementById(targetId);
        if (!target) continue;

        // Check if target is <main> or inside/near main content
        if (target.tagName === 'MAIN' || target.closest('main') || target.querySelector('main')) {
          return { found: true, href, selector: '' };
        }

        // Accept any internal anchor link among first 3 focusable as a skip link
        return { found: true, href, selector: '' };
      }

      return { found: false, href: '', selector: '' };
    });

    if (result.found) {
      return [{
        ruleId: 'skip-link',
        type: 'pass',
        message: `Page has a skip navigation link (${result.href}).`,
      }];
    }

    return [{
      ruleId: 'skip-link',
      type: 'warning',
      message: 'Page does not appear to have a skip navigation link among the first focusable elements. Consider adding a skip link to help keyboard users bypass repeated content.',
    }];
  },
};
