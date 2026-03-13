import type { SemanticAnnotation } from './types.js';

/** Parse an LLM response into a SemanticAnnotation */
export function parseResponse(
  raw: string,
  provider: string,
  model: string,
): SemanticAnnotation {
  // Strip markdown fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);

    const verdict = validateVerdict(parsed.verdict);
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5));
    const explanation = String(parsed.explanation || 'No explanation provided.');
    const suggestion = parsed.suggestion ? String(parsed.suggestion) : undefined;

    return { verdict, confidence, explanation, suggestion, provider, model };
  } catch {
    // Fallback: try to extract verdict from raw text
    return {
      verdict: extractVerdict(raw),
      confidence: 0.3,
      explanation: raw.slice(0, 200),
      provider,
      model,
    };
  }
}

function validateVerdict(value: unknown): 'good' | 'poor' | 'unclear' {
  if (value === 'good' || value === 'poor' || value === 'unclear') return value;
  return 'unclear';
}

function extractVerdict(text: string): 'good' | 'poor' | 'unclear' {
  const lower = text.toLowerCase();
  if (lower.includes('"poor"') || lower.includes('not meaningful') || lower.includes('generic')) return 'poor';
  if (lower.includes('"good"') || lower.includes('meaningful') || lower.includes('descriptive')) return 'good';
  return 'unclear';
}
