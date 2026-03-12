import type { Rule, RuleResult } from '../../types.js';

export const consistentNavigation: Rule = {
  meta: {
    id: 'consistent-navigation',
    name: 'Navigation elements should have consistent structure',
    description: 'Checks that nav elements use a consistent list-based structure with links, which supports predictable navigation for assistive technology users.',
    wcagCriteria: ['3.2.3'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const navElements = await context.querySelectorAll('nav, [role="navigation"]');

    if (navElements.length === 0) {
      results.push({
        ruleId: 'consistent-navigation',
        type: 'warning',
        message: 'No <nav> or [role="navigation"] elements found. Pages should have a navigation landmark for consistent navigation.',
      });
      return results;
    }

    for (const nav of navElements) {
      const structureInfo = await context.page.locator(nav.selector).evaluate((el) => {
        if (!el) return null;

        const lists = el.querySelectorAll('ul, ol');
        const hasListStructure = lists.length > 0;
        let hasListLinks = false;

        if (hasListStructure) {
          for (const list of lists) {
            const listItems = list.querySelectorAll('li');
            for (const li of listItems) {
              if (li.querySelector('a')) {
                hasListLinks = true;
                break;
              }
            }
            if (hasListLinks) break;
          }
        }

        const directLinks = el.querySelectorAll('a');
        const hasLinks = directLinks.length > 0;

        return { hasListStructure, hasListLinks, hasLinks };
      });

      if (!structureInfo) continue;

      if (structureInfo.hasListStructure && structureInfo.hasListLinks) {
        results.push({
          ruleId: 'consistent-navigation',
          type: 'pass',
          message: 'Navigation element uses a consistent list-based structure with links.',
          element: {
            selector: nav.selector,
            html: await nav.getOuterHTML(),
          },
        });
      } else if (structureInfo.hasLinks && !structureInfo.hasListStructure) {
        results.push({
          ruleId: 'consistent-navigation',
          type: 'warning',
          message: 'Navigation element contains links but does not use a list structure (ul/ol with li > a). Using lists provides better structure for assistive technologies.',
          element: {
            selector: nav.selector,
            html: await nav.getOuterHTML(),
          },
        });
      } else {
        results.push({
          ruleId: 'consistent-navigation',
          type: 'warning',
          message: 'Navigation element does not contain a recognizable navigation structure. Use a list of links (ul/ol with li > a) for consistent navigation.',
          element: {
            selector: nav.selector,
            html: await nav.getOuterHTML(),
          },
        });
      }
    }

    return results;
  },
};
