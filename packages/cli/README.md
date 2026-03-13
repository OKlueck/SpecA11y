# @speca11y/cli

Command-line interface for [SpecA11y](../../README.md) — automated WCAG accessibility checking from the terminal.

## Installation

```bash
pnpm add -g @speca11y/cli
pnpm exec playwright install chromium
```

## Usage

```bash
# Check a URL (default: WCAG AA, text output)
speca11y https://example.com

# Check a local HTML file
speca11y ./page.html

# WCAG AAA level
speca11y https://example.com --level AAA

# JSON output
speca11y https://example.com --format json

# SARIF output to file
speca11y https://example.com --format sarif -o report.sarif

# Include passing rules
speca11y https://example.com --include-passes

# Disable specific rules
speca11y https://example.com --disable-rules color-contrast,img-alt
```

### Semantic Analysis

Enrich reports with LLM-powered quality assessment. Requires an LLM provider SDK and API key.

```bash
# With Anthropic Claude (default provider, uses ANTHROPIC_API_KEY env var)
speca11y https://example.com --semantic --format json

# With OpenAI (uses OPENAI_API_KEY env var)
speca11y https://example.com --semantic --llm-provider openai

# With local Ollama (no API key needed)
speca11y https://example.com --semantic --llm-provider ollama

# Custom model
speca11y https://example.com --semantic --llm-provider openai --llm-model gpt-4o
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-l, --level <A\|AA\|AAA>` | WCAG conformance level | `AA` |
| `-f, --format <text\|json\|sarif>` | Output format | `text` |
| `--include-passes` | Show passing rules | `false` |
| `--disable-rules <ids>` | Comma-separated rule IDs to skip | — |
| `-o, --output <file>` | Write to file instead of stdout | — |
| `--semantic` | Enable LLM-based semantic quality analysis | `false` |
| `--llm-provider <provider>` | LLM provider: `anthropic`, `openai`, or `ollama` | `anthropic` |
| `--llm-model <model>` | Override the provider's default model | — |
| `--llm-api-key <key>` | API key (or set `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` env var) | — |
| `--ollama-url <url>` | Ollama base URL | `http://localhost:11434` |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No violations found |
| `1` | Violations found |
| `2` | Runtime error |

## License

[MIT](../../LICENSE)
