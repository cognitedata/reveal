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

    // Should not throw or cause any issues when no dispose callback is provided
    expect(() => {
      cache.insert(1, 'test1');
      cache.remove(1);
      cache.insert(2, 'test2');
      cache.clear();
    }).not.toThrow();
  });

  test('dispose callback is not called on successful get', () => {
    const disposeCallback = jest.fn();
    const cache = new MemoryRequestCache<number, string>(10, 5, disposeCallback);

    cache.insert(1, 'test1');
    const result = cache.get(1);

    expect(result).toBe('test1');
    expect(disposeCallback).not.toHaveBeenCalled();
  });

  describe('Reference Counting', () => {
    test('addReference should increment reference count', () => {
      const cache = new MemoryRequestCache<number, string>(10, 5);
      cache.insert(1, 'test1');

      cache.addReference(1);
      expect(cache.getReferenceCount(1)).toBe(1);

      cache.addReference(1);
      expect(cache.getReferenceCount(1)).toBe(2);
    });

    test('removeReference should decrement reference count', () => {
      const cache = new MemoryRequestCache<number, string>(10, 5);
      cache.insert(1, 'test1');

      cache.addReference(1);
      cache.addReference(1);
      expect(cache.getReferenceCount(1)).toBe(2);

      cache.removeReference(1);
      expect(cache.getReferenceCount(1)).toBe(1);
    });

    test('removeReference should keep item in cache when count reaches zero', () => {
      const disposeCallback = jest.fn();
      const cache = new MemoryRequestCache<number, string>(10, 5, disposeCallback);

      cache.insert(1, 'test1');
      cache.addReference(1);

      expect(cache.has(1)).toBe(true);
      expect(cache.getReferenceCount(1)).toBe(1);

      cache.removeReference(1);

      // Item should still be in cache for potential reuse
      expect(cache.has(1)).toBe(true);
      expect(cache.getReferenceCount(1)).toBe(0);
      expect(disposeCallback).not.toHaveBeenCalled();
    });

    test('unreferenced items should only be disposed during cache cleanup', () => {
      const disposeCallback = jest.fn();
      const cache = new MemoryRequestCache<number, string>(2, 1, disposeCallback);

      // Add items with references
      cache.insert(1, 'test1');
      cache.insert(2, 'test2');
      cache.addReference(1);
      cache.addReference(2);

      // Remove reference from test1, making it eligible for cleanup
      cache.removeReference(1);
      expect(cache.has(1)).toBe(true);
      expect(cache.getReferenceCount(1)).toBe(0);
      expect(disposeCallback).not.toHaveBeenCalled();

      // Force cache cleanup by inserting when full
      cache.forceInsert(3, 'test3');

      // test1 should be disposed (unreferenced), test2 should remain (referenced)
      expect(cache.has(2)).toBe(true); // Still referenced
      expect(cache.has(3)).toBe(true); // Newly inserted
      expect(disposeCallback).toHaveBeenCalledWith('test1');
    });

    test('cleanCache should not remove items with active references', () => {
      const disposeCallback = jest.fn();
      const cache = new MemoryRequestCache<number, string>(3, 2, disposeCallback);

      cache.insert(1, 'test1');
      cache.insert(2, 'test2');
      cache.insert(3, 'test3');

      // Add reference to test2 - it should not be cleaned
      cache.addReference(2);

      cache.cleanCache(2);

      // test2 should still exist due to reference
      expect(cache.has(2)).toBe(true);
      expect(disposeCallback).toHaveBeenCalledTimes(2);
      expect(disposeCallback).not.toHaveBeenCalledWith('test2');
    });

    test('forceInsert should respect references during cleanup', () => {
      const disposeCallback = jest.fn();
      const cache = new MemoryRequestCache<number, string>(2, 1, disposeCallback);

      cache.insert(1, 'test1');
      cache.insert(2, 'test2');
      cache.addReference(1); // Protect test1 from cleanup

      cache.forceInsert(3, 'test3');

      // test1 should be protected by reference, test2 should be disposed
      expect(cache.has(1)).toBe(true);
      expect(cache.has(3)).toBe(true);
      expect(disposeCallback).toHaveBeenCalledWith('test2');
    });

    test('getReferenceCount should return 0 for non-existent items', () => {
      const cache = new MemoryRequestCache<number, string>(10, 5);
      expect(cache.getReferenceCount(999)).toBe(0);
    });

    test('removeReference on non-existent item should not error', () => {
      const cache = new MemoryRequestCache<number, string>(10, 5);
      expect(() => cache.removeReference(999)).not.toThrow();
    });

    test('addReference on non-cached item should work', () => {
      const cache = new MemoryRequestCache<number, string>(10, 5);

      cache.addReference(1);
      expect(cache.getReferenceCount(1)).toBe(1);

      // Now insert the item
      cache.insert(1, 'test1');
      expect(cache.getReferenceCount(1)).toBe(1);
    });

    test('clear should reset reference counts', () => {
      const cache = new MemoryRequestCache<number, string>(10, 5);

      cache.insert(1, 'test1');
      cache.addReference(1);
      expect(cache.getReferenceCount(1)).toBe(1);

      cache.clear();
      expect(cache.getReferenceCount(1)).toBe(0);
    });

    test('items can be re-referenced after count drops to zero', () => {
      const disposeCallback = jest.fn();
      const cache = new MemoryRequestCache<number, string>(10, 5, disposeCallback);

      cache.insert(1, 'test1');
      cache.addReference(1);
      expect(cache.getReferenceCount(1)).toBe(1);

      // Reference count drops to 0 but item stays in cache
      cache.removeReference(1);
      expect(cache.has(1)).toBe(true);
      expect(cache.getReferenceCount(1)).toBe(0);
      expect(disposeCallback).not.toHaveBeenCalled();

      // Item can be re-referenced without reloading
      cache.addReference(1);
      expect(cache.getReferenceCount(1)).toBe(1);
      expect(cache.get(1)).toBe('test1'); // Same object, no reload needed
      expect(disposeCallback).not.toHaveBeenCalled();
    });

    test('multiple reference counting scenario with cache reuse', () => {
      const disposeCallback = jest.fn();
      const cache = new MemoryRequestCache<string, { data: string }>(10, 5, disposeCallback);

      const sector1 = { data: 'sector1' };
      const sector2 = { data: 'sector2' };

      cache.insert('model1.sector1', sector1);
      cache.insert('model2.sector2', sector2);

      // Model1 references sector1
      cache.addReference('model1.sector1');
      expect(cache.getReferenceCount('model1.sector1')).toBe(1);

      // Model2 also references sector1 (shared sector)
      cache.addReference('model1.sector1');
      expect(cache.getReferenceCount('model1.sector1')).toBe(2);

      // Model2 references its own sector
      cache.addReference('model2.sector2');
      expect(cache.getReferenceCount('model2.sector2')).toBe(1);

      // Model1 stops using sector1
      cache.removeReference('model1.sector1');
      expect(cache.has('model1.sector1')).toBe(true); // Still in cache due to Model2
      expect(cache.getReferenceCount('model1.sector1')).toBe(1);
      expect(disposeCallback).not.toHaveBeenCalledWith(sector1);

      // Model2 stops using sector1 - should stay in cache for reuse
      cache.removeReference('model1.sector1');
      expect(cache.has('model1.sector1')).toBe(true); // Still in cache for reuse
      expect(cache.getReferenceCount('model1.sector1')).toBe(0);
      expect(disposeCallback).not.toHaveBeenCalledWith(sector1);

      // Model2 stops using sector2 - should stay in cache for reuse
      cache.removeReference('model2.sector2');
      expect(cache.has('model2.sector2')).toBe(true); // Still in cache for reuse
      expect(cache.getReferenceCount('model2.sector2')).toBe(0);
      expect(disposeCallback).not.toHaveBeenCalledWith(sector2);

      // Sectors should only be disposed during cache cleanup
      cache.clear();
      expect(disposeCallback).toHaveBeenCalledWith(sector1);
      expect(disposeCallback).toHaveBeenCalledWith(sector2);
    });
  });
});
