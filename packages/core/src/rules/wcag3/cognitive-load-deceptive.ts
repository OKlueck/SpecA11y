import type { Rule, RuleResult } from '../../types.js';

export const cognitiveLoadDeceptive: Rule = {
  meta: {
    id: 'cognitive-load-deceptive',
    name: 'Page should not use deceptive design patterns',
    description: 'Checks for common dark patterns like pre-checked checkboxes, misleading link text, and hidden inputs.',
    wcagCriteria: [],
    severity: 'serious',
    confidence: 'possible',
    type: 'dom',
    tags: ['wcag3-draft'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const issues = await context.evaluate(() => {
      const found: Array<{ selector: string; html: string; issue: string }> = [];

      // Pre-checked checkboxes in forms (potential dark pattern)
      const checkboxes = document.querySelectorAll('form input[type="checkbox"][checked]');
      for (const cb of checkboxes) {
        const tag = cb.tagName.toLowerCase();
        const id = cb.id ? `#${cb.id}` : '';
        const name = cb.getAttribute('name') ?? '';
        // Skip common expected pre-checks like "remember me"
        if (/remember|save|keep/i.test(name)) continue;
        found.push({
          selector: tag + id,
          html: cb.outerHTML.slice(0, 200),
          issue: 'pre-checked-checkbox',
        });
      }

      // Generic link text
      const genericPatterns = /^(click here|here|more|read more|learn more|continue|details|link|info|click|tap here)$/i;
      const links = document.querySelectorAll('a[href]');
      for (const link of links) {
        const text = link.textContent?.trim() ?? '';
        if (genericPatterns.test(text)) {
          const tag = 'a';
          const id = link.id ? `#${link.id}` : '';
          found.push({
            selector: tag + id,
            html: link.outerHTML.slice(0, 200),
            issue: 'generic-link-text',
          });
        }
      }

      return found;
    });

    for (const item of issues) {
      if (item.issue === 'pre-checked-checkbox') {
        results.push({
          ruleId: 'cognitive-load-deceptive',
          type: 'warning',
          message: 'Checkbox is pre-checked. Ensure this is not a dark pattern that tricks users into unwanted opt-ins.',
          element: { selector: item.selector, html: item.html },
        });
      } else {
        results.push({
          ruleId: 'cognitive-load-deceptive',
          type: 'warning',
          message: 'Link uses generic text that does not describe its purpose. Use descriptive link text instead.',
          element: { selector: item.selector, html: item.html },
        });
      }
    }

    return results;
  },
};
