import type { Rule, RuleResult } from '../../types.js';

const FOCUSABLE_TAGS = new Set([
  'a', 'button', 'input', 'select', 'textarea', 'summary', 'iframe',
]);

export const scrollableRegionFocusable: Rule = {
  meta: {
    id: 'scrollable-region-focusable',
    name: 'Scrollable regions must be keyboard accessible',
    description: 'Ensures elements with scrollable content (overflow: auto/scroll with content exceeding bounds) have tabindex or contain focusable elements so keyboard users can scroll them.',
    wcagCriteria: ['2.1.1'],
    severity: 'serious',
    confidence: 'likely',
    type: 'dom',
    tags: ['best-practice'],
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    // Use evaluate to find scrollable elements in the page
    const scrollableSelectors: string[] = await context.evaluate(() => {
      const selectors: string[] = [];
      const allElements = document.querySelectorAll('*');

      for (const el of allElements) {
        const style = window.getComputedStyle(el);
        const overflowX = style.overflowX;
        const overflowY = style.overflowY;

        const isScrollable = (
          (overflowX === 'auto' || overflowX === 'scroll' || overflowY === 'auto' || overflowY === 'scroll') &&
          (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
        );

        if (!isScrollable) continue;

        // Skip body and html
        const tag = el.tagName.toLowerCase();
        if (tag === 'body' || tag === 'html') continue;

        // Check if element itself is focusable
        const tabindex = el.getAttribute('tabindex');
        if (tabindex !== null) continue;

        // Check if element is natively focusable
        const focusableTags = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary', 'iframe']);
        if (focusableTags.has(tag)) continue;

        // Check if element contains focusable children
        const hasFocusableChild = el.querySelector(
          'a[href], button, input, select, textarea, [tabindex], summary, iframe'
        );
        if (hasFocusableChild) continue;

        // Build a selector for this element
        let selector = tag;
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.className && typeof el.className === 'string') {
          selector = `${tag}.${el.className.trim().split(/\s+/).join('.')}`;
        }
        selectors.push(selector);
      }
      return selectors;
    });

    for (const selector of scrollableSelectors) {
      const elements = await context.querySelectorAll(selector);
      for (const el of elements) {
        results.push({
          ruleId: 'scrollable-region-focusable',
          type: 'violation',
          message: 'Scrollable region is not keyboard accessible. Add tabindex="0" to allow keyboard users to scroll this content.',
          element: {
            selector: el.selector,
            html: await el.getOuterHTML().then(h => h.substring(0, 200)),
            boundingBox: await el.getBoundingBox(),
          },
        });
      }
    }

    return results;
  },
};
