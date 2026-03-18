import type { Rule, RuleResult } from '../../types.js';

const SEMANTIC_ELEMENTS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'nav', 'main', 'header', 'footer',
  'table', 'form', 'fieldset',
  'article', 'aside', 'section',
]);

export const presentationRoleOnSemantic: Rule = {
  meta: {
    id: 'presentation-role-on-semantic',
    name: 'Semantic elements must not have role="presentation" or role="none"',
    description:
      'Detects role="presentation" or role="none" on semantically meaningful HTML elements, which strips their accessibility semantics.',
    wcagCriteria: ['1.3.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[role="presentation"], [role="none"]');

    for (const el of elements) {
      const html = await el.getOuterHTML();
      const tagMatch = html.match(/^<(\w+)/i);
      const tagName = tagMatch?.[1]?.toLowerCase() ?? '';

      if (SEMANTIC_ELEMENTS.has(tagName)) {
        const role = html.match(/role\s*=\s*["'](\w+)["']/i)?.[1] ?? 'presentation';
        results.push({
          ruleId: 'presentation-role-on-semantic',
          type: 'violation',
          message:
            `<${tagName}> has role="${role}" which removes its semantic meaning. ` +
            `This element conveys important structural information that assistive technologies rely on.`,
          element: el.toTarget(html, await el.getBoundingBox()),
        });
      }
    }

    return results;
  },
};
