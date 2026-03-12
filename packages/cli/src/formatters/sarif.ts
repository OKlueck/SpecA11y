import type { Report } from '@speca11y/core';
import { buildSarifReport } from '@speca11y/core';

export function formatSarif(report: Report): string {
  return JSON.stringify(buildSarifReport(report), null, 2);
}
