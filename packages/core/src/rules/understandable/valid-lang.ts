import type { Rule, RuleResult } from '../../types.js';

const VALID_LANG_PATTERN = /^[a-z]{2,3}(-[a-zA-Z0-9]+)*$/;

export const validLang: Rule = {
  meta: {
    id: 'valid-lang',
    name: 'Elements with lang attribute must have a valid value',
    description: 'Ensures elements with a lang attribute use valid BCP 47 language codes.',
    wcagCriteria: ['3.1.2'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const elements = await context.querySelectorAll('[lang]');

    for (const el of elements) {
      const lang = await el.getAttribute('lang');

      if (!lang || !lang.trim()) {
        results.push({
          ruleId: 'valid-lang',
          type: 'violation',
          message: 'Element has an empty lang attribute.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else if (!VALID_LANG_PATTERN.test(lang.trim())) {
        results.push({
          ruleId: 'valid-lang',
          type: 'violation',
          message: `Element has an invalid lang attribute value: "${lang}".`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      } else {
        results.push({
          ruleId: 'valid-lang',
          type: 'pass',
          message: `Element has a valid lang attribute: "${lang}".`,
          element: {
            selector: el.selector,
            html: await el.getOuterHTML(),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
