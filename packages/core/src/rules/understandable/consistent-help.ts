import type { Rule, RuleResult } from '../../types.js';

export const consistentHelp: Rule = {
  meta: {
    id: 'consistent-help',
    name: 'Help mechanisms should be available',
    description: 'Checks if the page provides help mechanisms like contact info, help links, or chat widgets.',
    wcagCriteria: ['3.2.6'],
    severity: 'moderate',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const hasHelp = await context.evaluate(() => {
      const helpPatterns = /\b(help|contact|support|hilfe|kontakt|aide|ayuda|faq)\b/i;
      const links = document.querySelectorAll('a[href], button');
      for (const el of links) {
        const text = el.textContent?.trim() ?? '';
        const ariaLabel = el.getAttribute('aria-label') ?? '';
        if (helpPatterns.test(text) || helpPatterns.test(ariaLabel)) return true;
      }
      // Check for chat widgets
      if (document.querySelector('[class*="chat"], [id*="chat"], [class*="intercom"], [id*="intercom"]')) return true;
      return false;
    });

    if (hasHelp) {
      return [{
        ruleId: 'consistent-help',
        type: 'pass',
        message: 'Page has help/contact mechanisms available.',
      }];
    }

    return [{
      ruleId: 'consistent-help',
      type: 'incomplete',
      message: 'No help mechanism detected. Ensure help, contact, or support links are consistently available across pages.',
    }];
  },
};
