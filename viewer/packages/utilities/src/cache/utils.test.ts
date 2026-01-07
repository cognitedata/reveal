/*!
 * Copyright 2025 Cognite AS
 */

import { safeParseInt, getCacheDate, getCacheSize } from './utils';
import { CACHE_HEADER_DATE, CACHE_HEADER_SIZE } from './constants';

interface CachedResponseOptions {
  cacheDate: number;
  cacheSize: number;
  contentType?: string;
}

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

  describe('getCacheDate', () => {
    test('should extract cache date from response headers', () => {
      const timestamp = 1704067200000; // 2024-01-01
      const response = createCachedResponse(new ArrayBuffer(0), {
        cacheDate: timestamp,
        cacheSize: 100
      });

      expect(getCacheDate(response)).toBe(timestamp);
    });

    test('should return 0 for missing cache date header', () => {
      const response = new Response(null, {
        headers: new Headers()
      });

      expect(getCacheDate(response)).toBe(0);
    });

    test('should return 0 for invalid cache date header', () => {
      const response = new Response(null, {
        headers: new Headers({
          [CACHE_HEADER_DATE]: 'invalid-date'
        })
      });

      expect(getCacheDate(response)).toBe(0);
    });
  });

  describe('getCacheSize', () => {
    test('should extract cache size from response headers', () => {
      const size = 12345;
      const response = createCachedResponse(new ArrayBuffer(0), {
        cacheDate: 1704067200000,
        cacheSize: size
      });

      expect(getCacheSize(response)).toBe(size);
    });

    test('should return 0 for missing cache size header', () => {
      const response = new Response(null, {
        headers: new Headers()
      });

      expect(getCacheSize(response)).toBe(0);
    });

    test('should return 0 for invalid cache size header', () => {
      const response = new Response(null, {
        headers: new Headers({
          [CACHE_HEADER_SIZE]: 'not-a-number'
        })
      });

      expect(getCacheSize(response)).toBe(0);
    });
  });

  function createCachedResponse(data: ArrayBuffer, options: CachedResponseOptions): Response {
    const { cacheDate, cacheSize, contentType = 'application/octet-stream' } = options;

    return new Response(data, {
      status: 200,
      headers: new Headers({
        'Content-Type': contentType,
        'Content-Length': data.byteLength.toString(),
        [CACHE_HEADER_DATE]: cacheDate.toString(),
        [CACHE_HEADER_SIZE]: cacheSize.toString()
      })
    });
  }
});
