import { describe, expect, it } from 'vitest';
import corePackage from '../package.json' with { type: 'json' };
import { buildSarifReport } from '../src/reporter-sarif.js';
import type { Report } from '../src/types.js';

const report: Report = {
  summary: {
    url: 'https://example.com/page',
    timestamp: '2026-05-08T00:00:00.000Z',
    duration: 42,
    counts: { violations: 1, warnings: 1, incomplete: 1, passes: 1 },
    byPrinciple: { perceivable: 1, operable: 0, understandable: 0, robust: 0 },
    byLevel: { A: 1, AA: 0, AAA: 0 },
    bySeverity: { critical: 0, serious: 1, moderate: 0, minor: 0 },
  },
  entries: [
    {
      rule: {
        id: 'img-alt',
        name: 'Image alternative text',
        description: 'Images must have alternative text.',
        wcagCriteria: ['1.1.1'],
        severity: 'serious',
        confidence: 'certain',
        type: 'dom',
        tags: ['wcag2a'],
      },
      results: [
        {
          ruleId: 'img-alt',
          type: 'violation',
          message: 'Image is missing alternative text.',
          element: {
            selector: 'img:nth-of-type(1)',
            cssSelector: '#hero img',
            html: '<img src="hero.jpg">',
            accessibleName: 'Hero',
          },
        },
        {
          ruleId: 'img-alt',
          type: 'pass',
          message: 'Image has alternative text.',
        },
      ],
    },
    {
      rule: {
        id: 'focus-visible',
        name: 'Focus visible',
        description: 'Keyboard focus must be visible.',
        wcagCriteria: ['2.4.7'],
        severity: 'serious',
        confidence: 'likely',
        type: 'interactive',
      },
      results: [
        { ruleId: 'focus-visible', type: 'warning', message: 'Focus indication may be weak.' },
        { ruleId: 'focus-visible', type: 'incomplete', message: 'Focus could not be verified.' },
      ],
    },
  ],
};

describe('buildSarifReport', () => {
  it('emits current SpecA11y SARIF metadata, rule descriptors, result levels, and locations', () => {
    const sarif = buildSarifReport(report);
    const run = sarif.runs[0];

    expect(sarif.version).toBe('2.1.0');
    expect(run.tool.driver).toMatchObject({
      name: 'SpecA11y',
      version: corePackage.version,
      informationUri: 'https://github.com/OKlueck/SpecA11y',
    });
    expect(run.automationDetails?.id).toBe('speca11y/https://example.com/page/2026-05-08T00:00:00.000Z');

    expect(run.tool.driver.rules).toHaveLength(2);
    expect(run.tool.driver.rules[0]).toMatchObject({
      id: 'img-alt',
      name: 'Image alternative text',
      shortDescription: { text: 'Images must have alternative text.' },
      properties: {
        severity: 'serious',
        confidence: 'certain',
        tags: ['wcag2a'],
      },
    });
    expect(run.tool.driver.rules[0].properties?.wcagCriteria).toEqual([
      expect.objectContaining({ id: '1.1.1', name: 'Non-text Content', level: 'A', version: '2.0' }),
    ]);

    expect(run.results.map(result => result.level)).toEqual(['error', 'none', 'warning', 'note']);
    expect(run.results[0]).toMatchObject({
      ruleId: 'img-alt',
      ruleIndex: 0,
      locations: [
        {
          logicalLocations: [{ fullyQualifiedName: '#hero img' }],
          message: { text: '<img src="hero.jpg"> | Accessible name: "Hero"' },
        },
      ],
    });
  });
});
