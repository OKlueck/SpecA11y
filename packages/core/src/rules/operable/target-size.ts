import type { Rule, RuleResult } from '../../types.js';
import { edgeDistance } from '../../utils/geometry.js';

interface TargetInfo {
  index: number;
  selector: string;
  cssSelector: string;
  accessibleName: string;
  role: string;
  html: string;
  box: { x: number; y: number; width: number; height: number };
  isInlineLink: boolean;
  tag: string;
}

const MIN_SIZE = 24;
const MAX_ELEMENTS = 500;
const SAMPLE_FIRST = 150;
const SAMPLE_LAST = 50;
const TIME_LIMIT = 8000;

export const targetSize: Rule = {
  meta: {
    id: 'target-size',
    name: 'Interactive targets must have a minimum size',
    description: 'Ensures interactive targets have a minimum size of 24x24 CSS pixels or sufficient spacing (WCAG 2.2 Success Criterion 2.5.8 Target Size (Minimum)).',
    wcagCriteria: ['2.5.8'],
    severity: 'moderate',
    confidence: 'likely',
    type: 'dom',
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    const startTime = Date.now();
    const page = context.page;

    // Collect all target info in a single batched evaluate call
    const allTargets: TargetInfo[] = await page.evaluate(() => {
      const selector = 'button, a[href], input, select, textarea, [tabindex]';
      const elements = document.querySelectorAll(selector);
      const targets: TargetInfo[] = [];

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

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;

        const tag = el.tagName.toLowerCase();
        // Detect inline links within text blocks
        const isInlineLink = tag === 'a' && style.display === 'inline' && !!el.parentElement &&
          (el.parentElement.textContent || '').trim().length > (el.textContent || '').trim().length + 5;

        targets.push({
          index: i,
          selector: `${tag}${el.id ? '#' + el.id : ''}`,
          cssSelector: cssPath(el),
          accessibleName: accName(el),
          role: el.getAttribute('role') || IMPLICIT_ROLES[tag] || '',
          html: el.outerHTML.slice(0, 200),
          box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          isInlineLink,
          tag,
        });
      }
      return targets;
    });

    // Sampling: if > MAX_ELEMENTS, take first N + last N + evenly distributed from middle
    let targets = allTargets;
    let sampled = false;
    if (allTargets.length > MAX_ELEMENTS) {
      sampled = true;
      const middle = allTargets.slice(SAMPLE_FIRST, allTargets.length - SAMPLE_LAST);
      const step = Math.max(1, Math.floor(middle.length / (MAX_ELEMENTS - SAMPLE_FIRST - SAMPLE_LAST)));
      const sampledMiddle = middle.filter((_, i) => i % step === 0);
      targets = [
        ...allTargets.slice(0, SAMPLE_FIRST),
        ...sampledMiddle,
        ...allTargets.slice(allTargets.length - SAMPLE_LAST),
      ];
    }

    for (const target of targets) {
      // Time guard
      if (Date.now() - startTime > TIME_LIMIT) {
        results.push({
          ruleId: 'target-size',
          type: 'incomplete',
          message: `Target size check timed out after checking ${results.length} of ${targets.length} elements. Manual review recommended for remaining elements.`,
        });
        break;
      }

      const { width, height } = target.box;

      // Skip inline text links (WCAG exception)
      if (target.isInlineLink) continue;

      if (width >= MIN_SIZE && height >= MIN_SIZE) {
        results.push({
          ruleId: 'target-size',
          type: 'pass',
          message: `Target size is sufficient (${Math.round(width)}x${Math.round(height)}px).`,
          element: {
            selector: target.selector,
            cssSelector: target.cssSelector,
            accessibleName: target.accessibleName,
            role: target.role,
            html: target.html,
            boundingBox: target.box,
          },
        });
        continue;
      }

      // Check spacing exception: if the 24px offset circle around this target
      // doesn't intersect any other interactive target, the exception is met
      const undersizeDiameter = MIN_SIZE;
      let hasSpacingException = true;
      for (const other of targets) {
        if (other.index === target.index) continue;
        const dist = edgeDistance(target.box, other.box);
        // If edge distance to nearest target is >= (24 - max(w,h))/2, the offset circle is clear
        const needed = Math.max(0, (undersizeDiameter - Math.max(width, height)) / 2);
        if (dist < needed) {
          hasSpacingException = false;
          break;
        }
      }

      if (hasSpacingException) {
        results.push({
          ruleId: 'target-size',
          type: 'pass',
          message: `Target is undersized (${Math.round(width)}x${Math.round(height)}px) but meets the spacing exception.`,
          element: {
            selector: target.selector,
            cssSelector: target.cssSelector,
            accessibleName: target.accessibleName,
            role: target.role,
            html: target.html,
            boundingBox: target.box,
          },
        });
      } else {
        results.push({
          ruleId: 'target-size',
          type: 'warning',
          message: `Interactive target is too small (${Math.round(width)}x${Math.round(height)}px) and does not meet the spacing exception. Target size must be at least 24x24 CSS pixels.`,
          element: {
            selector: target.selector,
            cssSelector: target.cssSelector,
            accessibleName: target.accessibleName,
            role: target.role,
            html: target.html,
            boundingBox: target.box,
          },
        });
      }
    }

    if (sampled) {
      results.push({
        ruleId: 'target-size',
        type: 'incomplete',
        message: `Page has ${allTargets.length} interactive targets. Sampled ${targets.length} elements; ${allTargets.length - targets.length} were not checked.`,
      });
    }

    return results;
  },
};
