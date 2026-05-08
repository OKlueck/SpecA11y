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

  it('treats enableRules as additive over level and version filters', () => {
    registerRule(createMockRule({ id: 'matching-rule', wcagCriteria: ['1.1.1'] }));
    registerRule(createMockRule({ id: 'aaa-rule', wcagCriteria: ['2.4.13'] }));
    registerRule(createMockRule({ id: 'wcag-22-rule', wcagCriteria: ['2.4.11'] }));
    registerRule(createMockRule({ id: 'unmatched-rule', wcagCriteria: ['1.4.3'] }));

    const config: CheckConfig = {
      level: 'A',
      versions: ['2.0'],
      enableRules: ['aaa-rule', 'wcag-22-rule'],
    };
    const ids = filterRules(config).map(r => r.meta.id);

    expect(ids).toContain('matching-rule');
    expect(ids).toContain('aaa-rule');
    expect(ids).toContain('wcag-22-rule');
    expect(ids).not.toContain('unmatched-rule');
  });

  it('keeps disabled rules excluded even when explicitly enabled', () => {
    registerRule(createMockRule({ id: 'conflicting-rule', wcagCriteria: ['1.1.1'] }));

    const config: CheckConfig = {
      level: 'A',
      versions: ['2.0'],
      enableRules: ['conflicting-rule'],
      disableRules: ['conflicting-rule'],
    };

    expect(filterRules(config).map(r => r.meta.id)).not.toContain('conflicting-rule');
  });

  it('keeps rules without WCAG criteria opt-in through explicit enablement or tags', () => {
    registerRule(createMockRule({ id: 'untagged-draft-rule', wcagCriteria: [] }));
    registerRule(createMockRule({ id: 'tagged-draft-rule', wcagCriteria: [], tags: ['wcag3'] }));
    registerRule(createMockRule({ id: 'enabled-draft-rule', wcagCriteria: [] }));

    const config: CheckConfig = {
      level: 'AAA',
      versions: ['2.0', '2.1', '2.2', '3.0'],
      enableRules: ['enabled-draft-rule'],
      tags: ['wcag3'],
    };
    const ids = filterRules(config).map(r => r.meta.id);

    expect(ids).not.toContain('untagged-draft-rule');
    expect(ids).toContain('tagged-draft-rule');
    expect(ids).toContain('enabled-draft-rule');
  });
});
