import type { Rule, RuleResult } from '../../types.js';

export const textCustomization: Rule = {
  meta: {
    id: 'text-customization',
    name: 'Text should be customizable by the user',
    description: 'Checks for fixed font sizes in absolute units that prevent text customization.',
    wcagCriteria: [],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
    tags: ['wcag3-draft'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const issues = await context.evaluate(() => {
      const found: Array<{ selector: string; html: string; property: string; value: string }> = [];
      const textProps = ['font-size', 'line-height', 'letter-spacing', 'word-spacing'];

      const all = document.querySelectorAll('[style]');
      for (const el of all) {
        const style = el.getAttribute('style') ?? '';
        for (const prop of textProps) {
          const match = style.match(new RegExp(`${prop}\\s*:\\s*([^;]+)`));
          if (match) {
            const value = match[1].trim();
            if (/^\d+(\.\d+)?px(\s*!important)?$/.test(value)) {
              const tag = el.tagName.toLowerCase();
              const id = el.id ? `#${el.id}` : '';
              found.push({
                selector: tag + id,
                html: el.outerHTML.slice(0, 200),
                property: prop,
                value,
              });
            }
          }
        }
      }
      return found;
    });

    for (const issue of issues) {
      results.push({
        ruleId: 'text-customization',
        type: 'warning',
        message: `Element uses fixed ${issue.property}: ${issue.value}. Use relative units (em, rem, %) for better text customization.`,
        element: { selector: issue.selector, html: issue.html },
      });
    }

    return results;
  },
};
