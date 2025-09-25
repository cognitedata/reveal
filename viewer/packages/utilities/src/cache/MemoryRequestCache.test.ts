/*!
 * Copyright 2021 Cognite AS
 */

import { MemoryRequestCache } from './MemoryRequestCache';

import { jest } from '@jest/globals';

describe('MemoryRequestCache', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('insert data', () => {
    const cache = new MemoryRequestCache<number, string>(10, 5);
    expect(() => cache.insert(1, 'test')).not.toThrow();
  });

  test('get existing data', () => {
    const cache = new MemoryRequestCache<number, string>(10, 5);
    cache.insert(1, 'test');
    expect(cache.has(1)).toBeTruthy();
    expect(cache.get(1)).toBe('test');
  });

  test('insert data after clearing cache', () => {
    // Arrange
    const cache = new MemoryRequestCache<number, string>(1, 1);
    cache.insert(1, 'test');
    expect(() => cache.insert(2, 'overflow')).toThrow();
    cache.cleanCache(1);
    expect(() => cache.insert(2, 'overflow retry')).not.toThrow();
    jest.resetAllMocks();
  });

  test('cache is correctly cleaned up on forceInsert after resize with small size', () => {
    const cache = new MemoryRequestCache<number, string>(10, 5);
    cache.resize(2);

    cache.insert(2, 'test');
    cache.insert(3, 'test');

    expect(() => cache.forceInsert(4, 'test')).not.toThrow();
  });

  test('cache does not fail on insertion when initialized to size 0', () => {
    const cache = new MemoryRequestCache<number, string>(0, 0);

    expect(() => cache.insert(1, 'test')).not.toThrow();
    expect(() => cache.forceInsert(2, 'test')).not.toThrow();
  });

  test('cache does not fail on insertion when given cleanup count 0', () => {
    const cache = new MemoryRequestCache<number, string>(2, 0);

    cache.insert(1, 'test');
    cache.insert(2, 'test');

    expect(() => cache.forceInsert(3, 'test')).not.toThrow();
  });

  test('dispose callback is called on remove', () => {
    const disposeCallback = jest.fn();
    const cache = new MemoryRequestCache<number, string>(10, 5, disposeCallback);

    cache.insert(1, 'test1');
    cache.insert(2, 'test2');

    cache.remove(1);

    expect(disposeCallback).toHaveBeenCalledTimes(1);
    expect(disposeCallback).toHaveBeenCalledWith('test1');
  });

  test('dispose callback is called on clear', () => {
    const disposeCallback = jest.fn();
    const cache = new MemoryRequestCache<number, string>(10, 5, disposeCallback);

    cache.insert(1, 'test1');
    cache.insert(2, 'test2');
    cache.insert(3, 'test3');

    cache.clear();

    expect(disposeCallback).toHaveBeenCalledTimes(3);
    expect(disposeCallback).toHaveBeenCalledWith('test1');
    expect(disposeCallback).toHaveBeenCalledWith('test2');
    expect(disposeCallback).toHaveBeenCalledWith('test3');
  });

  test('dispose callback is called on forceInsert when cache is full', () => {
    const disposeCallback = jest.fn();
    const cache = new MemoryRequestCache<number, string>(2, 1, disposeCallback);

    cache.insert(1, 'test1');
    cache.insert(2, 'test2');

    // This should trigger cleanup and dispose one of the existing items
    cache.forceInsert(3, 'test3');

    expect(disposeCallback).toHaveBeenCalledTimes(1);
    // Should dispose one of the items (the exact one depends on timing)
    expect(['test1', 'test2']).toContain(disposeCallback.mock.calls[0][0]);
  });

  test('dispose callback is called on resize when cache shrinks', () => {
    const disposeCallback = jest.fn();
    const cache = new MemoryRequestCache<number, string>(5, 2, disposeCallback);

    cache.insert(1, 'test1');
    cache.insert(2, 'test2');
    cache.insert(3, 'test3');

    // Shrink cache from 5 to 1, should dispose 2 items
    cache.resize(1);

    expect(disposeCallback).toHaveBeenCalledTimes(2);
  });

  test('dispose callback is not called when not provided', () => {
    const cache = new MemoryRequestCache<number, string>(10, 5);

    cache.insert(1, 'test1');
    cache.remove(1);
    cache.insert(2, 'test2');
    cache.clear();

    // Should not throw or cause any issues
    expect(true).toBe(true);
  });

  test('dispose callback is not called on successful get', () => {
    const disposeCallback = jest.fn();
    const cache = new MemoryRequestCache<number, string>(10, 5, disposeCallback);

    cache.insert(1, 'test1');
    const result = cache.get(1);

    expect(result).toBe('test1');
    expect(disposeCallback).not.toHaveBeenCalled();
  });
});
