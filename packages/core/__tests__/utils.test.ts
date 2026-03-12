import { describe, it, expect } from 'vitest';
import { parseColor, relativeLuminance, contrastRatio } from '../src/utils/color.js';

describe('color utils', () => {
  describe('parseColor', () => {
    it('parses rgb()', () => {
      expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('parses rgba()', () => {
      expect(parseColor('rgba(0, 128, 255, 0.5)')).toEqual({ r: 0, g: 128, b: 255 });
    });

    it('parses hex #rrggbb', () => {
      expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('parses hex #rgb', () => {
      expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('returns null for unparseable values', () => {
      expect(parseColor('transparent')).toBeNull();
    });
  });

  describe('contrastRatio', () => {
    it('returns 21:1 for black on white', () => {
      const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('returns 1:1 for same colors', () => {
      const ratio = contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('works regardless of order', () => {
      const r1 = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
      const r2 = contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 });
      expect(r1).toBeCloseTo(r2, 5);
    });
  });

  describe('relativeLuminance', () => {
    it('returns 0 for black', () => {
      expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
    });

    it('returns 1 for white', () => {
      expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
    });
  });
});
