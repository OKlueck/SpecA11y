import type { Page } from 'playwright';
import type { Rule, RuleResult } from '../../types.js';

const MIN_VIEWPORT_WIDTH = 320;
const MAX_OFFENDERS = 10;
const TOLERANCE = 5;

export const reflow: Rule = {
  meta: {
    id: 'reflow',
    name: 'Content must reflow without horizontal scrolling at 320px width',
    description:
      'Resizes the viewport to 320px and checks for elements that cause horizontal scrolling (WCAG 1.4.10 Reflow).',
    wcagCriteria: ['1.4.10'],
    severity: 'serious',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const page = context.page as Page;

    // Check viewport meta for fixed width
    const viewportContent = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });

    if (viewportContent) {
      const widthMatch = viewportContent.match(/width\s*=\s*(\d+)/);
      if (widthMatch) {
        const fixedWidth = parseInt(widthMatch[1], 10);
        if (fixedWidth > MIN_VIEWPORT_WIDTH) {
          results.push({
            ruleId: 'reflow',
            type: 'warning',
            message: `Viewport meta sets a fixed width of ${fixedWidth}px, which exceeds ${MIN_VIEWPORT_WIDTH}px and may prevent content from reflowing properly.`,
            element: {
              selector: 'meta[name="viewport"]',
              html: `<meta name="viewport" content="${viewportContent}">`,
            },
          });
        }
      }
    }

    // Perform actual viewport resize to 320px
    const original = page.viewportSize();
    try {
      await page.setViewportSize({ width: MIN_VIEWPORT_WIDTH, height: original?.height ?? 768 });
      // Wait for reflow
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

      // Find elements that extend beyond 320px viewport
      const offenders = await page.evaluate((tolerance: number) => {
        const viewportWidth = document.documentElement.clientWidth;

        const found: Array<{
          cssSelector: string;
          accessibleName: string;
          role: string;
          html: string;
          width: number;
        }> = [];

        // Always search for elements extending beyond viewport — even if
        // scrollWidth is clipped (overflow:hidden on body/html),
        // elements that are wider than the viewport fail reflow.
        function cssPath(node: Element): string {
          const parts: string[] = [];
          let current: Element | null = node;
          for (let depth = 0; depth < 3 && current && current !== document.body && current !== document.documentElement; depth++) {
            const tag = current.tagName.toLowerCase();
            if (current.id) { parts.unshift(tag + '#' + current.id); break; }
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
            parts.unshift(tag + cls + nth);
            current = parent;
          }
          return parts.join(' > ');
        }

        const IMPLICIT_ROLES: Record<string, string> = {
          nav: 'navigation', main: 'main', header: 'banner', footer: 'contentinfo',
          table: 'table', img: 'img', form: 'form',
        };

        const allElements = document.querySelectorAll('body *');
        for (const el of allElements) {
          if (found.length >= 10) break;
          const tag = el.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'meta' || tag === 'link') continue;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;

          const rect = el.getBoundingClientRect();
          if (rect.right > viewportWidth + tolerance) {
            let accNameStr = '';
            const label = el.getAttribute('aria-label');
            if (label) accNameStr = label.trim().slice(0, 50);
            else {
              let text = (el.textContent || '').trim().replace(/\s+/g, ' ');
              if (text.length > 50) text = text.slice(0, 47) + '...';
              accNameStr = text;
            }

            found.push({
              cssSelector: cssPath(el),
              accessibleName: accNameStr,
              role: el.getAttribute('role') || IMPLICIT_ROLES[tag] || '',
              html: el.outerHTML.slice(0, 200),
              width: Math.round(rect.width),
            });
          }
        }

        return found;
      }, TOLERANCE);

      if (offenders.length > 0) {
        for (const el of offenders.slice(0, MAX_OFFENDERS)) {
          results.push({
            ruleId: 'reflow',
            type: 'violation',
            message: `Element extends beyond 320px viewport (width: ${el.width}px). Content must reflow without horizontal scrolling.`,
            element: {
              selector: el.cssSelector,
              cssSelector: el.cssSelector,
              accessibleName: el.accessibleName,
              role: el.role,
              html: el.html,
            },
          });
        }
      }
    } finally {
      // Always restore original viewport
      if (original) {
        await page.setViewportSize(original);
      }
    }

    return results;
  },
};
