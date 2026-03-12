import type { Rule, RuleResult } from '../../types.js';

const WCAG_TEXT_SPACING_CSS = `
  * {
    line-height: 1.5em !important;
    letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important;
  }
  p {
    margin-bottom: 2em !important;
  }
`;

const TEXT_CONTAINER_SELECTOR = 'p, li, td, th, span, div, label, h1, h2, h3, h4, h5, h6, a, button, blockquote, figcaption, dd, dt';

export const textSpacing: Rule = {
  meta: {
    id: 'text-spacing',
    name: 'Content must not be clipped when text spacing is increased',
    description: 'Injects WCAG 1.4.12 text spacing overrides and checks for text overflow or clipping.',
    wcagCriteria: ['1.4.12'],
    severity: 'serious',
    confidence: 'likely',
    type: 'interactive',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const page = context.page;

    // Inject the WCAG text spacing CSS
    const styleHandle = await page.addStyleTag({ content: WCAG_TEXT_SPACING_CSS });

    try {
      // Wait for reflow
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

      // Check for overflow/clipping on text containers
      const overflowIssues = await page.evaluate((selector: string) => {
        const found: Array<{
          selector: string;
          html: string;
          issue: string;
        }> = [];

        const elements = document.querySelectorAll(selector);

        for (const el of elements) {
          const style = window.getComputedStyle(el);

          // Skip invisible elements
          if (style.display === 'none' || style.visibility === 'hidden') continue;

          // Skip elements with no text
          const text = el.textContent?.trim();
          if (!text || text.length < 2) continue;

          const tag = el.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'noscript') continue;

          const scrollOverflowX = el.scrollWidth > el.clientWidth + 1;
          const scrollOverflowY = el.scrollHeight > el.clientHeight + 1;

          // Only flag if overflow is hidden (text gets clipped)
          const clipsX = scrollOverflowX && (style.overflowX === 'hidden' || style.overflowX === 'clip');
          const clipsY = scrollOverflowY && (style.overflowY === 'hidden' || style.overflowY === 'clip');

          // Also check for explicit height constraints
          const hasFixedHeight = style.height !== 'auto' && style.height !== '' &&
            !style.height.endsWith('%') && style.maxHeight !== 'none';

          if (clipsX || (clipsY && hasFixedHeight)) {
            const id = el.id ? `#${el.id}` : '';
            const cls = el.className && typeof el.className === 'string'
              ? `.${el.className.trim().split(/\s+/).join('.')}`
              : '';

            const issue = clipsX
              ? `Horizontal overflow clipped (scrollWidth ${el.scrollWidth}px > clientWidth ${el.clientWidth}px)`
              : `Vertical overflow clipped (scrollHeight ${el.scrollHeight}px > clientHeight ${el.clientHeight}px)`;

            found.push({
              selector: `${tag}${id}${cls}`,
              html: el.outerHTML.slice(0, 200),
              issue,
            });
          }
        }

        return found;
      }, TEXT_CONTAINER_SELECTOR);

      for (const item of overflowIssues) {
        results.push({
          ruleId: 'text-spacing',
          type: 'violation',
          message: `Text is clipped when WCAG text spacing is applied. ${item.issue}. Ensure containers can accommodate increased text spacing.`,
          element: { selector: item.selector, html: item.html },
        });
      }
    } finally {
      // Always remove injected CSS to restore page state
      await styleHandle.evaluate((el: Element) => el.remove());
    }

    return results;
  },
};
