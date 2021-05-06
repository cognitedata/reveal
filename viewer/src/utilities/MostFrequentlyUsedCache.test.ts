/*!
 * Copyright 2021 Cognite AS
 */

import { MostFrequentlyUsedCache } from './MostFrequentlyUsedCache';

describe('MostFrequentlyUsedCache', () => {
  test('set within capacity, returns true', () => {
    const cache = new MostFrequentlyUsedCache<string, number>(1);
    cache.set('key', 1);
  });

  test('set overfilling capacity, returns true for kept item, false for rejected', () => {
    const cache = new MostFrequentlyUsedCache<string, number>(1);
    cache.get('key2'); // Ask for key1 to give it priority
    expect(cache.set('key1', 1)).toBeTrue();
    expect(cache.set('key2', 2)).toBeTrue();
    expect(cache.set('key3', 1)).toBeFalse(); // Not added
  });

  test('get return undefined for non-existant key', () => {
    const cache = new MostFrequentlyUsedCache<string, number>(1);
    expect(cache.get('key')).toBeUndefined();
  });

  test('get return value of existing key', () => {
    const cache = new MostFrequentlyUsedCache<string, number>(1);
    cache.set('key', 1);
    expect(cache.get('key')).toBe(1);
    // Make 'newKey' have higher priorty then add it
    cache.get('newKey');
    cache.get('newKey');
    cache.set('newKey', 2);
    expect(cache.get('newKey')).toBe(2);
    expect(cache.get('key')).toBeUndefined();
  });

  test('remove returns true if element is added and removes element', () => {
    const cache = new MostFrequentlyUsedCache<string, number>(1);
    cache.set('key', 1);
    expect(cache.get('key')).toBe(1);

    const wasRemoved = cache.remove('key');

    expect(wasRemoved).toBeTrue();
    expect(cache.get('key')).toBeUndefined();
  });

  test('remove returns false if element is not added', () => {
    const cache = new MostFrequentlyUsedCache<string, number>(1);
    const wasRemoved = cache.remove('key');
    expect(wasRemoved).toBeFalse();
  });

  test('clear() removes all elements', () => {
    const cache = new MostFrequentlyUsedCache<string, number>(10);
    for (let i = 0; i < 10; i++) {
      cache.set(`${i}`, i);
    }
    cache.clear();
    for (let i = 0; i < 10; i++) {
      expect(cache.get(`${i}`)).toBeUndefined();
    }
  });

  test('remove() triggers dispose callback', () => {
    const disposeCb = jest.fn();
    const cache = new MostFrequentlyUsedCache<string, string>(10, disposeCb);
    cache.set('key', 'value');
    cache.remove('key');
    expect(disposeCb).toBeCalledWith('value');
  });

  test('clear() triggers dispose callback for all elements', () => {
    const disposeCb = jest.fn();
    const cache = new MostFrequentlyUsedCache<string, string>(10, disposeCb);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();
    expect(disposeCb).toBeCalledTimes(2);
    expect(disposeCb).toBeCalledWith('value1');
    expect(disposeCb).toBeCalledWith('value2');
  });
});
