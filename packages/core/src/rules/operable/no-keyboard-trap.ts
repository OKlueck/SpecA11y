import type { Rule, RuleResult } from '../../types.js';

const MAX_TABS = 100;

interface FocusInfo {
  selector: string;
  html: string;
  isDialog: boolean;
  isBody: boolean;
}

export const noKeyboardTrap: Rule = {
  meta: {
    id: 'no-keyboard-trap',
    name: 'Focus must not be trapped by any element',
    description: 'Simulates Tab keypresses and verifies that keyboard focus can move freely through all focusable elements without getting stuck.',
    wcagCriteria: ['2.1.2'],
    severity: 'critical',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const page = context.page;

    // Helper to get info about the currently focused element
    async function getFocusInfo(): Promise<FocusInfo | null> {
      return page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;

        const isBody = el === document.body || el === document.documentElement;
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';

        // Check if inside a dialog/modal (intentional focus trapping is OK)
        const isDialog = !!(
          el.closest('[role="dialog"]') ||
          el.closest('[aria-modal="true"]') ||
          el.closest('dialog')
        );

        return {
          selector: tag + id,
          html: el.outerHTML.slice(0, 200),
          isDialog,
          isBody,
        };
      });
    }

    // Generate a unique key for a focused element
    function focusKey(info: FocusInfo): string {
      return info.selector;
    }

    // Tab through the page and detect traps
    const visited: string[] = [];
    let stuckCount = 0;
    let lastKey = '';

    // Start tabbing
    await page.keyboard.press('Tab');

    for (let i = 0; i < MAX_TABS; i++) {
      const info = await getFocusInfo();

      if (!info || info.isBody) {
        // Focus returned to body — natural cycle complete
        stuckCount = 0;
        break;
      }

      const key = focusKey(info);

      // Check if we're stuck on the same element
      if (key === lastKey) {
        stuckCount++;

        if (stuckCount >= 3) {
          // Try Escape to break out of potential trap
          await page.keyboard.press('Escape');
          await page.keyboard.press('Tab');
          const afterEscape = await getFocusInfo();

          if (afterEscape && focusKey(afterEscape) === key && !info.isDialog) {
            // Still stuck after Escape — this is a trap
            results.push({
              ruleId: 'no-keyboard-trap',
              type: 'violation',
              message: `Keyboard focus is trapped on element. Tab and Escape could not move focus away.`,
              element: {
                selector: info.selector,
                html: info.html,
              },
            });
            break;
          } else {
            stuckCount = 0;
          }
        }
      } else {
        stuckCount = 0;
      }

      // Check for cycle completion (we've seen this element before)
      if (visited.length > 2 && visited[0] === key) {
        // Completed a full cycle — no trap detected
        break;
      }

      visited.push(key);
      lastKey = key;

      await page.keyboard.press('Tab');
    }

    // If we tabbed MAX_TABS times without cycling, that's suspicious
    if (visited.length >= MAX_TABS) {
      results.push({
        ruleId: 'no-keyboard-trap',
        type: 'warning',
        message: `Page has over ${MAX_TABS} focusable elements and focus did not cycle back. Manual verification recommended.`,
      });
    }

    // If no violations were found, report pass
    if (results.length === 0 && visited.length > 0) {
      results.push({
        ruleId: 'no-keyboard-trap',
        type: 'pass',
        message: `Tab navigation cycled through ${visited.length} elements without trapping focus.`,
      });
    }

    return results;
  },
};
