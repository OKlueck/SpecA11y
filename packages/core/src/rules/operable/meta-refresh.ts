import type { Rule, RuleResult } from '../../types.js';

export const metaRefresh: Rule = {
  meta: {
    id: 'meta-refresh',
    name: '<meta http-equiv="refresh"> must not be used with a timed delay',
    description: 'Ensures <meta http-equiv="refresh"> is not used to auto-redirect with a delay or to refresh the page on a timer.',
    wcagCriteria: ['2.2.1'],
    severity: 'critical',
    confidence: 'certain',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const metas = await context.querySelectorAll('meta[http-equiv="refresh"]');

    for (const meta of metas) {
      const content = await meta.getAttribute('content');

      if (!content) {
        results.push({
          ruleId: 'meta-refresh',
          type: 'pass',
          message: 'meta refresh has no content attribute.',
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
          },
        });
        continue;
      }

      const trimmed = content.trim().toLowerCase();

      // Parse the delay value (the number before any semicolon)
      const match = trimmed.match(/^(\d+)\s*(;|$)/);
      if (!match) {
        results.push({
          ruleId: 'meta-refresh',
          type: 'pass',
          message: 'meta refresh content could not be parsed.',
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
          },
        });
        continue;
      }

      const delay = parseInt(match[1], 10);
      const hasUrl = /url\s*=/i.test(trimmed);

      if (delay === 0 && hasUrl) {
        // Instant redirect is acceptable
        results.push({
          ruleId: 'meta-refresh',
          type: 'pass',
          message: 'meta refresh performs an instant redirect (delay is 0).',
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
          },
        });
      } else if (delay > 0 && hasUrl) {
        // Delayed redirect is a violation
        results.push({
          ruleId: 'meta-refresh',
          type: 'violation',
          message: `meta refresh redirects after a ${delay}-second delay. Timed redirects are not allowed.`,
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
          },
        });
      } else if (delay > 0) {
        // Timed page refresh without URL is also a violation
        results.push({
          ruleId: 'meta-refresh',
          type: 'violation',
          message: `meta refresh reloads the page after ${delay} seconds. Timed refreshes are not allowed.`,
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
          },
        });
      } else {
        results.push({
          ruleId: 'meta-refresh',
          type: 'pass',
          message: 'meta refresh has no timed delay.',
          element: {
            selector: meta.selector,
            html: await meta.getOuterHTML(),
          },
        });
      }
    }

    return results;
  },
};
