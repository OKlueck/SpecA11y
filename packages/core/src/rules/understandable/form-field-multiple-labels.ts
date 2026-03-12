import type { Rule, RuleResult } from '../../types.js';

export const formFieldMultipleLabels: Rule = {
  meta: {
    id: 'form-field-multiple-labels',
    name: 'Form fields should not have multiple labels',
    description: 'Ensures form fields do not have multiple <label> elements pointing to the same ID, which can cause confusion for assistive technologies.',
    wcagCriteria: ['3.3.2'],
    severity: 'moderate',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const duplicates = await context.page.evaluate(() => {
      const labels = document.querySelectorAll('label[for]');
      const labelsByTarget: Record<string, { count: number; selectors: string[] }> = {};

      labels.forEach((label, index) => {
        const forAttr = label.getAttribute('for');
        if (!forAttr) return;

        if (!labelsByTarget[forAttr]) {
          labelsByTarget[forAttr] = { count: 0, selectors: [] };
        }
        labelsByTarget[forAttr].count++;
        labelsByTarget[forAttr].selectors.push(`label[for="${forAttr}"]:nth-of-type(${index + 1})`);
      });

      const duplicateEntries: Array<{ targetId: string; count: number; targetHtml: string; targetSelector: string }> = [];

      for (const [targetId, info] of Object.entries(labelsByTarget)) {
        if (info.count > 1) {
          const targetEl = document.getElementById(targetId);
          duplicateEntries.push({
            targetId,
            count: info.count,
            targetHtml: targetEl ? targetEl.outerHTML.slice(0, 200) : `#${targetId}`,
            targetSelector: targetEl ? `#${targetId}` : `#${targetId}`,
          });
        }
      }

      return duplicateEntries;
    });

    for (const dup of duplicates) {
      results.push({
        ruleId: 'form-field-multiple-labels',
        type: 'violation',
        message: `Form field has ${dup.count} labels pointing to it. Each form field should have only one associated <label>.`,
        element: {
          selector: dup.targetSelector,
          html: dup.targetHtml,
        },
      });
    }

    if (duplicates.length === 0) {
      results.push({
        ruleId: 'form-field-multiple-labels',
        type: 'pass',
        message: 'No form fields have multiple labels.',
      });
    }

    return results;
  },
};
