import type { Rule, RuleResult } from '../../types.js';

export const duplicateId: Rule = {
  meta: {
    id: 'duplicate-id',
    name: 'ID attributes must be unique',
    description: 'Ensures every id attribute value on the page is unique.',
    wcagCriteria: ['4.1.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const duplicates = await context.page.evaluate(() => {
      const allElements = document.querySelectorAll('[id]');
      const idMap: Record<string, { count: number; elements: Array<{ selector: string; html: string }> }> = {};

      allElements.forEach((el) => {
        const id = el.id;
        if (!id) return;

        if (!idMap[id]) {
          idMap[id] = { count: 0, elements: [] };
        }
        idMap[id].count++;

        let selector = `#${id}`;
        // For duplicates, add tag to differentiate
        if (idMap[id].count > 1) {
          selector = `${el.tagName.toLowerCase()}#${id}`;
        }

        idMap[id].elements.push({
          selector,
          html: el.outerHTML.slice(0, 200),
        });
      });

      const duplicateEntries: Array<{ id: string; count: number; elements: Array<{ selector: string; html: string }> }> = [];

      for (const [id, info] of Object.entries(idMap)) {
        if (info.count > 1) {
          duplicateEntries.push({
            id,
            count: info.count,
            elements: info.elements,
          });
        }
      }

      return duplicateEntries;
    });

    for (const dup of duplicates) {
      for (const el of dup.elements) {
        results.push({
          ruleId: 'duplicate-id',
          type: 'violation',
          message: `Duplicate ID "${dup.id}" found (${dup.count} elements share this ID). IDs must be unique on the page.`,
          element: {
            selector: el.selector,
            html: el.html,
          },
        });
      }
    }

    if (duplicates.length === 0) {
      results.push({
        ruleId: 'duplicate-id',
        type: 'pass',
        message: 'All ID attributes on the page are unique.',
      });
    }

    return results;
  },
};
