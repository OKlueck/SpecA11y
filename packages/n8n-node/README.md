# n8n-nodes-speca11y

[n8n](https://n8n.io) community node for automated WCAG accessibility checking with [SpecA11y](../../README.md).

## Installation

Install as a community node in your n8n instance:

```
n8n-nodes-speca11y
```

Requires Playwright and Chromium to be available in the n8n environment.

## Node: WCAG Check

Checks a URL for WCAG accessibility violations.

### Inputs

| Parameter | Type | Description |
|-----------|------|-------------|
| URL | string | The URL to check |
| WCAG Level | A / AA / AAA | Conformance level (default: AA) |
| Include Passes | boolean | Include passing rules (default: false) |

### Output

Returns the full SpecA11y report as JSON, including:
- Summary with violation/warning/pass counts
- Per-rule results with element selectors and messages

## License

[MIT](../../LICENSE)
