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

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-l, --level <A\|AA\|AAA>` | WCAG conformance level | `AA` |
| `-f, --format <text\|json\|sarif>` | Output format | `text` |
| `--include-passes` | Show passing rules | `false` |
| `--disable-rules <ids>` | Comma-separated rule IDs to skip | — |
| `-o, --output <file>` | Write to file instead of stdout | — |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No violations found |
| `1` | Violations found |
| `2` | Runtime error |

## License

[MIT](../../LICENSE)
