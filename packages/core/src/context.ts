import type { Page, Frame, Locator } from 'playwright';
import type { RuleContext, ElementHandle, ElementTarget } from './types.js';
import { computeAccessibleName } from './utils/accname.js';

export interface ContextOptions {
  include?: string[];
  exclude?: string[];
}

interface ElementDescription {
  cssSelector: string;
  accessibleName: string;
  role: string;
}

class PlaywrightElementHandle implements ElementHandle {
  public cssSelector?: string;
  public accessibleName?: string;
  public role?: string;

  constructor(
    private locator: Locator,
    public selector: string,
  ) {}

  async getOuterHTML(): Promise<string> {
    return this.locator.evaluate(el => el.outerHTML);
  }

  async getAttribute(attr: string): Promise<string | null> {
    return this.locator.getAttribute(attr);
  }

  async getComputedStyle(property: string): Promise<string> {
    return this.locator.evaluate(
      (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
      property,
    );
  }

  async getAccessibleName(): Promise<string> {
    return this.locator.evaluate(computeAccessibleName);
  }

  async getBoundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return this.locator.boundingBox();
  }

  async getTextContent(): Promise<string> {
    return (await this.locator.textContent()) ?? '';
  }

  async isVisible(): Promise<boolean> {
    return this.locator.isVisible();
  }

  toTarget(html: string, boundingBox?: { x: number; y: number; width: number; height: number } | null): ElementTarget {
    return {
      selector: this.selector,
      cssSelector: this.cssSelector,
      accessibleName: this.accessibleName,
      role: this.role,
      html,
      boundingBox,
    };
  }
}

/**
 * Batched enrichment: runs a single page.evaluate() to collect cssSelector,
 * accessibleName, and role for all elements matching a CSS selector, then
 * zips the results onto the handles array.
 */
