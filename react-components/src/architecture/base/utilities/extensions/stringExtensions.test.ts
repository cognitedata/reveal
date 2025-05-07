import { describe, expect, test } from 'vitest';
import {
  equalsIgnoreCase,
  equalsIgnoreCaseAndSpace,
  isEmpty,
  numberToString
} from './stringExtensions';

describe('StringExtensions', () => {
  describe('isEmpty', () => {
    test('should empty string be be empty', () => {
      expect(isEmpty('')).toBe(true);
    });
    test('should undefined be empty', () => {
      expect(isEmpty(undefined)).toBe(true);
    });
    test('should be null be empty', () => {
      expect(isEmpty(null)).toBe(true);
    });
    test('should string not be empty', () => {
      expect(isEmpty('abc')).toBe(false);
    });
  });

  describe('equalsIgnoreCase', () => {
    test('should be equal when empty string', () => {
      expect(equalsIgnoreCase('', '')).toBe(true);
    });
    test('should be equal', () => {
      expect(equalsIgnoreCase('abc', 'abc')).toBe(true);
    });
    test('should be equal when different case', () => {
      expect(equalsIgnoreCase('abc', 'ABC')).toBe(true);
    });
    test('should be not equal', () => {
      expect(equalsIgnoreCase('abc', 'abd')).toBe(false);
    });
    test('should be not equal when one is empty', () => {
      expect(equalsIgnoreCase('abc', '')).toBe(false);
    });
    test('should be not equal when different case', () => {
      expect(equalsIgnoreCase('abc', 'ABD')).toBe(false);
    });
  });

  describe('equalsIgnoreCaseAndSpace', () => {
    test('should be equal when empty string', () => {
      expect(equalsIgnoreCaseAndSpace('', '')).toBe(true);
    });
    test('should be equal', () => {
      expect(equalsIgnoreCaseAndSpace('ab c', 'ab c')).toBe(true);
    });
    test('should be equal when different case', () => {
      expect(equalsIgnoreCaseAndSpace('abc ', 'ABC ')).toBe(true);
    });
    test('should be not equal', () => {
      expect(equalsIgnoreCaseAndSpace('abc', 'abd')).toBe(false);
    });
    test('should be not equal when one is empty', () => {
      expect(equalsIgnoreCaseAndSpace('', 'abc')).toBe(false);
      expect(equalsIgnoreCaseAndSpace('abc', '')).toBe(false);
    });
    test('should be not equal when different case', () => {
      expect(equalsIgnoreCaseAndSpace('abc', 'ABD')).toBe(false);
    });
    test('should be not equal when different size', () => {
      expect(equalsIgnoreCaseAndSpace('a', 'abc')).toBe(false);
      expect(equalsIgnoreCaseAndSpace('abc', 'a')).toBe(false);
      expect(equalsIgnoreCaseAndSpace('a', 'a b c')).toBe(false);
      expect(equalsIgnoreCaseAndSpace('a b c', 'a')).toBe(false);
    });
  });

  describe('numberToString', () => {
    test('should convert positive integers to strings as expected', () => {
      expect(numberToString(0)).toBe('0');
      expect(numberToString(1)).toBe('1');
      expect(numberToString(12)).toBe('12');
      expect(numberToString(123)).toBe('123');
      expect(numberToString(1234)).toBe('1234');
      expect(numberToString(12345)).toBe('12345');
      expect(numberToString(123456)).toBe('123456');
      expect(numberToString(1234567)).toBe('1234567');
      expect(numberToString(12345678)).toBe('12345678');
      expect(numberToString(123456789)).toBe('123456789');
    });

    test('should convert negative integers to strings as expected', () => {
      expect(numberToString(-1)).toBe('-1');
      expect(numberToString(-12)).toBe('-12');
      expect(numberToString(-123)).toBe('-123');
      expect(numberToString(-1234)).toBe('-1234');
      expect(numberToString(-12345)).toBe('-12345');
      expect(numberToString(-123456)).toBe('-123456');
      expect(numberToString(-1234567)).toBe('-1234567');
      expect(numberToString(-12345678)).toBe('-12345678');
    });

    test('should convert big numbers to strings as expected', () => {
      expect(numberToString(10)).toBe('10');
      expect(numberToString(100)).toBe('100');
      expect(numberToString(1000)).toBe('1000');
      expect(numberToString(10000)).toBe('10000');
      expect(numberToString(100000)).toBe('100000');
      expect(numberToString(1000000)).toBe('1000000');
      expect(numberToString(10000000)).toBe('10000000');
      expect(numberToString(100000000)).toBe('100000000');
      expect(numberToString(1000000000)).toBe('1000000000');
    });

    test('should convert decimal numbers to strings with expected rounding', () => {
      expect(numberToString(123.456789)).toBe('123.45679');
      expect(numberToString(12.3456789)).toBe('12.34568');
      expect(numberToString(1.23456789)).toBe('1.23457');
      expect(numberToString(0.123456789)).toBe('0.12346');
      expect(numberToString(0.0123456789)).toBe('0.01235');
      expect(numberToString(0.00123456789)).toBe('0.00123');
    });

    test('should convert decimal numbers with many digits to strings with expected rounding', () => {
      expect(numberToString(0.12)).toBe('0.12');
      expect(numberToString(0.123)).toBe('0.123');
      expect(numberToString(0.1234)).toBe('0.1234');
      expect(numberToString(0.12345)).toBe('0.12345');
      expect(numberToString(0.123456)).toBe('0.12346');
      expect(numberToString(0.123456)).toBe('0.12346');
      expect(numberToString(0.1234567)).toBe('0.12346');
      expect(numberToString(0.12345678)).toBe('0.12346');
    });

    test('should convert small decimal numbers to strings with expected scientific notation', () => {
      expect(numberToString(0.123)).toBe('0.123');
      expect(numberToString(0.0123)).toBe('0.0123');
      expect(numberToString(0.00123)).toBe('0.00123');
      expect(numberToString(0.000123)).toBe('0.000123');
      expect(numberToString(0.0000123)).toBe('0.0000123');
      expect(numberToString(0.00000123)).toBe('0.00000123');
      expect(numberToString(0.000000123)).toBe('1.23e-7');
      expect(numberToString(-0.000000123)).toBe('-1.23e-7');
    });

    test('test some corner cases', () => {
      expect(numberToString(1.20000005)).toBe('1.2');
      expect(numberToString(1.19999992)).toBe('1.2');
    });
  });
});
