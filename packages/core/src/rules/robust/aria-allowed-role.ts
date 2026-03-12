import type { Rule, RuleResult } from '../../types.js';

/**
 * Map of HTML tags to roles that are forbidden on them.
 * Interactive elements should not have non-interactive roles, and vice versa.
 */
const FORBIDDEN_ROLE_MAP: Record<string, Set<string>> = {
  a: new Set(['heading', 'img', 'presentation', 'none', 'separator', 'definition', 'term', 'listitem']),
  button: new Set(['heading', 'img', 'presentation', 'none', 'separator', 'definition', 'term', 'listitem', 'link']),
  img: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'menuitem', 'tab', 'switch', 'option', 'treeitem']),
  input: new Set(['img', 'heading', 'link', 'list', 'listitem', 'table', 'row', 'cell', 'article', 'definition', 'term', 'separator']),
  select: new Set(['img', 'heading', 'link', 'button', 'article', 'definition', 'term', 'separator']),
  textarea: new Set(['img', 'heading', 'link', 'button', 'article', 'definition', 'term', 'separator', 'checkbox', 'radio']),
  table: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'heading', 'img']),
  ul: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'heading', 'img']),
  ol: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'heading', 'img']),
  li: new Set(['table', 'row', 'cell', 'heading', 'img']),
  h1: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'img', 'listitem', 'cell', 'row']),
  h2: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'img', 'listitem', 'cell', 'row']),
  h3: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'img', 'listitem', 'cell', 'row']),
  h4: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'img', 'listitem', 'cell', 'row']),
  h5: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'img', 'listitem', 'cell', 'row']),
  h6: new Set(['button', 'link', 'checkbox', 'radio', 'textbox', 'img', 'listitem', 'cell', 'row']),
};

export const ariaAllowedRole: Rule = {
  meta: {
    id: 'aria-allowed-role',
    name: 'ARIA role must be compatible with element semantics',
    description:
      'Ensures elements only use ARIA roles that are compatible with their native HTML semantics.',
    wcagCriteria: [],
    severity: 'minor',
    confidence: 'likely',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[role]');

    for (const el of elements) {
      const role = await el.getAttribute('role');
      if (!role || !role.trim()) continue;

      const outerHTML = await el.getOuterHTML();
      const tagMatch = outerHTML.match(/^<(\w+)/i);
      if (!tagMatch) continue;

      const tag = tagMatch[1].toLowerCase();
      const primaryRole = role.trim().toLowerCase().split(/\s+/)[0];
      const forbidden = FORBIDDEN_ROLE_MAP[tag];

      if (forbidden && forbidden.has(primaryRole)) {
        results.push({
          ruleId: 'aria-allowed-role',
          type: 'violation',
          message: `The role "${primaryRole}" is not compatible with <${tag}>. This combination conflicts with the element's native semantics.`,
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'aria-allowed-role',
          type: 'pass',
          message: `The role "${primaryRole}" is compatible with <${tag}>.`,
          element: {
            selector: el.selector,
            html: outerHTML,
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
