import { describe, expect, test } from 'vitest';
import {
  isAbsEqual,
  isBetween,
  isEqual,
  isEven,
  isIncrement,
  isInteger,
  isOdd,
  isZero,
  square
} from './mathExtensions';

describe('MathExtensions', () => {
  describe('isZero', () => {
    test('should be zero', () => {
      expect(isZero(0)).toBe(true);
    });
    test('should not be zero', () => {
      expect(isZero(0.0001)).toBe(false);
    });
  });

  describe('isEqual', () => {
    test('should be equal', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual(0, 0)).toBe(true);
      expect(isEqual(100000, 100000)).toBe(true);
    });
    test('should not be equal', () => {
      expect(isEqual(1, 1.0001)).toBe(false);
      expect(isEqual(0, 0.0001)).toBe(false);
      expect(isEqual(100000, 100000.1)).toBe(false);
    });
  });

  describe('isAbsEqual', () => {
    test('should be equal', () => {
      expect(isAbsEqual(1, 1, 0.0001)).toBe(true);
      expect(isAbsEqual(0, 0, 0.0001)).toBe(true);
      expect(isAbsEqual(100000, 100001, 2)).toBe(true);
    });
    test('should not be equal', () => {
      expect(isAbsEqual(1, 1.0002, 0.0001)).toBe(false);
      expect(isAbsEqual(0, 0.0002, 0.0001)).toBe(false);
      expect(isAbsEqual(100000, 100000.2, 0.1)).toBe(false);
    });
  });

  describe('isInteger', () => {
    test('should be integer', () => {
      expect(isInteger(0)).toBe(true);
      expect(isInteger(2)).toBe(true);
      expect(isInteger(-2)).toBe(true);
      expect(isInteger(10000)).toBe(true);
    });
    test('should not be integer', () => {
      expect(isInteger(0.0001)).toBe(false);
      expect(isInteger(2.0001)).toBe(false);
      expect(isInteger(-2.9999)).toBe(false);
      expect(isInteger(10000.1)).toBe(false);
    });
  });

  describe('isIncrement', () => {
    test('should be increment', () => {
      expect(isIncrement(0, 1)).toBe(true);
      expect(isIncrement(10, 1)).toBe(true);
      expect(isIncrement(2.5, 0.5)).toBe(true);
    });
    test('should not be increment', () => {
      expect(isIncrement(1, 0)).toBe(false);
      expect(isIncrement(0.1, 1)).toBe(false);
      expect(isIncrement(10.1, 1)).toBe(false);
      expect(isIncrement(2.51, 0.5)).toBe(false);
    });
  });

  describe('isOdd', () => {
    test('should be odd', () => {
      expect(isOdd(1)).toBe(true);
      expect(isOdd(-101)).toBe(true);
    });
    test('should not odd', () => {
      expect(isOdd(0)).toBe(false);
      expect(isOdd(2)).toBe(false);
      expect(isOdd(-102)).toBe(false);
    });
  });

  describe('isEven', () => {
    test('should be even', () => {
      expect(isEven(0)).toBe(true);
      expect(isEven(2)).toBe(true);
      expect(isEven(-102)).toBe(true);
    });
    test('should not even', () => {
      expect(isEven(1)).toBe(false);
      expect(isEven(-101)).toBe(false);
    });
  });

  describe('isBetween', () => {
    test('should be between', () => {
      expect(isBetween(0, 0.1, 1)).toBe(true);
    });
    test('should not be between', () => {
      expect(isBetween(0, 2, 1)).toBe(false);
      expect(isBetween(0, 0, 1)).toBe(false);
      expect(isBetween(0, 1, 1)).toBe(false);
    });
  });

  describe('square', () => {
    test('should be square', () => {
      expect(square(0)).toBe(0);
      expect(square(2)).toBe(4);
      expect(square(-2)).toBe(4);
    });
  });
});
