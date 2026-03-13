import type { Rule, RuleResult } from '../../types.js';

const GENERIC_LINK_PATTERNS: RegExp[] = [
  /^click here$/i,
  /^here$/i,
  /^hier$/i,
  /^hier klicken$/i,
  /^klicke hier$/i,
  /^klick hier$/i,
  /^mehr$/i,
  /^more$/i,
  /^read more$/i,
  /^mehr erfahren$/i,
  /^mehr lesen$/i,
  /^weiterlesen$/i,
  /^weiter$/i,
  /^continue$/i,
  /^learn more$/i,
  /^link$/i,
  /^this$/i,
  /^dies$/i,
  /^go$/i,
  /^los$/i,
  /^press here$/i,
  /^click$/i,
  /^klick$/i,
  /^info$/i,
  /^information$/i,
  /^details$/i,
  /^see more$/i,
  /^view more$/i,
  /^mehr anzeigen$/i,
  /^this page$/i,
  /^diese seite$/i,
  /^this link$/i,
  /^this article$/i,
];

export const linkNameQuality: Rule = {
  meta: {
    id: 'link-name-quality',
    name: 'Link text should describe the link purpose',
    description:
      'Checks that link accessible names are not generic placeholders like "click here", "more", or "read more".',
    wcagCriteria: ['2.4.4'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
    tags: ['semantic', 'heuristic'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const links = await context.querySelectorAll('a[href]');

    for (const link of links) {
      const name = await link.getAccessibleName();
      const trimmed = name.trim();

      // Skip empty names (caught by link-name rule)
      if (!trimmed) continue;

      const element = {
        selector: link.selector,
        html: await link.getOuterHTML(),
        boundingBox: await link.getBoundingBox(),
      };

      const isGeneric = GENERIC_LINK_PATTERNS.some((p) => p.test(trimmed));
      if (isGeneric) {
        results.push({
          ruleId: 'link-name-quality',
          type: 'warning',
          message: `Link has generic text "${trimmed}". Use descriptive text that explains the link destination or purpose.`,
          element,
        });
        continue;
      }

      // Single character links are suspicious
      if (trimmed.length === 1 && !/\d/.test(trimmed)) {
        results.push({
          ruleId: 'link-name-quality',
          type: 'warning',
          message: `Link text is only one character: "${trimmed}". This is likely not descriptive enough.`,
          element,
        });
        continue;
      }

      results.push({
        ruleId: 'link-name-quality',
        type: 'pass',
        message: 'Link text appears to describe its purpose.',
        element,
      });
    }

    return results;
  },
};
