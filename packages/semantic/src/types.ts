import type { Report, ReportEntry, RuleResult } from '@speca11y/core';

/** LLM assessment for a single flagged element */
export interface SemanticAnnotation {
  verdict: 'good' | 'poor' | 'unclear';
  confidence: number;
  explanation: string;
  suggestion?: string;
  provider: string;
  model: string;
}

/** A RuleResult extended with optional LLM annotation */
export interface AnnotatedRuleResult extends RuleResult {
  semantic?: SemanticAnnotation;
}

/** A ReportEntry with annotated results */
export interface AnnotatedReportEntry extends Omit<ReportEntry, 'results'> {
  results: AnnotatedRuleResult[];
}

/** The enriched report */
export interface EnrichedReport extends Omit<Report, 'entries'> {
  entries: AnnotatedReportEntry[];
  semantic: {
    provider: string;
    model: string;
    enrichedCount: number;
    duration: number;
  };
}

/** Provider configuration */
export interface ProviderConfig {
  provider: 'anthropic' | 'openai' | 'ollama';
  model?: string;
  apiKey?: string;
  /** Base URL for Ollama or custom endpoints */
  baseUrl?: string;
}

/** Context sent to the LLM for assessment */
export interface AssessmentContext {
  ruleId: string;
  ruleName: string;
  wcagCriteria: string[];
  element: {
    html: string;
    selector: string;
    accessibleName?: string;
    textContent?: string;
  };
  message: string;
  /** Base64-encoded PNG screenshot (for vision models) */
  screenshot?: string;
}

/** Provider adapter interface */
export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  assess(context: AssessmentContext): Promise<SemanticAnnotation>;
}
