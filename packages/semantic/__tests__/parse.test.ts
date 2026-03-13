import { describe, it, expect } from 'vitest';
import { parseResponse } from '../src/parse.js';

describe('parseResponse', () => {
  it('parses valid JSON response', () => {
    const raw = '{"verdict":"poor","confidence":0.9,"explanation":"Generic alt text","suggestion":"Describe the image"}';
    const result = parseResponse(raw, 'test', 'test-model');
    expect(result.verdict).toBe('poor');
    expect(result.confidence).toBe(0.9);
    expect(result.explanation).toBe('Generic alt text');
    expect(result.suggestion).toBe('Describe the image');
    expect(result.provider).toBe('test');
    expect(result.model).toBe('test-model');
  });

  it('parses markdown-fenced JSON', () => {
    const raw = '```json\n{"verdict":"good","confidence":0.85,"explanation":"Descriptive text"}\n```';
    const result = parseResponse(raw, 'test', 'model');
    expect(result.verdict).toBe('good');
    expect(result.confidence).toBe(0.85);
  });

  it('clamps confidence to 0-1 range', () => {
    const raw = '{"verdict":"good","confidence":5.0,"explanation":"ok"}';
    const result = parseResponse(raw, 'test', 'model');
    expect(result.confidence).toBe(1);
  });

  it('defaults invalid verdict to "unclear"', () => {
    const raw = '{"verdict":"maybe","confidence":0.5,"explanation":"not sure"}';
    const result = parseResponse(raw, 'test', 'model');
    expect(result.verdict).toBe('unclear');
  });

  it('handles malformed response with fallback extraction', () => {
    const raw = 'This alt text is generic and not meaningful for users.';
    const result = parseResponse(raw, 'test', 'model');
    expect(result.verdict).toBe('poor');
    expect(result.confidence).toBe(0.3);
  });

  it('handles completely unparseable response', () => {
    const raw = 'I cannot determine the quality.';
    const result = parseResponse(raw, 'test', 'model');
    expect(result.verdict).toBe('unclear');
  });

  it('omits suggestion when not provided', () => {
    const raw = '{"verdict":"good","confidence":0.95,"explanation":"Good alt text"}';
    const result = parseResponse(raw, 'test', 'model');
    expect(result.suggestion).toBeUndefined();
  });
});
