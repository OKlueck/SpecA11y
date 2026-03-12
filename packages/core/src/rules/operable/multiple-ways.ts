import type { Rule, RuleResult } from '../../types.js';

export const multipleWays: Rule = {
  meta: {
    id: 'multiple-ways',
    name: 'Page should provide multiple ways to locate content',
    description: 'Checks that the page provides at least one of: navigation landmark, search functionality, sitemap link, or table of contents.',
    wcagCriteria: ['2.4.5'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const findings = await context.evaluate(() => {
      const ways: string[] = [];

      // Check for navigation landmark
      if (document.querySelector('nav') || document.querySelector('[role="navigation"]')) {
        ways.push('navigation landmark');
      }

      // Check for search functionality
      if (
        document.querySelector('[role="search"]') ||
        document.querySelector('input[type="search"]') ||
        document.querySelector('form[role="search"]')
      ) {
        ways.push('search functionality');
      }

      // Check for sitemap link
      const links = document.querySelectorAll('a[href]');
      for (const link of links) {
        const href = (link as HTMLAnchorElement).href.toLowerCase();
        const text = (link.textContent ?? '').toLowerCase();
        if (href.includes('sitemap') || text.includes('sitemap') || text.includes('site map')) {
          ways.push('sitemap link');
          break;
        }
      }

      // Check for table of contents
      const tocIndicators = [
        '[role="directory"]',
        '[aria-label*="table of contents" i]',
        '[aria-label*="toc" i]',
        '#toc',
        '#table-of-contents',
        '.toc',
        '.table-of-contents',
      ];
      for (const sel of tocIndicators) {
        try {
          if (document.querySelector(sel)) {
            ways.push('table of contents');
            break;
          }
        } catch {
          // Selector may not be supported, skip
        }
      }

      return ways;
    });

    if (findings.length >= 1) {
      return [{
        ruleId: 'multiple-ways',
        type: 'pass',
        message: `Page provides ways to locate content: ${findings.join(', ')}.`,
      }];
    }

    return [{
      ruleId: 'multiple-ways',
      type: 'warning',
      message: 'Page does not appear to provide multiple ways to locate content. Consider adding a navigation landmark, search functionality, sitemap link, or table of contents.',
    }];
  },
};
