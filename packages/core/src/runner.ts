import type { Page } from 'playwright';
import type { Rule, RuleResult, RuleMeta, Report, CheckConfig } from './types.js';
import { resolveConfig } from './config.js';
import { createRuleContext } from './context.js';
import { CachedRuleContext } from './cache.js';
import { filterRules } from './registry.js';
import { buildReport } from './reporter.js';

interface RuleRunResult {
  meta: RuleMeta;
  results: RuleResult[];
}

async function runRuleWithTimeout(rule: Rule, context: ReturnType<typeof createRuleContext>, timeout: number): Promise<RuleRunResult> {
  const results = await Promise.race([
    rule.run(context),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Rule "${rule.meta.id}" timed out after ${timeout}ms`)), timeout),
    ),
  ]);

  return { meta: rule.meta, results };
}

export async function check(page: Page, config?: Partial<CheckConfig>): Promise<Report> {
  const resolved = resolveConfig(config);
  const rules = filterRules(resolved);
  const contextOptions = {
    include: resolved.include,
    exclude: resolved.exclude,
  };
  const context = createRuleContext(page, contextOptions);
  const timeout = resolved.ruleTimeout ?? 10_000;
  const url = page.url();

  const domRules: Rule[] = [];
  const interactiveRules: Rule[] = [];

  for (const rule of rules) {
    if (rule.meta.type === 'interactive') {
      interactiveRules.push(rule);
    } else {
      domRules.push(rule);
    }
  }

  const start = Date.now();
  const allResults: RuleRunResult[] = [];

  // DOM rules share a cached context to avoid redundant Playwright round-trips
  const cachedContext = new CachedRuleContext(context);

  // Run DOM rules in parallel
  const domResults = await Promise.allSettled(
    domRules.map(rule => runRuleWithTimeout(rule, cachedContext, timeout)),
  );

  for (const result of domResults) {
    if (result.status === 'fulfilled') {
      allResults.push(result.value);
    } else {
      // Rule errored — record as incomplete
      const ruleId = result.reason?.message?.match(/Rule "([^"]+)"/)?.[1] ?? 'unknown';
      const rule = domRules.find(r => r.meta.id === ruleId);
      if (rule) {
        allResults.push({
          meta: rule.meta,
          results: [{ ruleId: rule.meta.id, type: 'incomplete', message: result.reason.message }],
        });
      }
    }
  }

  // Run interactive rules sequentially (main page only)
  for (const rule of interactiveRules) {
    try {
      const result = await runRuleWithTimeout(rule, context, timeout);
      allResults.push(result);
    } catch (error) {
      allResults.push({
        meta: rule.meta,
        results: [{
          ruleId: rule.meta.id,
          type: 'incomplete',
          message: error instanceof Error ? error.message : String(error),
        }],
      });
    }
  }

  // ── iFrame Support: run DOM rules against each child frame ──────
  const frames = page.frames();
  for (const frame of frames) {
    if (frame === page.mainFrame()) continue;
    const frameUrl = frame.url();
    if (frameUrl === 'about:blank' || frameUrl === '') continue;

    // Build a selector prefix that identifies this iframe in results
    const frameName = frame.name();
    const frameSrcSelector = frameName
      ? `iframe[name="${frameName}"]`
      : `iframe[src="${frameUrl}"]`;

    const frameContext = createRuleContext(frame, contextOptions);
    const cachedFrameContext = new CachedRuleContext(frameContext);

    const frameDomResults = await Promise.allSettled(
      domRules.map(rule => runRuleWithTimeout(rule, cachedFrameContext, timeout)),
    );

    for (const result of frameDomResults) {
      if (result.status === 'fulfilled') {
        // Prefix element selectors so results indicate they are inside a frame
        const prefixedResults: RuleResult[] = result.value.results.map(r => ({
          ...r,
          element: r.element
            ? {
                ...r.element,
                selector: `${frameSrcSelector} >>> ${r.element.selector}`,
              }
            : r.element,
        }));
        allResults.push({ meta: result.value.meta, results: prefixedResults });
      } else {
        const ruleId = result.reason?.message?.match(/Rule "([^"]+)"/)?.[1] ?? 'unknown';
        const rule = domRules.find(r => r.meta.id === ruleId);
        if (rule) {
          allResults.push({
            meta: rule.meta,
            results: [{
              ruleId: rule.meta.id,
              type: 'incomplete',
              message: `[${frameSrcSelector}] ${result.reason.message}`,
            }],
          });
        }
      }
    }
  }

  const duration = Date.now() - start;
  return buildReport(url, duration, allResults, resolved.includePasses ?? false);
}
