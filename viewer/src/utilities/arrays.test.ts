/*!
 * Copyright 2021 Cognite AS
 */

import { binarySearchLastIndexOf, createOffsets, shiftValuesRight } from './arrays';
import 'jest-extended';

describe('createOffsets', () => {
  test('empty array, returns empty', () => {
    const result = createOffsets(new Float64Array(0));
    expect(result).toBeEmpty();
  });

  test('three elements, returns correct result', () => {
    const original = new Float64Array([1, 5, 7]);
    const result = createOffsets(original);
    expect(result).toContainAllValues([0, 1, 6]);
  });
});

describe('shiftValuesRight', () => {
  test('valid input gives expected result', () => {
    expect(shiftValuesRight([1, 2, 3, 4, -1, -1], 2, 2)).toEqual([1, 2, 3, 4, 3, 4]);
    expect(shiftValuesRight([1, 2, 3, 4, -1, -1], 1, 3)).toEqual([1, 2, 3, 4, 2, 3]);
  });

  test('zero shift does nothing', () => {
    expect(shiftValuesRight([1, 2, 3], 1, 0)).toEqual([1, 2, 3]);
  });

  test('negative input throws', () => {
    expect(() => shiftValuesRight([1, 2, 3], -1, 1)).toThrowError();
    expect(() => shiftValuesRight([1, 2, 3], 1, -1)).toThrowError();
  });

  test('shift outside array bounds throws', () => {
    expect(() => shiftValuesRight([1, 2, 3], 0, 3)).toThrowError();
    expect(() => shiftValuesRight([1, 2, 3], 0, 4)).toThrowError();
  });
});

describe('binarySearchLastIndexOf', () => {
  test('needle is first element', () => {
    const haystack = [1, 2, 6, 10];
    expect(binarySearchLastIndexOf(haystack, 1)).toEqual(0);
  });

  test('needle is last element', () => {
    const haystack = [1, 2, 6, 10];
    expect(binarySearchLastIndexOf(haystack, 10)).toEqual(3);
  });

  test('needle is mid element', () => {
    const haystack = [1, 2, 5, 6, 10];
    expect(binarySearchLastIndexOf(haystack, 5)).toEqual(2);
  });

  test('needle is low-mid element', () => {
    const haystack = [1, 2, 6, 10];
    expect(binarySearchLastIndexOf(haystack, 2)).toEqual(1);
  });

  test('needle is high-mid element', () => {
    const haystack = [1, 2, 6, 10];
    expect(binarySearchLastIndexOf(haystack, 6)).toEqual(2);
  });

  test('needle is before first element, return -1', () => {
    const haystack = [1, 2, 6, 10];
    expect(binarySearchLastIndexOf(haystack, 2)).toEqual(1);
  });

  test('not found returns bitwise complement of insertion point', () => {
    function bitwiseComplement(x: number) {
      return -x - 1;
    }
    const haystack = [1, 3, 6, 10];
    expect(binarySearchLastIndexOf(haystack, 0)).toEqual(bitwiseComplement(0));
    expect(binarySearchLastIndexOf(haystack, 2)).toEqual(bitwiseComplement(1));
    expect(binarySearchLastIndexOf(haystack, 4)).toEqual(bitwiseComplement(2));
    expect(binarySearchLastIndexOf(haystack, 7)).toEqual(bitwiseComplement(3));
    expect(binarySearchLastIndexOf(haystack, 11)).toEqual(bitwiseComplement(4));
  });

  test('partial search only', () => {
    const haystack = [1, 2, 4, 5, 6, 10];
    expect(binarySearchLastIndexOf(haystack, 1, 3)).toEqual(0);
    expect(binarySearchLastIndexOf(haystack, 2, 3)).toEqual(1);
    expect(binarySearchLastIndexOf(haystack, 4, 3)).toEqual(2);
    expect(binarySearchLastIndexOf(haystack, 5, 3)).toBeNegative();
    expect(binarySearchLastIndexOf(haystack, 6, 3)).toBeNegative();
    expect(binarySearchLastIndexOf(haystack, 10, 3)).toBeNegative();
    expect(binarySearchLastIndexOf(haystack, 10, 100)).toEqual(5);
  });

  test('array contains series of equal values, returns last index', () => {
    const haystack = [1, 1, 2, 2, 3, 4, 5, 5, 5, 5, 6, 7, 7];
    for (let x = 0; x <= 7; x++) {
      expect(binarySearchLastIndexOf(haystack, x)).toEqual(haystack.lastIndexOf(x));
    }
  });
});
