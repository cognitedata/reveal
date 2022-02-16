/*!
 * Copyright 2021 Cognite AS
 */

import { MemoryRequestCache } from './MemoryRequestCache';

describe('MemoryRequestCache', () => {
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
    const cache = new MemoryRequestCache<number, string>(1);
    cache.insert(1, 'test');
    expect(() => cache.insert(2, 'overflow')).toThrow();
    cache.cleanCache(1);
    expect(() => cache.insert(2, 'overflow retry')).not.toThrow();
    jest.resetAllMocks();
  });

  test('cache is correctly cleaned up on forceInsert after resize with small size', () => {
    const cache = new MemoryRequestCache<number, string>(10);
    cache.resize(2);

    cache.insert(2, 'test');
    cache.insert(3, 'test');

    expect(() => cache.forceInsert(4, 'test')).not.toThrow();
  });

  // TODO add test that requires data
});
