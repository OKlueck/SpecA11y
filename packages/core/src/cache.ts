import type { Page, Frame } from 'playwright';
import type { RuleContext, ElementHandle } from './types.js';

/**
 * Wraps an existing RuleContext and caches DOM query results.
 * Uses Map<string, Promise<T>> so concurrent in-flight requests
 * for the same key share a single promise (no duplicate round-trips).
 *
 * evaluate() is intentionally NOT cached since it runs arbitrary functions.
 */
export class CachedRuleContext implements RuleContext {
  private queryCache = new Map<string, Promise<ElementHandle[]>>();
  private computedStyleCache = new Map<string, Promise<string>>();
  private attributeCache = new Map<string, Promise<string | null>>();
  private accessibleNameCache = new Map<string, Promise<string>>();
  private outerHTMLCache = new Map<string, Promise<string>>();

  /** Pass through to the underlying context's page */
  get page(): Page | Frame {
    return this.inner.page;
  }

  constructor(private inner: RuleContext) {}

  querySelectorAll(selector: string): Promise<ElementHandle[]> {
    const cached = this.queryCache.get(selector);
    if (cached) return cached;

    const promise = this.inner.querySelectorAll(selector).then(handles =>
      handles.map(h => new CachedElementHandle(h)),
    );
    this.queryCache.set(selector, promise);
    return promise;
  }

  getComputedStyle(selector: string, property: string): Promise<string> {
    const key = `${selector}\0${property}`;
    const cached = this.computedStyleCache.get(key);
    if (cached) return cached;

    const promise = this.inner.getComputedStyle(selector, property);
    this.computedStyleCache.set(key, promise);
    return promise;
  }

  getAttribute(selector: string, attr: string): Promise<string | null> {
    const key = `${selector}\0${attr}`;
    const cached = this.attributeCache.get(key);
    if (cached) return cached;

    const promise = this.inner.getAttribute(selector, attr);
    this.attributeCache.set(key, promise);
    return promise;
  }

  getAccessibleName(selector: string): Promise<string> {
    const cached = this.accessibleNameCache.get(selector);
    if (cached) return cached;

    const promise = this.inner.getAccessibleName(selector);
    this.accessibleNameCache.set(selector, promise);
    return promise;
  }

  getOuterHTML(selector: string): Promise<string> {
    const cached = this.outerHTMLCache.get(selector);
    if (cached) return cached;

    const promise = this.inner.getOuterHTML(selector);
    this.outerHTMLCache.set(selector, promise);
    return promise;
  }

  evaluate<R>(fn: () => R): Promise<R> {
    // Never cache evaluate — arbitrary functions may have side effects
    return this.inner.evaluate(fn);
  }
}

/**
 * Wraps an ElementHandle to cache repeated property lookups.
 */
class CachedElementHandle implements ElementHandle {
  private outerHTMLCache: Promise<string> | null = null;
  private attributeCache = new Map<string, Promise<string | null>>();
  private computedStyleCache = new Map<string, Promise<string>>();
  private accessibleNameCache: Promise<string> | null = null;
  private boundingBoxCache: Promise<{ x: number; y: number; width: number; height: number } | null> | null = null;
  private textContentCache: Promise<string> | null = null;
  private visibleCache: Promise<boolean> | null = null;

  get selector(): string {
    return this.inner.selector;
  }

  constructor(private inner: ElementHandle) {}

  getOuterHTML(): Promise<string> {
    if (!this.outerHTMLCache) {
      this.outerHTMLCache = this.inner.getOuterHTML();
    }
    return this.outerHTMLCache;
  }

  getAttribute(attr: string): Promise<string | null> {
    const cached = this.attributeCache.get(attr);
    if (cached) return cached;

    const promise = this.inner.getAttribute(attr);
    this.attributeCache.set(attr, promise);
    return promise;
  }

  getComputedStyle(property: string): Promise<string> {
    const cached = this.computedStyleCache.get(property);
    if (cached) return cached;

    const promise = this.inner.getComputedStyle(property);
    this.computedStyleCache.set(property, promise);
    return promise;
  }

  getAccessibleName(): Promise<string> {
    if (!this.accessibleNameCache) {
      this.accessibleNameCache = this.inner.getAccessibleName();
    }
    return this.accessibleNameCache;
  }

  getBoundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    if (!this.boundingBoxCache) {
      this.boundingBoxCache = this.inner.getBoundingBox();
    }
    return this.boundingBoxCache;
  }

  getTextContent(): Promise<string> {
    if (!this.textContentCache) {
      this.textContentCache = this.inner.getTextContent();
    }
    return this.textContentCache;
  }

  isVisible(): Promise<boolean> {
    if (!this.visibleCache) {
      this.visibleCache = this.inner.isVisible();
    }
    return this.visibleCache;
  }
}
