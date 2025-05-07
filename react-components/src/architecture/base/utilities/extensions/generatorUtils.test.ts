import { describe, expect, test } from 'vitest';
import { count, first, last } from './generatorUtils';

describe('generatorUtils', () => {
  test('should correctly count the number of items in a generator', () => {
    expect(count(getPositiveNumbers(0))).toBe(0);
    expect(count(getPositiveNumbers(5))).toBe(5);
  });

  test('should return the first item from a generator', () => {
    expect(first(getPositiveNumbers(0))).toBeUndefined();
    expect(first(getPositiveNumbers(5))).toBe(0);
  });

  test('should return the last item from a generator', () => {
    expect(last(getPositiveNumbers(0))).toBeUndefined();
    expect(last(getPositiveNumbers(5))).toBe(4);
  });
});

function* getPositiveNumbers(count: number): Generator<number> {
  for (let i = 0; i < count; i++) {
    yield i;
  }
}
