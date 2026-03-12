import pc from 'picocolors';
import type { Report, ReportEntry, RuleResult } from '@speca11y/core';

function severityColor(severity: string): (s: string) => string {
  switch (severity) {
    case 'critical': return pc.red;
    case 'serious': return pc.yellow;
    case 'moderate': return pc.cyan;
    case 'minor': return pc.dim;
    default: return pc.white;
  }
}

function typeIcon(type: string): string {
  switch (type) {
    case 'violation': return pc.red('✗');
    case 'warning': return pc.yellow('⚠');
    case 'incomplete': return pc.cyan('?');
    case 'pass': return pc.green('✓');
    default: return ' ';
  }
}

export function formatText(report: Report, includePasses: boolean): string {
  const lines: string[] = [];
  const { summary } = report;

  lines.push('');
  lines.push(pc.bold(`SpecA11y Report — ${summary.url}`));
  lines.push(pc.dim(`Scanned at ${summary.timestamp} in ${summary.duration}ms`));
  lines.push('');

  // Summary counts
  const v = summary.counts.violations;
  const w = summary.counts.warnings;
  const inc = summary.counts.incomplete;
  const p = summary.counts.passes;

  lines.push(
    [
      v > 0 ? pc.red(`${v} violation${v !== 1 ? 's' : ''}`) : pc.dim('0 violations'),
      w > 0 ? pc.yellow(`${w} warning${w !== 1 ? 's' : ''}`) : pc.dim('0 warnings'),
      inc > 0 ? pc.cyan(`${inc} incomplete`) : pc.dim('0 incomplete'),
      pc.dim(`${p} passed`),
    ].join('  '),
  );
  lines.push('');

  // Entries
  for (const entry of report.entries) {
    const results = includePasses
      ? entry.results
      : entry.results.filter(r => r.type !== 'pass');
    if (results.length === 0) continue;

    const color = severityColor(entry.rule.severity);
    lines.push(color(pc.bold(`[${entry.rule.id}] ${entry.rule.name}`)));

    if (entry.rule.wcagCriteria.length > 0) {
      lines.push(pc.dim(`  WCAG ${entry.rule.wcagCriteria.join(', ')}`));
    }

    for (const result of results) {
      lines.push(`  ${typeIcon(result.type)} ${result.message}`);
      if (result.element) {
        lines.push(pc.dim(`    ${result.element.selector}`));
      }
    }
    lines.push('');
  }

  // Footer
  if (v > 0) {
    lines.push(pc.red(pc.bold(`✗ ${v} accessibility violation${v !== 1 ? 's' : ''} found`)));
  } else {
    lines.push(pc.green(pc.bold('✓ No accessibility violations found')));
  }
  lines.push('');

  return lines.join('\n');
}
