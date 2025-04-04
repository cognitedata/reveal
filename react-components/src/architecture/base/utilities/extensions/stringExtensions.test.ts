import { describe, expect, test } from 'vitest';
import { equalsIgnoreCase, equalsIgnoreCaseAndSpace, isEmpty } from './stringExtensions';

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
});
