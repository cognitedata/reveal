import { describe, expect, test } from 'vitest';
import { mergeMapMapValues } from './mergeMapMapValues';

describe(mergeMapMapValues.name, () => {
  test('returns empty result for empty input', () => {
    const result = mergeMapMapValues([]);

    expect(result).toEqual(new Map([]));
  });

  test('returns map with singular value from input', () => {
    const result = mergeMapMapValues([['a-key', new Map([['an-inner-key', ['an-element']]])]]);
    expect([...result.values()]).toHaveLength(1);
    expect(result.get('a-key')?.get('an-inner-key')).toEqual(['an-element']);
  });

  test('merges maps with duplicate outer keys', () => {
    const innerArrayValue0 = [0, 1];
    const innerArrayValue1 = [3, 4];

    const result = mergeMapMapValues([
      ['a-key', new Map([['an-inner-key', innerArrayValue0]])],
      ['a-key', new Map([['another-inner-key', innerArrayValue1]])]
    ]);

    expect([...result.values()]).toHaveLength(1);
    expect([...(result.get('a-key')?.values() ?? [])]).toHaveLength(2);
    expect(result.get('a-key')?.get('an-inner-key')).toEqual(innerArrayValue0);
    expect(result.get('a-key')?.get('another-inner-key')).toEqual(innerArrayValue1);
  });

  test('merges maps with no duplicate outer+inner keys', () => {
    const result = mergeMapMapValues([
      ['a-key', new Map([['an-inner-key', [0]]])],
      ['another-key', new Map([['an-inner-key', [1]]])],
      ['a-key', new Map([['another-inner-key', [2]]])]
    ]);

    expect(result.get('a-key')?.get('an-inner-key')).toEqual([0]);
    expect(result.get('another-key')?.get('an-inner-key')).toEqual([1]);
    expect(result.get('a-key')?.get('another-inner-key')).toEqual([2]);
  });

  test('merges maps with duplicate outer+inner keys', () => {
    const result = mergeMapMapValues([
      ['a-key', new Map([['an-inner-key', [0]]])],
      ['another-key', new Map([['an-inner-key', [1]]])],
      ['another-key', new Map([['an-inner-key', [3, 4, 5]]])]
    ]);

    expect(result.get('a-key')?.get('an-inner-key')).toEqual([0]);
    expect(result.get('another-key')?.get('an-inner-key')).toEqual([1, 3, 4, 5]);
  });
});
