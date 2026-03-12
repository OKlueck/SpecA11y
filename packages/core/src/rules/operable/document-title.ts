import type { Rule, RuleResult } from '../../types.js';

export const documentTitle: Rule = {
  meta: {
    id: 'document-title',
    name: 'Documents must have a <title> element',
    description: 'Ensures the page has a non-empty <title> element.',
    wcagCriteria: ['2.4.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const title = await context.evaluate(() => document.title?.trim());

    if (title) {
      return [{
        ruleId: 'document-title',
        type: 'pass',
        message: `Page has title: "${title}"`,
      }];
    }

    return [{
      ruleId: 'document-title',
      type: 'violation',
      message: 'Document does not have a non-empty <title> element.',
    }];
  },
};
