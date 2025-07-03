import { describe, expect, test } from 'vitest';
import { count, filter, first, last, map } from './generatorUtils';
import { isOdd } from './mathExtensions';

describe('generatorUtils', () => {
  describe(first.name, () => {
    test('should return undefined when no items in the generator', () => {
      expect(first(getPositiveNumbers(0))).toBeUndefined();
    });

    test('should return the first item from a generator', () => {
      expect(first(getPositiveNumbers(5))).toBe(0);
    });
  });

  describe(last.name, () => {
    test('should return undefined when no items in the generator', () => {
      expect(last(getPositiveNumbers(0))).toBeUndefined();
    });

    test('should return the last item from a generator', () => {
      expect(last(getPositiveNumbers(5))).toBe(4);
    });
  });

  describe(count.name, () => {
    test('should correctly count the number of items in a generator', () => {
      expect(count(getPositiveNumbers(0))).toBe(0);
      expect(count(getPositiveNumbers(5))).toBe(5);
    });

    test('should correctly count the odd number of items in a generator', () => {
      expect(count(getPositiveNumbers(8), (a) => isOdd(a))).toBe(4);
    });

    test('should count high numbers and find none', () => {
      expect(count(getPositiveNumbers(6), (a) => a > 100)).toBe(0);
    });
  });

  describe(filter.name, () => {
    test('should return empty generator on empty input', () => {
      expect([...filter(getEmptyGenerator(), () => true)]).toEqual([]);
    });

    test('should return all items satisfying predicate', () => {
      expect([...filter(getPositiveNumbers(10), (num) => num % 3 === 0 || num === 4)]).toEqual([
        0, 3, 4, 6, 9
      ]);
    });
  });

  describe(map.name, () => {
    test('should return empty generator on empty input', () => {
      expect([...map(getEmptyGenerator(), () => 1)]).toEqual([]);
    });

    test('should transform every input item', () => {
      expect([...map(getPositiveNumbers(6), (n) => -n + 3)]).toEqual([3, 2, 1, 0, -1, -2]);
    });
  });
});

function* getPositiveNumbers(count: number): Generator<number> {
  for (let i = 0; i < count; i++) {
    yield i;
  }
}

function getEmptyGenerator(): Generator<number> {
  return getPositiveNumbers(0);
}
