import { describe, expect, test } from 'vitest';
import { concatenateMapValues } from './concatenateMapValues';

describe(concatenateMapValues.name, () => {
  test('should return empty map for empty input', () => {
    const result = concatenateMapValues([]);
    expect(result).toEqual(new Map());
  });

  test('should return singleton with list value for one input', () => {
    const result = concatenateMapValues([['key', 'value']]);
    expect(result).toEqual(new Map([['key', ['value']]]));
  });

  test('should return map with all values when there are no duplicate keys', () => {
    const result = concatenateMapValues([
      ['key0', 'value0'],
      ['key1', 'value1'],
      ['key2', 'value2']
    ]);
    expect(result).toEqual(
      new Map([
        ['key0', ['value0']],
        ['key1', ['value1']],
        ['key2', ['value2']]
      ])
    );
  });

  test('should return map with all values categorized in lists when there are duplicate keys', () => {
    const result = concatenateMapValues([
      ['key0', 'value0'],
      ['key1', 'value1'],
      ['key0', 'value2'],
      ['key1', 'value3'],
      ['key2', 'value4']
    ]);
    expect(result).toEqual(
      new Map([
        ['key0', ['value0', 'value2']],
        ['key1', ['value1', 'value3']],
        ['key2', ['value4']]
      ])
    );
  });
});
