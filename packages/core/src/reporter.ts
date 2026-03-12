import type { Report, ReportSummary, ReportEntry, RuleResult, RuleMeta, WcagPrinciple, WcagLevel, Severity } from './types.js';
import { WCAG_CRITERIA } from './wcag.js';

export function buildReport(
  url: string,
  duration: number,
  ruleResults: Array<{ meta: RuleMeta; results: RuleResult[] }>,
  includePasses: boolean,
): Report {
  const entries: ReportEntry[] = [];
  const counts = { violations: 0, warnings: 0, incomplete: 0, passes: 0 };
  const byPrinciple: Record<WcagPrinciple, number> = {
    perceivable: 0, operable: 0, understandable: 0, robust: 0,
  };
  const byLevel: Record<WcagLevel, number> = { A: 0, AA: 0, AAA: 0 };
  const bySeverity: Record<Severity, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };

  for (const { meta, results } of ruleResults) {
    const filtered = includePasses ? results : results.filter(r => r.type !== 'pass');
    if (filtered.length === 0 && !includePasses) continue;

    entries.push({ rule: meta, results: filtered });

    for (const r of results) {
      const countKey = r.type === 'pass' ? 'passes' : `${r.type}s`;
      counts[countKey as keyof typeof counts]++;

      if (r.type === 'violation' || r.type === 'warning') {
        bySeverity[meta.severity]++;

        for (const critId of meta.wcagCriteria) {
          const criterion = WCAG_CRITERIA[critId];
          if (criterion) {
            byPrinciple[criterion.principle]++;
            byLevel[criterion.level]++;
          }
        }
      }
    }
  }

  const summary: ReportSummary = {
    url,
    timestamp: new Date().toISOString(),
    duration,
    counts,
    byPrinciple,
    byLevel,
    bySeverity,
  };

  return { summary, entries };
}
