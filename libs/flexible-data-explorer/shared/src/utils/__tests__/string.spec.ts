import { mockTFunction } from '../../fixtures';
import { caseToWords, getCountsString } from '../string';

describe('string', () => {
  describe('getCountsString', () => {
    it('should handle an empty count object', () => {
      const counts = {};
      const result = getCountsString(counts, mockTFunction);
      expect(result).toBe('');
    });

    it('should generate a counts string with one data type', () => {
      const counts = {
        apple: 5,
      };
      const result = getCountsString(counts, mockTFunction);
      expect(result).toBe('5 apples');
    });

    it('should generate a counts string with two data types', () => {
      const counts = {
        apple: 5,
        banana: 3,
      };
      const result = getCountsString(counts, mockTFunction);
      expect(result).toBe('5 apples and 3 bananas');
    });

    it('should generate a counts string with multiple data types', () => {
      const counts = {
        apple: 5,
        banana: 3,
        cherry: 8,
      };
      const result = getCountsString(counts, mockTFunction);
      expect(result).toBe('5 apples, 3 bananas, and 8 cherries');
    });

    it('should handle singular and plural forms correctly', () => {
      const counts = {
        apple: 1,
        banana: 2,
      };
      const result = getCountsString(counts, mockTFunction);
      expect(result).toBe('1 apple and 2 bananas');
    });
  });

  describe('caseToWords', () => {
    it('should convert camelCase to words', () => {
      const input = 'camelCaseExample';
      const result = caseToWords(input);
      expect(result).toBe('Camel Case Example');
    });

    it('should convert snake_case to words', () => {
      const input = 'snake_case_example';
      const result = caseToWords(input);
      expect(result).toBe('Snake Case Example');
    });

    it('should handle mixed case', () => {
      const input = 'mixedCamel_Snake_case';
      const result = caseToWords(input);
      expect(result).toBe('Mixed Camel Snake Case');
    });

    it('should handle consecutive uppercase letters', () => {
      const input = 'mixedCaseExampleWithConsecutiveCAPS';
      const result = caseToWords(input);
      expect(result).toBe('Mixed Case Example With Consecutive CAPS');
    });

    it('should handle leading and trailing underscores', () => {
      const input = '_leading_and_trailing_underscores_';
      const result = caseToWords(input);
      expect(result).toBe('Leading And Trailing Underscores');
    });
  });
});
