/*!
 * Copyright 2020 Cognite AS
 */

import { MemoryRequestCache } from '@/utilities/cache/MemoryRequestCache';

describe('MemoryCache', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('insert data', () => {
    const cache = new MemoryRequestCache<number, string>();
    expect(() => cache.insert(1, 'test')).not.toThrow();
  });

  test('get existing data', () => {
    const cache = new MemoryRequestCache<number, string>();
    cache.insert(1, 'test');
    expect(cache.has(1)).toBeTruthy();
    expect(cache.get(1)).toBe('test');
  });

  test('insert data after clearing cache', () => {
    // Arrange
    const cache = new MemoryRequestCache<number, string>({ maxElementsInCache: 1 });
    cache.insert(1, 'test');
    expect(() => cache.insert(2, 'overflow')).toThrow();
    cache.cleanCache(1);
    expect(() => cache.insert(2, 'overflow retry')).not.toThrow();
    jest.resetAllMocks();
  });

  // TODO add test that requires data
});
