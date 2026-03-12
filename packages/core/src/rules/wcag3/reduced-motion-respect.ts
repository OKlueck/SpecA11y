import type { Rule, RuleResult } from '../../types.js';

export const reducedMotionRespect: Rule = {
  meta: {
    id: 'reduced-motion-respect',
    name: 'Page should respect prefers-reduced-motion',
    description: 'Checks if pages with animations also include a prefers-reduced-motion media query.',
    wcagCriteria: [],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
    tags: ['wcag3-draft'],
  },

  async run(context): Promise<RuleResult[]> {
    const info = await context.evaluate(() => {
      let hasAnimations = false;
      let hasReducedMotionQuery = false;

      // Check stylesheets for animations and reduced-motion queries
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const text = rule.cssText;
            if (/animation|transition|@keyframes/.test(text)) hasAnimations = true;
            if (rule instanceof CSSMediaRule && /prefers-reduced-motion/.test(rule.conditionText)) {
              hasReducedMotionQuery = true;
            }
          }
        } catch {
          // Cross-origin stylesheets — skip
        }
      }

      // Check inline styles
      if (!hasAnimations) {
        const all = document.querySelectorAll('[style]');
        for (const el of all) {
          const style = el.getAttribute('style') ?? '';
          if (/animation|transition/.test(style)) {
            hasAnimations = true;
            break;
          }
        }
      }

      return { hasAnimations, hasReducedMotionQuery };
    });

    if (info.hasAnimations && !info.hasReducedMotionQuery) {
      return [{
        ruleId: 'reduced-motion-respect',
        type: 'warning',
        message: 'Page uses CSS animations/transitions but does not include a @media (prefers-reduced-motion) query. Consider disabling or reducing motion for users who prefer it.',
      }];
    }

    if (info.hasAnimations && info.hasReducedMotionQuery) {
      return [{
        ruleId: 'reduced-motion-respect',
        type: 'pass',
        message: 'Page includes prefers-reduced-motion media query alongside animations.',
      }];
    }

    return [];
  },
};
