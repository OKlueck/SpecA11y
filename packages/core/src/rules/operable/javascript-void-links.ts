import type { Rule, RuleResult } from '../../types.js';

export const javascriptVoidLinks: Rule = {
  meta: {
    id: 'javascript-void-links',
    name: 'Links must not use javascript: void or empty href patterns',
    description:
      'Detects links with href="javascript:void(0)", href="javascript:", or href="#" without proper role, which are inaccessible and semantically incorrect.',
    wcagCriteria: ['2.1.1', '4.1.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Check javascript: links
    const jsLinks = await context.querySelectorAll('a[href^="javascript:"]');
    for (const el of jsLinks) {
      results.push({
        ruleId: 'javascript-void-links',
        type: 'violation',
        message:
          'Link uses javascript: URI scheme. This is inaccessible — use a <button> for actions or a proper href for navigation.',
        element: {
          selector: el.selector,
          html: await el.getOuterHTML(),
          boundingBox: await el.getBoundingBox(),
        },
      });
    }

    // Check href="#" without role="button"
    const hashLinks = await context.querySelectorAll('a[href="#"]');
    for (const el of hashLinks) {
      const html = await el.getOuterHTML();
      const hasButtonRole = /role\s*=\s*["']button["']/i.test(html);
      if (!hasButtonRole) {
        results.push({
          ruleId: 'javascript-void-links',
          type: 'warning',
          message:
            'Link has href="#" without role="button". If this is an action, use a <button> or add role="button". If navigation, use a meaningful href.',
          element: {
            selector: el.selector,
            html,
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
