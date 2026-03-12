import type { Report } from '@speca11y/core';

export function formatJson(report: Report): string {
  return JSON.stringify(report, null, 2);
}
