import { describe, expect, test } from 'vitest';
import {
  clear,
  containsTheSameSet,
  copy,
  count,
  firstElement,
  insertAt,
  lastElement,
  remove,
  removeAt,
  swap
} from './arrayExtensions';
import { isOdd } from './mathExtensions';

describe('ArrayExtensions', () => {
  describe('clear', () => {
    test('should clear array in place', () => {
      const array = [1, 2, 3];
      clear(array);
      expect(array).toEqual([]);
      expect(array.length).toBe(0);
    });
  });

  describe('copy', () => {
    test('should copy array in place', () => {
      const array1 = [1, 2, 3];
      const array2 = [4, 5, 6, 7];
      copy(array1, array2);
      expect(array1).toEqual(array2);
    });
  });

  describe('insertAt', () => {
    test('should insert array in place', () => {
      const array1 = [1, 3];
      insertAt(array1, 1, 2);
      expect(array1).toEqual([1, 2, 3]);
    });
  });

  describe('remove', () => {
    test('should remove element in place', () => {
      const array = [1, 2, 3];
      expect(remove(array, 2)).toBe(true);
      expect(array).toEqual([1, 3]);
    });

    test('should only remove a single element', () => {
      const array = [1, 2, 3, 2, 4, 2];
      expect(remove(array, 2)).toBe(true);
      expect(array).toEqual([1, 3, 2, 4, 2]);
    });

    test('should not do anything when element is not found', () => {
      const array = [1, 2, 3];
      expect(remove(array, 5)).toBe(false);
      expect(array).toEqual([1, 2, 3]);
    });
  });

  describe('removeAt', () => {
    test('should remove element in place', () => {
      const array = [1, 2, 3];
      removeAt(array, 1);
      expect(array).toEqual([1, 3]);
    });

    test('should ignore out-of-bounds', () => {
      const array = [1, 2, 3];
      removeAt(array, 10);
      expect(array).toEqual([1, 2, 3]);
    });

    test('should remove last element when index -1 is given', () => {
      const array = [1, 2, 3];
      removeAt(array, -1);
      expect(array).toEqual([1, 2]);
    });
  });

  describe('swap', () => {
    test('should swap elements in place', () => {
      const array: number[] = [4, 5, 6];
      swap(array, 1, 2);
      expect(array).toEqual([4, 6, 5]);
    });
  });

  describe('firstElement', () => {
    test('should return undefined on empty array', () => {
      const array: number[] = [];
      expect(firstElement(array)).toBeUndefined();
    });

    test('should return first element on non-empty array', () => {
      expect(firstElement([42, 1, 2])).toBe(42);
    });
  });

  describe('lastElement', () => {
    test('should return undefined on empty array', () => {
      const array: number[] = [];
      expect(lastElement(array)).toBeUndefined();
    });

    test('should return last element on non-empty array', () => {
      expect(lastElement([1, 2, 42])).toBe(42);
    });
  });

  describe('containsTheSameSet', () => {
    test('should return false when arrays have unequal size', () => {
      expect(containsTheSameSet([1], [1, 1])).toBe(false);
    });

    test('should return true when arrays have same length and contains the same set', () => {
      expect(containsTheSameSet([1, 2, 3], [3, 1, 2])).toBe(true);
    });

    test('should ignore duplicated', () => {
      expect(containsTheSameSet([1, 1, 2, 3], [3, 3, 1, 2])).toBe(true);
    });
  });

  describe('count', () => {
    test('should count high numbers and find none', () => {
      expect(count([1, 2, 3, 4, 5], (a) => a > 100)).toBe(0);
    });

    test('should count odd numbers', () => {
      expect(count([1, 2, 3, 4, 5], isOdd)).toBe(3);
    });
  });
});
