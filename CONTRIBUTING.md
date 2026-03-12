# Contributing to SpecA11y

## Setup

```bash
git clone <repo-url>
cd speca11y
pnpm install
pnpm exec playwright install chromium
pnpm build
pnpm test
```

## Adding a New Rule

1. Create a file in the appropriate `packages/core/src/rules/<principle>/` directory.

2. Implement the `Rule` interface:

```typescript
import type { Rule, RuleResult } from '../../types.js';

export const myRule: Rule = {
  meta: {
    id: 'my-rule',
    name: 'Short description',
    description: 'Detailed description of what this rule checks.',
    wcagCriteria: ['1.1.1'],      // WCAG success criterion IDs
    severity: 'serious',          // critical | serious | moderate | minor
    confidence: 'certain',        // certain | likely | possible
    type: 'dom',                  // dom (parallel) | interactive (sequential)
  },

  async run(context): Promise<RuleResult[]> {
    const results: RuleResult[] = [];
    // ... check logic ...
    return results;
  },
};
```

3. Export from the principle's `index.ts` barrel file.

4. Import and register in `packages/core/src/index.ts`:
   - Add the import
   - Add to the `builtinRules` array

5. Add tests in `packages/core/__tests__/rules/<principle>.test.ts`.

## Rule Types

- **`dom`** rules only read the DOM via `context.querySelectorAll()`, `context.evaluate()`, etc. They run in parallel.
- **`interactive`** rules use `context.page` directly (screenshots, keyboard, CSS injection). They run sequentially because they mutate page state.

## Running Tests

```bash
# All tests
pnpm test

# Core package only
pnpm --filter @speca11y/core test

# Watch mode
pnpm --filter @speca11y/core test:watch
```

## Building

```bash
# All packages (respects dependency order via Turbo)
pnpm build
```

## Commit Guidelines

- Use clear, descriptive commit messages
- One logical change per commit
- Ensure `pnpm build && pnpm test` passes before pushing
