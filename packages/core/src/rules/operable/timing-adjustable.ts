import type { Rule, RuleResult } from '../../types.js';

export const timingAdjustable: Rule = {
  meta: {
    id: 'timing-adjustable',
    name: 'Time limits must be adjustable',
    description: 'Checks for meta refresh with timed delays and inline scripts using setTimeout/setInterval that may impose time limits without user control.',
    wcagCriteria: ['2.2.1'],
    severity: 'serious',
    confidence: 'possible',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Check for <meta http-equiv="refresh"> with time > 0
    const metas = await context.querySelectorAll('meta[http-equiv="refresh"]');

    for (const meta of metas) {
      const content = await meta.getAttribute('content');
      if (!content) continue;

      const match = content.trim().match(/^(\d+)\s*(;|$)/);
      if (match) {
        const delay = parseInt(match[1], 10);
        if (delay > 0) {
          results.push({
            ruleId: 'timing-adjustable',
            type: 'warning',
            message: `Page has meta refresh with a ${delay}-second delay. Ensure users can extend, adjust, or disable this time limit.`,
            element: {
              selector: meta.selector,
              html: await meta.getOuterHTML(),
            },
          });
        }
      }
    }

    // Check for inline scripts containing setTimeout/setInterval
    const timerUsage = await context.evaluate(() => {
      const scripts = document.querySelectorAll('script:not([src])');
      const found: { selector: string; html: string; timerType: string }[] = [];

      scripts.forEach((script, index) => {
        const text = script.textContent ?? '';
        const hasSetTimeout = /\bsetTimeout\s*\(/.test(text);
        const hasSetInterval = /\bsetInterval\s*\(/.test(text);

        if (hasSetTimeout || hasSetInterval) {
          const timerType = [
            hasSetTimeout ? 'setTimeout' : '',
            hasSetInterval ? 'setInterval' : '',
          ].filter(Boolean).join(', ');

          found.push({
            selector: `script:nth-of-type(${index + 1})`,
            html: `<script>${text.slice(0, 150)}${text.length > 150 ? '...' : ''}</script>`,
            timerType,
          });
        }
      });

      return found;
    });

    for (const entry of timerUsage) {
      results.push({
        ruleId: 'timing-adjustable',
        type: 'warning',
        message: `Inline script uses ${entry.timerType}. If this creates a time limit for users, ensure it can be turned off, adjusted, or extended.`,
        element: {
          selector: entry.selector,
          html: entry.html,
        },
      });
    }

    return results;
  },
};