async function batchEnrich(
  pageOrFrame: Page | Frame,
  selector: string,
  handles: PlaywrightElementHandle[],
): Promise<void> {
  if (handles.length === 0) return;
  try {
    const descriptions: ElementDescription[] = await pageOrFrame.evaluate(
      (sel: string) => {
        // Inline describeElement logic to avoid serialization issues
        function cssPath(node: Element): string {
          const parts: string[] = [];
          let current: Element | null = node;
          for (let depth = 0; depth < 3 && current && current !== document.body && current !== document.documentElement; depth++) {
            const tag = current.tagName.toLowerCase();
            if (current.id) {
              parts.unshift(tag + '#' + current.id);
              break;
            }
            const cls = current.className && typeof current.className === 'string'
              ? '.' + current.className.trim().split(/\s+/).slice(0, 2).join('.')
              : '';
            const parentEl: Element | null = current.parentElement;
            let nth = '';
            if (parentEl) {
              const siblings = parentEl.children;
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
            current = parentEl;
          }
          return parts.join(' > ');
        }
        function accName(node: Element): string {
          const label = node.getAttribute('aria-label');
          if (label) return label.trim().slice(0, 50);
          const labelledBy = node.getAttribute('aria-labelledby');
          if (labelledBy) {
            const parts = labelledBy.split(/\s+/).map(id => {
              const ref = document.getElementById(id);
              return ref ? (ref.textContent || '').trim() : '';
            }).filter(Boolean);
            if (parts.length) return parts.join(' ').slice(0, 50);
          }
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
          textarea: 'textbox', img: 'img', nav: 'navigation', main: 'main',
          header: 'banner', footer: 'contentinfo', aside: 'complementary',
          form: 'form', table: 'table', ul: 'list', ol: 'list', li: 'listitem',
          h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading',
          dialog: 'dialog', details: 'group', summary: 'button', article: 'article',
          section: 'region', td: 'cell', th: 'columnheader', tr: 'row',
        };

        const elements = Array.from(document.querySelectorAll(sel));
        const results: Array<{ cssSelector: string; accessibleName: string; role: string }> = [];
        for (const el of elements) {
          const tag = el.tagName.toLowerCase();
          results.push({
            cssSelector: cssPath(el),
            accessibleName: accName(el),
            role: el.getAttribute('role') || IMPLICIT_ROLES[tag] || '',
          });
        }
        return results;
      },
      selector,
    );
    for (let i = 0; i < handles.length && i < descriptions.length; i++) {
      handles[i].cssSelector = descriptions[i].cssSelector;
      handles[i].accessibleName = descriptions[i].accessibleName;
      handles[i].role = descriptions[i].role;
    }
  } catch {
    // enrichment is best-effort
  }
}

export function createRuleContext(pageOrFrame: Page | Frame, options?: ContextOptions): RuleContext {
  const include = options?.include ?? [];
  const exclude = options?.exclude ?? [];

  return {
    page: pageOrFrame,

    async querySelectorAll(selector: string): Promise<ElementHandle[]> {
      // When include selectors are specified, scope queries to those containers
      if (include.length > 0) {
        const handles: ElementHandle[] = [];
        for (const incSel of include) {
          // Match elements inside include containers, plus the container itself if it matches
          const scopedLocators = await pageOrFrame.locator(`${incSel} ${selector}`).all();
          for (let i = 0; i < scopedLocators.length; i++) {
            handles.push(new PlaywrightElementHandle(scopedLocators[i], `${incSel} ${selector} >> nth=${i}`));
          }
          // Also check if the include container itself matches the selector
          const selfLocators = await pageOrFrame.locator(incSel).all();
          for (let i = 0; i < selfLocators.length; i++) {
            const matches = await selfLocators[i].evaluate(
              (el, sel) => el.matches(sel),
              selector,
            );
            if (matches) {
              handles.push(new PlaywrightElementHandle(selfLocators[i], `${incSel} >> nth=${i}`));
            }
          }
        }

        if (exclude.length > 0) {
          const filtered: ElementHandle[] = [];
          for (const handle of handles) {
            const isExcluded = await pageOrFrame.locator(handle.selector).evaluate(
              (el, excludeSelectors) => excludeSelectors.some(
                (sel: string) => el.matches(sel) || el.closest(sel) !== null,
              ),
              exclude,
            );
            if (!isExcluded) filtered.push(handle);
          }
          return filtered;
        }

        return handles;
      }

      // No include selectors — query the full page/frame
      const locators = await pageOrFrame.locator(selector).all();
      const pwHandles = locators.map((loc, i) => new PlaywrightElementHandle(loc, `${selector} >> nth=${i}`));

      // Batch-enrich with cssSelector, accessibleName, role
      await batchEnrich(pageOrFrame, selector, pwHandles);

      let handles: ElementHandle[] = pwHandles;

      // Filter out excluded elements
      if (exclude.length > 0) {
        const filtered: ElementHandle[] = [];
        for (let i = 0; i < locators.length; i++) {
          const isExcluded = await locators[i].evaluate(
            (el, excludeSelectors) => excludeSelectors.some(
              (sel: string) => el.matches(sel) || el.closest(sel) !== null,
            ),
            exclude,
          );
          if (!isExcluded) filtered.push(handles[i]);
        }
        handles = filtered;
      }

      return handles;
    },

    async getComputedStyle(selector: string, property: string): Promise<string> {
      return pageOrFrame.locator(selector).first().evaluate(
        (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
        property,
      );
    },

    async getAccessibleName(selector: string): Promise<string> {
      const handle = new PlaywrightElementHandle(pageOrFrame.locator(selector).first(), selector);
      return handle.getAccessibleName();
    },

    async getOuterHTML(selector: string): Promise<string> {
      return pageOrFrame.locator(selector).first().evaluate(el => el.outerHTML);
    },

    async getAttribute(selector: string, attr: string): Promise<string | null> {
      return pageOrFrame.locator(selector).first().getAttribute(attr);
    },

    async evaluate<R>(fn: () => R): Promise<R> {
      return pageOrFrame.evaluate(fn);
    },
  };
}
