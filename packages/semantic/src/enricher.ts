import type { Report } from '@speca11y/core';
import type {
  EnrichedReport,
  ProviderConfig,
  AssessmentContext,
  AnnotatedRuleResult,
  AnnotatedReportEntry,
} from './types.js';
import { createProvider } from './providers/index.js';
import { takeElementScreenshot } from './screenshot.js';

/** Rule IDs that benefit from LLM analysis */
const SEMANTIC_RULES = new Set([
  'img-alt-quality',
  'link-name-quality',
  'label-quality',
  'lang-mismatch',
  'button-name',
  'document-title',
  'video-caption-quality',
  'frame-title',
  'empty-heading',
]);

export interface EnrichOptions {
  provider: ProviderConfig;
  /** Playwright Page for element screenshots (optional) */
  page?: { locator: (sel: string) => { screenshot: (opts: { type: 'png' }) => Promise<Buffer> } };
  /** Only enrich these rule IDs (defaults to all semantic rules) */
  rules?: string[];
  /** Max concurrent LLM calls (default: 5) */
  concurrency?: number;
}

/** Simple concurrency limiter */
async function withConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  const executing = new Set<Promise<void>>();

  for (const task of tasks) {
    const p = (async () => {
      results.push(await task());
    })();
    executing.add(p);
    p.finally(() => executing.delete(p));

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/** Enrich a SpecA11y report with LLM-based semantic analysis */
export async function enrich(
  report: Report,
  options: EnrichOptions,
): Promise<EnrichedReport> {
  const start = Date.now();
  const provider = createProvider(options.provider);
  const targetRules = new Set(options.rules ?? SEMANTIC_RULES);
  const concurrency = options.concurrency ?? 5;

  // Collect all assessments to run
  const assessmentTasks: Array<{
    entryIdx: number;
    resultIdx: number;
    task: () => Promise<void>;
  }> = [];

  // Deep-clone entries so we don't mutate the original
  const annotatedEntries: AnnotatedReportEntry[] = report.entries.map((entry) => ({
    ...entry,
    results: entry.results.map((r) => ({ ...r }) as AnnotatedRuleResult),
  }));

  let enrichedCount = 0;

  for (let ei = 0; ei < annotatedEntries.length; ei++) {
    const entry = annotatedEntries[ei];
    if (!targetRules.has(entry.rule.id)) continue;

    for (let ri = 0; ri < entry.results.length; ri++) {
      const result = entry.results[ri];
      // Only enrich warnings (heuristic flags) — not passes, violations, or incompletes
      if (result.type !== 'warning') continue;
      if (!result.element) continue;

      const capturedEi = ei;
      const capturedRi = ri;

      assessmentTasks.push({
        entryIdx: capturedEi,
        resultIdx: capturedRi,
        task: async () => {
          // Take screenshot for image rules
          let screenshot: string | undefined;
          if (options.page && entry.rule.id === 'img-alt-quality') {
            screenshot = await takeElementScreenshot(options.page, result.element!.selector);
          }

          const context: AssessmentContext = {
            ruleId: entry.rule.id,
            ruleName: entry.rule.name,
            wcagCriteria: entry.rule.wcagCriteria,
            element: {
              html: result.element!.html,
              selector: result.element!.selector,
              accessibleName: undefined, // Could be fetched from page if available
              textContent: extractTextHint(entry.rule.id, result),
            },
            message: result.message,
            screenshot,
          };

          try {
            const annotation = await provider.assess(context);
            annotatedEntries[capturedEi].results[capturedRi].semantic = annotation;
            enrichedCount++;
          } catch (err) {
            // Don't fail the entire enrichment for one element
            annotatedEntries[capturedEi].results[capturedRi].semantic = {
              verdict: 'unclear',
              confidence: 0,
              explanation: `LLM assessment failed: ${err instanceof Error ? err.message : String(err)}`,
              provider: provider.name,
              model: provider.model,
            };
          }
        },
      });
    }
  }

  // Run assessments with concurrency limit
  if (assessmentTasks.length > 0) {
    await withConcurrency(
      assessmentTasks.map((a) => a.task),
      concurrency,
    );
  }

  return {
    ...report,
    entries: annotatedEntries,
    semantic: {
      provider: provider.name,
      model: provider.model,
      enrichedCount,
      duration: Date.now() - start,
    },
  };
}

/** Extract relevant text content from result based on rule type */
function extractTextHint(
  ruleId: string,
  result: { message: string },
): string | undefined {
  // Extract quoted text from warning messages like: 'Image has generic alt text "image"'
  const quoted = result.message.match(/"([^"]+)"/);
  if (quoted) return quoted[1];
  return undefined;
}
