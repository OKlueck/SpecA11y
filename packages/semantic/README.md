# @speca11y/semantic

LLM-powered semantic quality analysis for [SpecA11y](../../README.md) accessibility reports. Enriches heuristic warnings with AI assessments — turning ambiguous flags into actionable verdicts.

## Installation

```bash
pnpm add @speca11y/semantic
```

Install the LLM SDK for your provider of choice:

```bash
# Anthropic Claude
pnpm add @anthropic-ai/sdk

# OpenAI
pnpm add openai

# Ollama — no SDK needed, uses HTTP API
```

## Usage

```typescript
import { check } from '@speca11y/core';
import { enrich } from '@speca11y/semantic';

const report = await check(page, { level: 'AA' });

const enriched = await enrich(report, {
  provider: { provider: 'anthropic' },
  page, // optional — enables element screenshots for vision models
});

for (const entry of enriched.entries) {
  for (const result of entry.results) {
    if (result.semantic) {
      console.log(`${entry.rule.id}: ${result.semantic.verdict} (${result.semantic.confidence})`);
      console.log(`  ${result.semantic.explanation}`);
      if (result.semantic.suggestion) {
        console.log(`  Suggestion: ${result.semantic.suggestion}`);
      }
    }
  }
}
```

## Providers

| Provider | Model (default) | Vision | API Key |
|----------|----------------|--------|---------|
| `anthropic` | `claude-sonnet-4-20250514` | Yes | `ANTHROPIC_API_KEY` |
| `openai` | `gpt-4o-mini` | Yes | `OPENAI_API_KEY` |
| `ollama` | `llama3.2` / `llava` (images) | Yes | None |

```typescript
// Custom model and endpoint
const enriched = await enrich(report, {
  provider: {
    provider: 'ollama',
    model: 'mistral',
    baseUrl: 'http://localhost:11434',
  },
});
```

## Semantic Annotations

Each enriched result gets a `semantic` property:

```typescript
interface SemanticAnnotation {
  verdict: 'good' | 'poor' | 'unclear';
  confidence: number;   // 0–1
  explanation: string;
  suggestion?: string;
  provider: string;
  model: string;
}
```

- **`good`** — the element passes semantic review (e.g., alt text is descriptive)
- **`poor`** — the element has a real accessibility issue
- **`unclear`** — the LLM could not determine quality with confidence

## Targeted Rules

Only warnings from these rules are sent to the LLM:

- `img-alt-quality` — image alt text quality
- `link-name-quality` — link text descriptiveness
- `label-quality` — form label clarity
- `lang-mismatch` — content language consistency
- `button-name` — button label quality
- `document-title` — page title descriptiveness
- `video-caption-quality` — video caption adequacy
- `frame-title` — iframe title quality
- `empty-heading` — heading content presence

## Options

```typescript
interface EnrichOptions {
  provider: ProviderConfig;
  page?: Page;          // Playwright page for screenshots
  rules?: string[];     // Override which rules to enrich
  concurrency?: number; // Max parallel LLM calls (default: 5)
}
```

## License

MIT
