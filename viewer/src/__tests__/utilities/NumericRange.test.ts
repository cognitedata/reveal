/*!
 * Copyright 2021 Cognite AS
 */

import { NumericRange } from '../../utilities';

describe('NumericRange', () => {
  test('constructor does not accept negative count', () => {
    expect(() => new NumericRange(0, -1)).toThrowError();
  });

  test('toInclusive is less than from when range is empty', () => {
    const range = new NumericRange(15, 0);
    expect(range.toInclusive).toBeLessThan(range.from);
    expect(range.count).toBe(0);
  });

  test('values() and toArray() returns no values when range is empty', () => {
    const range = new NumericRange(1, 0);
    expect(range.values()).toBeEmpty();
    expect(range.toArray()).toBeEmpty();
  });

  test('values() and toArray() returns correct values', () => {
    const range = new NumericRange(10, 3);
    expect(Array.from(range.values())).toEqual([10, 11, 12]);
    expect(range.toArray()).toEqual([10, 11, 12]);
  });

  test('contains works', () => {
    const range = new NumericRange(11, 10);
    expect(range.from).toBe(11);
    expect(range.toInclusive).toBe(20);
    expect(range.count).toBe(10);
    expect(range.contains(11)).toBeTrue();
    expect(range.contains(15)).toBeTrue();
    expect(range.contains(20)).toBeTrue();
    expect(range.contains(21)).toBeFalse();
    expect(range.contains(10)).toBeFalse();
  });

  test('forEach applies callback to each value', () => {
    const applied: number[] = [];
    const range = new NumericRange(1, 4);
    range.forEach(v => {
      applied.push(v);
    });
    expect(applied).toEqual([1, 2, 3, 4]);
  });
});
