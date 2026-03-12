import { describe, it, expect, beforeEach } from 'vitest';
import { registerRule, getRule, getAllRules, filterRules, clearRegistry } from '../src/registry.js';
import type { Rule, CheckConfig } from '../src/types.js';

function createMockRule(overrides: Partial<Rule['meta']> = {}): Rule {
  return {
    meta: {
      id: overrides.id ?? 'test-rule',
      name: 'Test Rule',
      description: 'A test rule',
      wcagCriteria: overrides.wcagCriteria ?? ['1.1.1'],
      severity: 'serious',
      confidence: 'certain',
      type: 'dom',
      ...overrides,
    },
    async run() { return []; },
  };
}

describe('registry', () => {
  beforeEach(() => {
    clearRegistry();
  });

  it('registers and retrieves rules', () => {
    const rule = createMockRule({ id: 'r1' });
    registerRule(rule);
    expect(getAllRules()).toHaveLength(1);
    expect(getAllRules()[0].meta.id).toBe('r1');
  });

  it('overwrites on duplicate registration', () => {
    const rule1 = createMockRule({ id: 'r1', name: 'First' });
    const rule2 = createMockRule({ id: 'r1', name: 'Second' });
    registerRule(rule1);
    registerRule(rule2);
    expect(getAllRules()).toHaveLength(1);
    expect(getRule('r1')?.meta.name).toBe('Second');
  });

  it('filters by level', () => {
    registerRule(createMockRule({ id: 'a-rule', wcagCriteria: ['2.4.2'] }));   // A
    registerRule(createMockRule({ id: 'aa-rule', wcagCriteria: ['1.4.3'] }));  // AA

    const config: CheckConfig = { level: 'A', versions: ['2.0'] };
    const filtered = filterRules(config);
    const ids = filtered.map(r => r.meta.id);

    expect(ids).toContain('a-rule');
    expect(ids).not.toContain('aa-rule');
  });

  it('filters by disableRules', () => {
    registerRule(createMockRule({ id: 'r1', wcagCriteria: ['1.1.1'] }));
    registerRule(createMockRule({ id: 'r2', wcagCriteria: ['1.1.1'] }));

    const config: CheckConfig = { level: 'AA', versions: ['2.0'], disableRules: ['r1'] };
    const filtered = filterRules(config);
    const ids = filtered.map(r => r.meta.id);

    expect(ids).not.toContain('r1');
    expect(ids).toContain('r2');
  });
});
