# n8n-nodes-speca11y

[n8n](https://n8n.io) community node for automated WCAG accessibility checking with [SpecA11y](../../README.md).

## Installation

Install as a community node in your n8n instance:

```
n8n-nodes-speca11y
```

Requires Playwright and Chromium to be available in the n8n environment.

## Node: WCAG Check

Checks web pages or raw HTML for WCAG accessibility violations.

### Operations

| Operation | Description |
|-----------|-------------|
| **Check URL** | Check a live URL for accessibility issues |
| **Check HTML** | Check raw HTML content for accessibility issues |

### Parameters

| Parameter | Type | Description | Shown for |
|-----------|------|-------------|-----------|
| URL | string | The URL to check | Check URL |
| HTML | string | Raw HTML content to check | Check HTML |
| WCAG Level | A / AA / AAA | Conformance level (default: AA) | All |
| Include Passes | boolean | Include passing rules (default: false) | All |
| Disable Rules | string | Comma-separated rule IDs to skip | All |

### Semantic Analysis

Enable LLM-powered quality analysis to enrich heuristic warnings with AI assessments.

| Parameter | Type | Description | Shown when |
|-----------|------|-------------|------------|
| Enable Semantic Analysis | boolean | Run LLM analysis on flagged elements | All |
| LLM Provider | select | Anthropic (Claude), OpenAI, or Ollama (Local) | Semantic enabled |
| LLM Model | string | Override default model (leave blank for default) | Semantic enabled |
| API Key | string | API key for the LLM provider | Anthropic / OpenAI |
| Ollama Base URL | string | Base URL for the Ollama server (default: `http://localhost:11434`) | Ollama |

### Output

Returns the full SpecA11y report as JSON, including:
- Summary with violation/warning/pass counts
- Per-rule results with element selectors and messages
- Semantic annotations (verdict, confidence, explanation, suggestion) when enabled

## License

[MIT](../../LICENSE)
