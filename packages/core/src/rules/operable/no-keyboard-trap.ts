import type { Rule, RuleResult } from '../../types.js';

const MAX_TABS = 100;

interface FocusInfo {
  selector: string;
  cssSelector: string;
  accessibleName: string;
  role: string;
  html: string;
  isDialog: boolean;
  isBody: boolean;
  isArea: boolean;
  isInMap: boolean;
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

    async function getFocusInfo(): Promise<FocusInfo | null> {
      return page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;

        const isBody = el === document.body || el === document.documentElement;
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';

        // Build CSS path for unique identification
        function cssPath(node: Element): string {
          const parts: string[] = [];
          let current: Element | null = node;
          for (let depth = 0; depth < 3 && current && current !== document.body && current !== document.documentElement; depth++) {
            const t = current.tagName.toLowerCase();
            if (current.id) { parts.unshift(t + '#' + current.id); break; }
            const cls = current.className && typeof current.className === 'string'
              ? '.' + current.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
            const parent = current.parentElement;
            let nth = '';
            if (parent) {
              const siblings = parent.children;
              let sameTag = 0, idx = 0;
              for (let i = 0; i < siblings.length; i++) {
                if (siblings[i].tagName === current.tagName) {
                  sameTag++;
                  if (siblings[i] === current) idx = sameTag;
                }
              }
              if (sameTag > 1) nth = ':nth-of-type(' + idx + ')';
            }
            parts.unshift(t + cls + nth);
            current = parent;
          }
          return parts.join(' > ');
        }

        // Accessible name
        function accName(node: Element): string {
          const label = node.getAttribute('aria-label');
          if (label) return label.trim().slice(0, 50);
          const alt = node.getAttribute('alt');
          if (alt) return alt.trim().slice(0, 50);
          const title = node.getAttribute('title');
          if (title) return title.trim().slice(0, 50);
          let text = (node.textContent || '').trim().replace(/\s+/g, ' ');
          if (text.length > 50) text = text.slice(0, 47) + '...';
          return text;
        }

        const IMPLICIT_ROLES: Record<string, string> = {
          a: 'link', button: 'button', input: 'textbox', select: 'combobox',
          textarea: 'textbox', nav: 'navigation', dialog: 'dialog',
        };

        const isDialog = !!(
          el.closest('[role="dialog"]') ||
          el.closest('[aria-modal="true"]') ||
          el.closest('dialog')
        );

        return {
          selector: tag + id,
          cssSelector: cssPath(el),
          accessibleName: accName(el),
          role: el.getAttribute('role') || IMPLICIT_ROLES[tag] || '',
          html: el.outerHTML.slice(0, 200),
          isDialog,
          isBody,
          isArea: tag === 'area',
          isInMap: !!el.closest('map'),
        };
      });
    }

    // Use cssSelector for unique identification (more reliable than tag+id)
    function focusKey(info: FocusInfo): string {
      return info.cssSelector || info.selector;
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
        stuckCount = 0;
        break;
      }

      // Skip area elements inside image maps (they behave oddly with Tab)
      if (info.isArea && info.isInMap) {
        await page.keyboard.press('Tab');
        continue;
      }

      const key = focusKey(info);

      // Check if we're stuck on the same element
      if (key === lastKey) {
        stuckCount++;

        // Increased threshold from 3 to 5 to reduce false positives
        if (stuckCount >= 5) {
          // Try Escape to break out of potential trap
          await page.keyboard.press('Escape');
          await page.keyboard.press('Tab');
          let afterEscape = await getFocusInfo();

          if (afterEscape && focusKey(afterEscape) === key) {
            // Also try Shift+Tab as alternative escape method
            await page.keyboard.press('Shift+Tab');
            await page.keyboard.press('Shift+Tab');
            afterEscape = await getFocusInfo();
          }

          if (afterEscape && focusKey(afterEscape) === key && !info.isDialog) {
            // Verify: focus body then tab — if focus returns to same element, it's a real trap
            await page.evaluate(() => document.body.focus());
            await page.keyboard.press('Tab');
            const verifyInfo = await getFocusInfo();

            if (verifyInfo && focusKey(verifyInfo) === key) {
              results.push({
                ruleId: 'no-keyboard-trap',
                type: 'violation',
                message: `Keyboard focus is trapped on element. Tab, Escape, and Shift+Tab could not move focus away.`,
                element: {
                  selector: info.selector,
                  cssSelector: info.cssSelector,
                  accessibleName: info.accessibleName,
                  role: info.role,
                  html: info.html,
                },
              });
              break;
            } else {
              stuckCount = 0;
            }
          } else {
            stuckCount = 0;
          }
        }
      } else {
        stuckCount = 0;
      }

      // Check for cycle completion (we've seen this element before)
      if (visited.length > 2 && visited[0] === key) {
        break;
      }

      visited.push(key);
      lastKey = key;

      await page.keyboard.press('Tab');
    }

    if (visited.length >= MAX_TABS) {
      results.push({
        ruleId: 'no-keyboard-trap',
        type: 'warning',
        message: `Page has over ${MAX_TABS} focusable elements and focus did not cycle back. Manual verification recommended.`,
      });
    }

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
