import type { Rule, RuleResult } from '../../types.js';

export const focusOrder: Rule = {
  meta: {
    id: 'focus-order',
    name: 'Focus order should follow visual layout',
    description: 'Tabs through focusable elements and verifies that the focus order follows a logical top-to-bottom, left-to-right visual sequence.',
    wcagCriteria: ['2.4.3'],
    severity: 'serious',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const page = context.page;
    const maxElements = 50;

    const focusedPositions: {
      index: number;
      selector: string;
      cssSelector: string;
      accessibleName: string;
      role: string;
      html: string;
      box: { x: number; y: number; width: number; height: number };
    }[] = [];

    await page.keyboard.press('Tab');

    for (let i = 0; i < maxElements; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return null;

        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls = el.className && typeof el.className === 'string'
          ? `.${el.className.trim().split(/\s+/).join('.')}`
          : '';

        // CSS path for better identification
        function cssPath(node: Element): string {
          const parts: string[] = [];
          let current: Element | null = node;
          for (let depth = 0; depth < 3 && current && current !== document.body && current !== document.documentElement; depth++) {
            const t = current.tagName.toLowerCase();
            if (current.id) { parts.unshift(t + '#' + current.id); break; }
            const c = current.className && typeof current.className === 'string'
              ? '.' + current.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
            const parent = current.parentElement;
            let nth = '';
            if (parent) {
              const siblings = parent.children;
              let sameTag = 0, idx = 0;
              for (let j = 0; j < siblings.length; j++) {
                if (siblings[j].tagName === current.tagName) {
                  sameTag++;
                  if (siblings[j] === current) idx = sameTag;
                }
              }
              if (sameTag > 1) nth = ':nth-of-type(' + idx + ')';
            }
            parts.unshift(t + c + nth);
            current = parent;
          }
          return parts.join(' > ');
        }

        function accName(node: Element): string {
          const label = node.getAttribute('aria-label');
          if (label) return label.trim().slice(0, 50);
          const alt = node.getAttribute('alt');
          if (alt) return alt.trim().slice(0, 50);
          let text = (node.textContent || '').trim().replace(/\s+/g, ' ');
          if (text.length > 50) text = text.slice(0, 47) + '...';
          return text;
        }

        const IMPLICIT_ROLES: Record<string, string> = {
          a: 'link', button: 'button', input: 'textbox', select: 'combobox', textarea: 'textbox',
        };

        return {
          selector: `${tag}${id}${cls}`,
          cssSelector: cssPath(el),
          accessibleName: accName(el),
          role: el.getAttribute('role') || IMPLICIT_ROLES[tag] || '',
          html: el.outerHTML.slice(0, 200),
          box: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
        };
      });

      if (!info) break;

      // Stop if we've looped back to a previously focused element
      if (focusedPositions.length > 0) {
        const first = focusedPositions[0];
        if (info.cssSelector === first.cssSelector && info.box.x === first.box.x && info.box.y === first.box.y) {
          break;
        }
      }

      focusedPositions.push({ index: i, ...info });

      await page.keyboard.press('Tab');
    }

    if (focusedPositions.length < 2) {
      return results;
    }

    const ROW_THRESHOLD = 50;

    for (let i = 1; i < focusedPositions.length; i++) {
      const prev = focusedPositions[i - 1];
      const curr = focusedPositions[i];

      const prevCenterY = prev.box.y + prev.box.height / 2;
      const currCenterY = curr.box.y + curr.box.height / 2;
      const prevCenterX = prev.box.x + prev.box.width / 2;
      const currCenterX = curr.box.x + curr.box.width / 2;

      const jumpedUp = currCenterY < prevCenterY - ROW_THRESHOLD;
      const sameRow = Math.abs(currCenterY - prevCenterY) <= ROW_THRESHOLD;
      const jumpedLeft = sameRow && currCenterX < prevCenterX - ROW_THRESHOLD;

      if (jumpedUp || jumpedLeft) {
        results.push({
          ruleId: 'focus-order',
          type: 'warning',
          message: `Focus order may not follow visual layout: element ${i + 1} (at y:${Math.round(currCenterY)}, x:${Math.round(currCenterX)}) appears before element ${i} (at y:${Math.round(prevCenterY)}, x:${Math.round(prevCenterX)}) visually but receives focus after it.`,
          element: {
            selector: curr.selector,
            cssSelector: curr.cssSelector,
            accessibleName: curr.accessibleName,
            role: curr.role,
            html: curr.html,
            boundingBox: curr.box,
          },
        });
      }
    }

    return results;
  },
};
