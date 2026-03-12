import type { Rule, RuleResult } from '../../types.js';

const LANDMARK_TAGS = new Set([
  'header', 'nav', 'main', 'aside', 'footer', 'section',
]);

const LANDMARK_ROLES = new Set([
  'banner', 'navigation', 'main', 'complementary', 'contentinfo',
  'region', 'search', 'form',
]);

const SKIP_TAGS = new Set([
  'script', 'style', 'link', 'meta', 'template', 'noscript',
]);

export const region: Rule = {
  meta: {
    id: 'region',
    name: 'All page content should be within landmark regions',
    description: 'Ensures all top-level children of <body> are contained within landmark regions (header, nav, main, aside, footer, section, form with accessible name, or elements with landmark roles).',
    wcagCriteria: ['best-practice'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const bodyChildren = await context.querySelectorAll('body > *');

    for (const child of bodyChildren) {
      const outerHTML = await child.getOuterHTML();
      const tagMatch = outerHTML.match(/^<(\w+)/i);
      const tag = tagMatch ? tagMatch[1].toLowerCase() : '';

      if (SKIP_TAGS.has(tag)) continue;

      const visible = await child.isVisible();
      if (!visible) continue;

      const role = await child.getAttribute('role');
      const isLandmarkTag = LANDMARK_TAGS.has(tag);
      const isLandmarkRole = role ? LANDMARK_ROLES.has(role.toLowerCase()) : false;

      // <form> is a landmark only with an accessible name
      let isFormLandmark = false;
      if (tag === 'form') {
        const name = await child.getAccessibleName();
        isFormLandmark = name.trim().length > 0;
      }

      if (isLandmarkTag || isLandmarkRole || isFormLandmark) {
        results.push({
          ruleId: 'region',
          type: 'pass',
          message: 'Element is a landmark region.',
          element: {
            selector: child.selector,
            html: outerHTML.substring(0, 200),
            boundingBox: await child.getBoundingBox(),
          },
        });
      } else {
        const textContent = await child.getTextContent();
        if (!textContent.trim()) continue;

        results.push({
          ruleId: 'region',
          type: 'violation',
          message: `Element <${tag}> is not contained within a landmark region. Wrap page content in appropriate landmarks (header, nav, main, footer, etc.).`,
          element: {
            selector: child.selector,
            html: outerHTML.substring(0, 200),
            boundingBox: await child.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
