/*!
 * Copyright 2025 Cognite AS
 */

import { safeParseInt, getCacheDate, getCacheSize } from './utils';
import { BINARY_FILES_CACHE_HEADER_DATE, BINARY_FILES_CACHE_HEADER_SIZE } from './constants';

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

    test('should return undefined for invalid inputs', () => {
      expect(safeParseInt(null)).toBeUndefined();
      expect(safeParseInt(undefined)).toBeUndefined();
      expect(safeParseInt('')).toBeUndefined();
      expect(safeParseInt('abc')).toBeUndefined();
      expect(safeParseInt('NaN')).toBeUndefined();
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

    test('should return undefined for missing cache date header', () => {
      const response = new Response(null, {
        headers: new Headers()
      });

      expect(getCacheDate(response)).toBeUndefined();
    });

    test('should return undefined for invalid cache date header', () => {
      const response = new Response(null, {
        headers: new Headers({
          [BINARY_FILES_CACHE_HEADER_DATE]: 'invalid-date'
        })
      });

      expect(getCacheDate(response)).toBeUndefined();
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

    test('should return undefined for missing cache size header', () => {
      const response = new Response(null, {
        headers: new Headers()
      });

      expect(getCacheSize(response)).toBeUndefined();
    });

    test('should return undefined for invalid cache size header', () => {
      const response = new Response(null, {
        headers: new Headers({
          [BINARY_FILES_CACHE_HEADER_SIZE]: 'not-a-number'
        })
      });

      expect(getCacheSize(response)).toBeUndefined();
    });
  });

  function createCachedResponse(data: ArrayBuffer, options: CachedResponseOptions): Response {
    const { cacheDate, cacheSize, contentType = 'application/octet-stream' } = options;

    return new Response(data, {
      status: 200,
      headers: new Headers({
        'Content-Type': contentType,
        'Content-Length': data.byteLength.toString(),
        [BINARY_FILES_CACHE_HEADER_DATE]: cacheDate.toString(),
        [BINARY_FILES_CACHE_HEADER_SIZE]: cacheSize.toString()
      })
    });
  }
});
