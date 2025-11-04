/*!
 * Copyright 2025 Cognite AS
 */

import { getDmsPaginationCursor } from './dmsPaginationUtils';

describe(getDmsPaginationCursor.name, () => {
  describe('object cursor with cursorKey (sub-query pagination)', () => {
    test('should return cursor when results reached limit', () => {
      const results = new Array(100).fill({});
      const nextCursor = { images: 'cursor-123' };

      const cursor = getDmsPaginationCursor(results, nextCursor, 'images', 100);

      expect(cursor).toBe('cursor-123');
    });

    test('should return undefined when results are below limit', () => {
      const results = new Array(50).fill({});
      const nextCursor = { images: 'cursor-789' };

      const cursor = getDmsPaginationCursor(results, nextCursor, 'images', 100);

      expect(cursor).toBeUndefined();
    });

    test('should return undefined when cursor key does not exist in object', () => {
      const results = new Array(100).fill({});
      const nextCursor = {};

      const cursor = getDmsPaginationCursor(results, nextCursor, 'images', 100);

      expect(cursor).toBeUndefined();
    });

    test('should return undefined when cursor value is empty string', () => {
      const results = new Array(100).fill({});
      const nextCursor = { images: '' };

      const cursor = getDmsPaginationCursor(results, nextCursor, 'images', 100);

      expect(cursor).toBeUndefined();
    });

    test('should return undefined when results are undefined', () => {
      const nextCursor = { images: 'cursor-abc' };

      const cursor = getDmsPaginationCursor(undefined, nextCursor, 'images', 100);

      expect(cursor).toBeUndefined();
    });

    test('should return undefined when nextCursor is undefined', () => {
      const results = new Array(100).fill({});

      const cursor = getDmsPaginationCursor(results, undefined, 'images', 100);

      expect(cursor).toBeUndefined();
    });
  });

  describe('string cursor without cursorKey (main query pagination)', () => {
    test('should return cursor when results reached limit', () => {
      const results = new Array(1000).fill({});
      const nextCursor = 'main-query-cursor';

      const cursor = getDmsPaginationCursor(results, nextCursor, undefined, 1000);

      expect(cursor).toBe('main-query-cursor');
    });

    test('should return undefined when results are below limit', () => {
      const results = new Array(500).fill({});
      const nextCursor = 'main-query-cursor';

      const cursor = getDmsPaginationCursor(results, nextCursor, undefined, 1000);

      expect(cursor).toBeUndefined();
    });

    test('should return undefined when cursor is empty string', () => {
      const results = new Array(1000).fill({});
      const nextCursor = '';

      const cursor = getDmsPaginationCursor(results, nextCursor, undefined, 1000);

      expect(cursor).toBeUndefined();
    });
  });

  describe('mismatched cursor types', () => {
    test('should return undefined when cursorKey provided but nextCursor is string', () => {
      const results = new Array(1000).fill({});
      const nextCursor = 'main-query-cursor';

      const cursor = getDmsPaginationCursor(results, nextCursor, 'images', 1000);

      expect(cursor).toBeUndefined();
    });

    test('should return undefined when no cursorKey but nextCursor is object', () => {
      const results = new Array(1000).fill({});
      const nextCursor = { images: 'cursor-abc' };

      const cursor = getDmsPaginationCursor(results, nextCursor, undefined, 1000);

      expect(cursor).toBeUndefined();
    });
  });
});
