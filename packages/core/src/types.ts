import type { Page, Frame } from 'playwright';

// ── WCAG Taxonomy ──────────────────────────────────────────────────

export type WcagVersion = '2.0' | '2.1' | '2.2' | '3.0';
export type WcagLevel = 'A' | 'AA' | 'AAA';
export type WcagPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust';

export interface WcagCriterion {
  id: string;        // e.g. "1.1.1"
  name: string;      // e.g. "Non-text Content"
  level: WcagLevel;
  version: WcagVersion;
  principle: WcagPrinciple;
}

// ── Rule Definition ────────────────────────────────────────────────

export type Severity = 'critical' | 'serious' | 'moderate' | 'minor';
export type Confidence = 'certain' | 'likely' | 'possible';
export type ResultType = 'violation' | 'warning' | 'incomplete' | 'pass';
export type RuleType = 'dom' | 'interactive';

export interface RuleMeta {
  id: string;
  name: string;
  description: string;
  wcagCriteria: string[];   // criterion IDs, e.g. ["1.1.1"]
  severity: Severity;
  confidence: Confidence;
  type: RuleType;
  tags?: string[];
}

export interface ElementTarget {
  selector: string;
  html: string;
  boundingBox?: { x: number; y: number; width: number; height: number } | null;
}

export interface RuleResult {
  ruleId: string;
  type: ResultType;
  message: string;
  element?: ElementTarget;
}

export interface Rule {
  meta: RuleMeta;
  run(context: RuleContext): Promise<RuleResult[]>;
}

// ── Rule Context ───────────────────────────────────────────────────

export interface RuleContext {
  page: Page | Frame;
  querySelectorAll(selector: string): Promise<ElementHandle[]>;
  getComputedStyle(selector: string, property: string): Promise<string>;
  getAccessibleName(selector: string): Promise<string>;
  getOuterHTML(selector: string): Promise<string>;
  getAttribute(selector: string, attr: string): Promise<string | null>;
  evaluate<R>(fn: () => R): Promise<R>;
}

export interface ElementHandle {
  selector: string;
  getOuterHTML(): Promise<string>;
  getAttribute(attr: string): Promise<string | null>;
  getComputedStyle(property: string): Promise<string>;
  getAccessibleName(): Promise<string>;
  getBoundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null>;
  getTextContent(): Promise<string>;
  isVisible(): Promise<boolean>;
}

// ── Configuration ──────────────────────────────────────────────────

export interface CheckConfig {
  /** Minimum WCAG level to check. 'AA' includes 'A' rules. */
  level: WcagLevel;
  /** WCAG versions to include */
  versions: WcagVersion[];
  /** Rule IDs to explicitly enable (overrides level filter) */
  enableRules?: string[];
  /** Rule IDs to disable */
  disableRules?: string[];
  /** Include passing results in report */
  includePasses?: boolean;
  /** Timeout per rule in ms */
  ruleTimeout?: number;
  /** Tags to filter rules by */
  tags?: string[];
  /** CSS selectors to include (only check within these) */
  include?: string[];
  /** CSS selectors to exclude (skip these areas) */
  exclude?: string[];
}

// ── Report ─────────────────────────────────────────────────────────

export interface ReportSummary {
  url: string;
  timestamp: string;
  duration: number;
  counts: {
    violations: number;
    warnings: number;
    incomplete: number;
    passes: number;
  };
  byPrinciple: Record<WcagPrinciple, number>;
  byLevel: Record<WcagLevel, number>;
  bySeverity: Record<Severity, number>;
}

export interface ReportEntry {
  rule: RuleMeta;
  results: RuleResult[];
}

export interface Report {
  summary: ReportSummary;
  entries: ReportEntry[];
}
