import type { Rule, RuleResult } from '../../types.js';

const MIN_VIEWPORT_WIDTH = 320;

export const reflow: Rule = {
  meta: {
    id: 'reflow',
    name: 'Content must reflow without horizontal scrolling at 320px width',
    description:
      'Checks for elements that would likely cause horizontal scrolling at a 320px viewport width, including fixed-width elements and restrictive viewport meta tags.',
    wcagCriteria: ['1.4.10'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Check viewport meta for fixed width
    const viewportMetas = await context.querySelectorAll('meta[name="viewport"]');
    for (const meta of viewportMetas) {
      const content = await meta.getAttribute('content');
      if (!content) continue;

      const widthMatch = content.match(/width\s*=\s*(\d+)/);
      if (widthMatch) {
        const fixedWidth = parseInt(widthMatch[1], 10);
        if (fixedWidth > MIN_VIEWPORT_WIDTH) {
          results.push({
            ruleId: 'reflow',
            type: 'warning',
            message: `Viewport meta sets a fixed width of ${fixedWidth}px, which exceeds ${MIN_VIEWPORT_WIDTH}px and may prevent content from reflowing properly.`,
            element: {
              selector: meta.selector,
              html: await meta.getOuterHTML(),
              boundingBox: await meta.getBoundingBox(),
            },
          });
        }
      }
    }

    // Check for elements with fixed widths exceeding 320px
    const wideElements = await context.evaluate(() => {
      const out: {
        selector: string;
        html: string;
        issue: string;
        width: number;
      }[] = [];

      const allElements = document.querySelectorAll('body *');

      allElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const tag = el.tagName.toLowerCase();

        // Skip hidden elements
        if (style.display === 'none' || style.visibility === 'hidden') return;
        // Skip script/style
        if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'meta' || tag === 'link') return;

        const id = el.id ? `#${el.id}` : '';
        const cls =
          el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).join('.')}`
            : '';
        const selector = `${tag}${id}${cls}`;

        // Check inline width styles
        const inlineWidth = el.getAttribute('style');
        if (inlineWidth) {
          const match = inlineWidth.match(/(?:^|;)\s*(?:min-)?width\s*:\s*(\d+)px/);
          if (match) {
            const px = parseInt(match[1], 10);
            if (px > 320) {
              out.push({
                selector,
                html: el.outerHTML.slice(0, 200),
                issue: `Inline style sets width to ${px}px.`,
                width: px,
              });
              return;
            }
          }
        }

        // Check computed min-width
        const minWidth = parseFloat(style.minWidth);
        if (!isNaN(minWidth) && minWidth > 320) {
          out.push({
            selector,
            html: el.outerHTML.slice(0, 200),
            issue: `Computed min-width is ${Math.round(minWidth)}px.`,
            width: minWidth,
          });
          return;
        }

        // Check for elements with overflow that could cause scrolling
        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;
        if (scrollWidth > 320 && scrollWidth > clientWidth + 10 && style.overflowX !== 'hidden' && style.overflowX !== 'auto' && style.overflowX !== 'scroll') {
          // Only flag if the element itself is wide and not handling overflow
          const rect = el.getBoundingClientRect();
          if (rect.width > 320) {
            out.push({
              selector,
              html: el.outerHTML.slice(0, 200),
              issue: `Element is ${Math.round(rect.width)}px wide and may cause horizontal scrolling.`,
              width: rect.width,
            });
          }
        }
      });

      return out;
    });

    for (const el of wideElements) {
      results.push({
        ruleId: 'reflow',
        type: 'warning',
        message: `${el.issue} Content should reflow to fit a ${MIN_VIEWPORT_WIDTH}px viewport without horizontal scrolling.`,
        element: {
          selector: el.selector,
          html: el.html,
        },
      });
    }

    return results;
  },
};
