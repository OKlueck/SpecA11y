import type { Rule, RuleResult } from '../../types.js';

const SENSORY_PATTERN =
  /\b(click the\s+\w+\s*(shaped|colored)|see the\s+(red|green|blue|colored)\b|the\s+(item|button|link|section|element)\s+(on the\s+)?(left|right|above|below)|the\s+(round|square|triangular|circular)\s+(button|icon|element|item)|look\s+at\s+the\s+(left|right|top|bottom))\b/i;

const DIRECTIONAL_INSTRUCTION =
  /\b(as\s+described\s+(above|below)|in\s+the\s+(left|right)\s+(column|sidebar|panel|section)|the\s+(red|green|blue|yellow|orange|purple)\s+(text|button|link|box|area|section|indicator))\b/i;

export const sensoryCharacteristics: Rule = {
  meta: {
    id: 'sensory-characteristics',
    name: 'Instructions must not rely solely on sensory characteristics',
    description:
      'Heuristic check that text content does not rely solely on shape, color, size, visual location, or other sensory characteristics to convey instructions.',
    wcagCriteria: ['1.3.3'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    const textNodes = await context.evaluate(() => {
      const out: { selector: string; html: string; text: string }[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = (node.textContent ?? '').trim();
        if (text.length < 10) continue;

        const parent = node.parentElement;
        if (!parent) continue;

        const tag = parent.tagName.toLowerCase();
        // Skip script/style
        if (tag === 'script' || tag === 'style' || tag === 'noscript') continue;

        const id = parent.id ? `#${parent.id}` : '';
        const cls =
          parent.className && typeof parent.className === 'string'
            ? `.${parent.className.trim().split(/\s+/).join('.')}`
            : '';

        out.push({
          selector: `${tag}${id}${cls}`,
          html: parent.outerHTML.slice(0, 200),
          text,
        });
      }

      return out;
    });

    for (const node of textNodes) {
      const matchSensory = node.text.match(SENSORY_PATTERN);
      const matchDirectional = node.text.match(DIRECTIONAL_INSTRUCTION);

      const match = matchSensory ?? matchDirectional;
      if (match) {
        results.push({
          ruleId: 'sensory-characteristics',
          type: 'warning',
          message: `Text may rely on sensory characteristics: "${match[0]}". Ensure instructions do not depend solely on shape, color, size, or visual location.`,
          element: {
            selector: node.selector,
            html: node.html,
          },
        });
      }
    }

    return results;
  },
};
