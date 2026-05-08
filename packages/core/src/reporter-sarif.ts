import packageJson from '../package.json' with { type: 'json' };
import type { Report, RuleResult, RuleMeta } from './types.js';
import { WCAG_CRITERIA } from './wcag.js';

// ── SARIF 2.1.0 Types (subset) ──────────────────────────────────────

interface SarifMessage {
  text: string;
}

interface SarifLogicalLocation {
  fullyQualifiedName: string;
}

interface SarifLocation {
  logicalLocations?: SarifLogicalLocation[];
  message?: SarifMessage;
}

interface SarifResult {
  ruleId: string;
  ruleIndex: number;
  level: 'error' | 'warning' | 'note' | 'none';
  message: SarifMessage;
  locations?: SarifLocation[];
}

interface SarifReportingDescriptor {
  id: string;
  name: string;
  shortDescription: SarifMessage;
  properties?: Record<string, unknown>;
}

interface SarifToolDriver {
  name: string;
  version: string;
  informationUri: string;
  rules: SarifReportingDescriptor[];
}

interface PackageJsonMetadata {
  version: string;
  repository?: { url?: string };
}

const packageMetadata = packageJson as PackageJsonMetadata;

function repositoryUrlToInformationUri(url: string | undefined): string {
  if (!url) return 'https://github.com/OKlueck/SpecA11y';
  return url
    .replace(/^git\+/, '')
    .replace(/\.git$/, '');
}

const SARIF_TOOL_METADATA = {
  name: 'SpecA11y',
  version: packageMetadata.version,
  informationUri: repositoryUrlToInformationUri(packageMetadata.repository?.url),
};

interface SarifRun {
  tool: { driver: SarifToolDriver };
  results: SarifResult[];
  automationDetails?: { id: string };
}

export interface SarifLog {
  $schema: string;
  version: '2.1.0';
  runs: SarifRun[];
}

// ── Mapping helpers ─────────────────────────────────────────────────

function resultTypeToLevel(type: string): 'error' | 'warning' | 'note' | 'none' {
  switch (type) {
    case 'violation': return 'error';
    case 'warning': return 'warning';
    case 'incomplete': return 'note';
    case 'pass': return 'none';
    default: return 'note';
  }
}

function buildReportingDescriptor(meta: RuleMeta): SarifReportingDescriptor {
  const descriptor: SarifReportingDescriptor = {
    id: meta.id,
    name: meta.name,
    shortDescription: { text: meta.description },
  };

  const criteria = meta.wcagCriteria
    .map(id => WCAG_CRITERIA[id])
    .filter(Boolean);

  if (criteria.length > 0 || meta.tags?.length) {
    descriptor.properties = {};
    if (criteria.length > 0) {
      descriptor.properties['wcagCriteria'] = criteria.map(c => ({
        id: c.id,
        name: c.name,
        level: c.level,
        version: c.version,
        principle: c.principle,
      }));
    }
    if (meta.tags?.length) {
      descriptor.properties['tags'] = meta.tags;
    }
    descriptor.properties['severity'] = meta.severity;
    descriptor.properties['confidence'] = meta.confidence;
  }

  return descriptor;
}

function buildSarifResult(
  result: RuleResult,
  ruleIndex: number,
): SarifResult {
  const sarifResult: SarifResult = {
    ruleId: result.ruleId,
    ruleIndex,
    level: resultTypeToLevel(result.type),
    message: { text: result.message },
  };

  if (result.element) {
    const displaySelector = result.element.cssSelector || result.element.selector;
    const messageParts = [result.element.html];
    if (result.element.accessibleName) {
      messageParts.push(`Accessible name: "${result.element.accessibleName}"`);
    }
    sarifResult.locations = [
      {
        logicalLocations: [
          { fullyQualifiedName: displaySelector },
        ],
        message: { text: messageParts.join(' | ') },
      },
    ];
  }

  return sarifResult;
}

// ── Public API ──────────────────────────────────────────────────────

export function buildSarifReport(report: Report): SarifLog {
  const ruleIndex = new Map<string, number>();
  const rules: SarifReportingDescriptor[] = [];
  const results: SarifResult[] = [];

  for (const entry of report.entries) {
    if (!ruleIndex.has(entry.rule.id)) {
      ruleIndex.set(entry.rule.id, rules.length);
      rules.push(buildReportingDescriptor(entry.rule));
    }

    const idx = ruleIndex.get(entry.rule.id)!;
    for (const result of entry.results) {
      results.push(buildSarifResult(result, idx));
    }
  }

  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            ...SARIF_TOOL_METADATA,
            rules,
          },
        },
        results,
        automationDetails: {
          id: `speca11y/${report.summary.url}/${report.summary.timestamp}`,
        },
      },
    ],
  };
}
