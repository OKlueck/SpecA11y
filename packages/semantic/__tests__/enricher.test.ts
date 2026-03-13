import { describe, it, expect } from 'vitest';
import { enrich } from '../src/enricher.js';
import type { Report } from '@speca11y/core';
import type { EnrichedReport } from '../src/types.js';

// Create a mock report
function createMockReport(): Report {
  return {
    summary: {
      url: 'https://example.com',
      timestamp: new Date().toISOString(),
      duration: 1000,
      counts: { violations: 0, warnings: 2, incomplete: 0, passes: 5 },
      byPrinciple: { perceivable: 1, operable: 1, understandable: 0, robust: 0 },
      byLevel: { A: 1, AA: 1, AAA: 0 },
      bySeverity: { critical: 0, serious: 0, moderate: 2, minor: 0 },
    },
    entries: [
      {
        rule: {
          id: 'img-alt-quality',
          name: 'Image alt text should be meaningful',
          description: 'Checks alt text quality',
          wcagCriteria: ['1.1.1'],
          severity: 'moderate',
          confidence: 'likely',
          type: 'dom',
          tags: ['semantic', 'heuristic'],
        },
        results: [
          {
            ruleId: 'img-alt-quality',
            type: 'warning',
            message: 'Image has generic alt text "image"',
            element: {
              selector: 'img',
              html: '<img src="photo.jpg" alt="image">',
              boundingBox: null,
            },
          },
          {
            ruleId: 'img-alt-quality',
            type: 'pass',
            message: 'Image alt text appears to be meaningful.',
            element: {
              selector: 'img:nth-of-type(2)',
              html: '<img src="dog.jpg" alt="Golden retriever in park">',
              boundingBox: null,
            },
          },
        ],
      },
      {
        rule: {
          id: 'link-name-quality',
          name: 'Link text should describe purpose',
          description: 'Checks link text quality',
          wcagCriteria: ['2.4.4'],
          severity: 'moderate',
          confidence: 'likely',
          type: 'dom',
          tags: ['semantic', 'heuristic'],
        },
        results: [
          {
            ruleId: 'link-name-quality',
            type: 'warning',
            message: 'Link has generic text "click here"',
            element: {
              selector: 'a',
              html: '<a href="/page">click here</a>',
              boundingBox: null,
            },
          },
        ],
      },
      {
        rule: {
          id: 'color-contrast',
          name: 'Color contrast',
          description: 'Checks contrast',
          wcagCriteria: ['1.4.3'],
          severity: 'serious',
          confidence: 'certain',
          type: 'dom',
        },
        results: [
          {
            ruleId: 'color-contrast',
            type: 'violation',
            message: 'Insufficient contrast',
            element: {
              selector: 'p',
              html: '<p style="color: #ccc">text</p>',
              boundingBox: null,
            },
          },
        ],
      },
    ],
  };
}

// Mock provider that returns predictable results
function createMockProviderConfig() {
  return {
    provider: 'ollama' as const,
    baseUrl: 'http://mock:11434',
    model: 'mock-model',
  };
}

describe('enrich', () => {
  it('does not mutate the original report', async () => {
    const report = createMockReport();
    const originalJson = JSON.stringify(report);

    // This will fail because mock Ollama isn't running, but the error handling
    // in enricher will catch it and add an error annotation instead
    const enriched = await enrich(report, {
      provider: createMockProviderConfig(),
    });

    expect(JSON.stringify(report)).toBe(originalJson);
    expect(enriched).not.toBe(report);
  });

  it('only targets semantic rules', async () => {
    const report = createMockReport();
    const enriched = await enrich(report, {
      provider: createMockProviderConfig(),
    });

    // color-contrast results should NOT have semantic annotations
    const contrastEntry = enriched.entries.find((e) => e.rule.id === 'color-contrast');
    expect(contrastEntry?.results[0]).not.toHaveProperty('semantic');
  });

  it('only annotates warning results, not passes', async () => {
    const report = createMockReport();
    const enriched = await enrich(report, {
      provider: createMockProviderConfig(),
    });

    const imgEntry = enriched.entries.find((e) => e.rule.id === 'img-alt-quality');
    // Warning result should have semantic (even if it's an error annotation)
    const warningResult = imgEntry?.results.find((r) => r.type === 'warning');
    expect(warningResult?.semantic).toBeDefined();

    // Pass result should NOT have semantic
    const passResult = imgEntry?.results.find((r) => r.type === 'pass');
    expect(passResult?.semantic).toBeUndefined();
  });

  it('includes metadata in enriched report', async () => {
    const report = createMockReport();
    const enriched = await enrich(report, {
      provider: createMockProviderConfig(),
    });

    expect(enriched.semantic).toBeDefined();
    expect(enriched.semantic.provider).toBe('ollama');
    expect(enriched.semantic.model).toBe('mock-model');
    expect(typeof enriched.semantic.duration).toBe('number');
    expect(typeof enriched.semantic.enrichedCount).toBe('number');
  });

  it('handles failed LLM calls gracefully', async () => {
    const report = createMockReport();
    const enriched = await enrich(report, {
      provider: createMockProviderConfig(),
    });

    // Since mock Ollama isn't running, all annotations should be error fallbacks
    const imgEntry = enriched.entries.find((e) => e.rule.id === 'img-alt-quality');
    const warningResult = imgEntry?.results.find((r) => r.type === 'warning');
    expect(warningResult?.semantic?.verdict).toBe('unclear');
    expect(warningResult?.semantic?.confidence).toBe(0);
    expect(warningResult?.semantic?.explanation).toContain('failed');
  });

  it('respects custom rule filter', async () => {
    const report = createMockReport();
    const enriched = await enrich(report, {
      provider: createMockProviderConfig(),
      rules: ['link-name-quality'], // Only enrich links
    });

    // img-alt-quality should NOT be enriched
    const imgEntry = enriched.entries.find((e) => e.rule.id === 'img-alt-quality');
    const imgWarning = imgEntry?.results.find((r) => r.type === 'warning');
    expect(imgWarning?.semantic).toBeUndefined();

    // link-name-quality SHOULD be enriched
    const linkEntry = enriched.entries.find((e) => e.rule.id === 'link-name-quality');
    const linkWarning = linkEntry?.results.find((r) => r.type === 'warning');
    expect(linkWarning?.semantic).toBeDefined();
  });
});
