/*!
 * Copyright 2020 Cognite AS
 */

import { MostFrequentlyUsedCache } from '../../../utilities/cache/MostFrequentlyUsedCache';

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
});
