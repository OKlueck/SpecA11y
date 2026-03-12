import type { Rule, RuleResult } from '../../types.js';

export const accesskeys: Rule = {
  meta: {
    id: 'accesskeys',
    name: 'accesskey attribute values must be unique',
    description: 'Ensures every accesskey attribute value is unique across the page.',
    wcagCriteria: ['2.4.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const accesskeyData = await context.evaluate(() => {
      const elements = document.querySelectorAll('[accesskey]');
      const entries: { selector: string; html: string; key: string }[] = [];

      elements.forEach((el, index) => {
        const key = el.getAttribute('accesskey') ?? '';
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className ? `.${String(el.className).split(' ').join('.')}` : '';
        entries.push({
          selector: `[accesskey="${key}"]:nth-of-type(${index + 1})`,
          html: el.outerHTML.slice(0, 200),
          key,
        });
      });

      return entries;
    });

    // Group by accesskey value
    const keyMap = new Map<string, typeof accesskeyData>();
    for (const entry of accesskeyData) {
      const existing = keyMap.get(entry.key) ?? [];
      existing.push(entry);
      keyMap.set(entry.key, existing);
    }

    for (const [key, entries] of keyMap) {
      if (entries.length > 1) {
        for (const entry of entries) {
          results.push({
            ruleId: 'accesskeys',
            type: 'violation',
            message: `Duplicate accesskey="${key}" found. accesskey values must be unique.`,
            element: {
              selector: entry.selector,
              html: entry.html,
            },
          });
        }
      } else {
        results.push({
          ruleId: 'accesskeys',
          type: 'pass',
          message: `accesskey="${key}" is unique.`,
          element: {
            selector: entries[0].selector,
            html: entries[0].html,
          },
        });
      }
    }

    return results;
  },
};
