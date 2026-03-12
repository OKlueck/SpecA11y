import type { Rule, RuleResult } from '../../types.js';

// BCP 47 primary language subtags (subset of common ones)
const VALID_LANG_PATTERN = /^[a-z]{2,3}(-[a-zA-Z0-9]+)*$/;

export const htmlHasLang: Rule = {
  meta: {
    id: 'html-has-lang',
    name: 'HTML element must have a lang attribute',
    description: 'Ensures the <html> element has a valid lang attribute.',
    wcagCriteria: ['3.1.1'],
    severity: 'serious',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const lang = await context.getAttribute('html', 'lang');

    if (!lang || !lang.trim()) {
      return [{
        ruleId: 'html-has-lang',
        type: 'violation',
        message: 'The <html> element does not have a lang attribute.',
      }];
    }

    if (!VALID_LANG_PATTERN.test(lang.trim())) {
      return [{
        ruleId: 'html-has-lang',
        type: 'violation',
        message: `The <html> element has an invalid lang attribute value: "${lang}".`,
      }];
    }

    return [{
      ruleId: 'html-has-lang',
      type: 'pass',
      message: `Page language is set to "${lang}".`,
    }];
  },
};
