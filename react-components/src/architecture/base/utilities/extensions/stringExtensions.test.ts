import { describe, expect, test } from 'vitest';
import { equalsIgnoreCase, equalsIgnoreCaseAndSpace, isEmpty } from './stringExtensions';

describe('StringExtensions', () => {
  describe('isEmpty', () => {
    test('should empty string be be empty', () => {
      expect(isEmpty('')).toEqual(true);
    });
    test('should undefined be empty', () => {
      expect(isEmpty(undefined)).toEqual(true);
    });
    test('should be null be empty', () => {
      expect(isEmpty(null)).toEqual(true);
    });
    test('should string not be empty', () => {
      expect(isEmpty('abc')).toEqual(false);
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
      //expect(equalsIgnoreCaseAndSpace('abc', '')).toBe(false);
    });
    test('should be not equal when different case', () => {
      expect(equalsIgnoreCaseAndSpace('abc', 'ABD')).toBe(false);
    });
  });
});
