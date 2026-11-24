import { describe, expect, it } from 'vitest';
import { sumCents } from './money.js';

describe('sumCents', () => {
  it('returns 0 for an empty list', () => {
    expect(sumCents([])).toBe(0);
  });

  it('sums values', () => {
    expect(sumCents([100, 250, 5])).toBe(355);
  });

  it('throws RangeError for a non-integer value', () => {
    expect(() => sumCents([100, 1.5])).toThrow(RangeError);
  });
});
