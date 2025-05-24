import { describe, expect, test } from 'vitest';
import { count, first, last } from './generatorUtils';
import { isOdd } from './mathExtensions';

describe('generatorUtils', () => {
  describe('first', () => {
    test('should return undefined when no items in the generator', () => {
      expect(first(getPositiveNumbers(0))).toBeUndefined();
    });

    test('should return the first item from a generator', () => {
      expect(first(getPositiveNumbers(5))).toBe(0);
    });
  });

  describe('last', () => {
    test('should return undefined when no items in the generator', () => {
      expect(last(getPositiveNumbers(0))).toBeUndefined();
    });

    test('should return the last item from a generator', () => {
      expect(last(getPositiveNumbers(5))).toBe(4);
    });
  });

  describe('count', () => {
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
});

function* getPositiveNumbers(count: number): Generator<number> {
  for (let i = 0; i < count; i++) {
    yield i;
  }
}
