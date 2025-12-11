/*!
 * Copyright 2025 Cognite AS
 */

import { safeParseInt } from './utils';

describe('cacheUtils', () => {
  describe('safeParseInt', () => {
    test('should parse valid number strings', () => {
      expect(safeParseInt('123')).toBe(123);
      expect(safeParseInt('0')).toBe(0);
      expect(safeParseInt('-123')).toBe(-123);
      expect(safeParseInt('  456  ')).toBe(456);
      expect(safeParseInt('123.45')).toBe(123);
    });

    test('should return 0 for invalid inputs', () => {
      expect(safeParseInt(null)).toBe(0);
      expect(safeParseInt(undefined)).toBe(0);
      expect(safeParseInt('')).toBe(0);
      expect(safeParseInt('abc')).toBe(0);
      expect(safeParseInt('NaN')).toBe(0);
    });
  });
});
