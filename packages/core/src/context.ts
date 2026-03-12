import type { Page, Frame, Locator } from 'playwright';
import type { RuleContext, ElementHandle } from './types.js';
import { computeAccessibleName } from './utils/accname.js';

export interface ContextOptions {
  include?: string[];
  exclude?: string[];
}

class PlaywrightElementHandle implements ElementHandle {
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
      let handles: ElementHandle[] = locators.map((loc, i) => new PlaywrightElementHandle(loc, `${selector} >> nth=${i}`));

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
