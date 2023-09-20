import { formatBigNumbersWithSuffix, formatNumber, isNumeric } from '../number';

describe('number', () => {
  describe('isNumeric', () => {
    it('should return true for valid numeric strings', () => {
      const validNumericStrings = ['123', '-456', '0', '123.45'];
      validNumericStrings.forEach((value) => {
        expect(isNumeric(value)).toBe(true);
      });
    });

    it('should return false for invalid non-numeric strings', () => {
      const invalidNonNumericStrings = ['abc', '12abc', '123.abc', '123.45.67'];
      invalidNonNumericStrings.forEach((value) => {
        expect(isNumeric(value)).toBe(false);
      });
    });
  });

  describe('formatBigNumbersWithSuffix', () => {
    it('should return undefined for undefined input', () => {
      expect(formatBigNumbersWithSuffix(undefined)).toBeUndefined();
    });

    it('should format numbers greater than 1 million with "M+" suffix', () => {
      expect(formatBigNumbersWithSuffix(1500000)).toBe('1.5M+');
      expect(formatBigNumbersWithSuffix(3000000)).toBe('3M+');
    });

    it('should format numbers greater than 10 thousand with "K+" suffix', () => {
      expect(formatBigNumbersWithSuffix(15000)).toBe('15K+');
      expect(formatBigNumbersWithSuffix(25000)).toBe('25K+');
    });

    it('should format numbers below 10 thousand as is', () => {
      expect(formatBigNumbersWithSuffix(5000)).toBe('5000');
      expect(formatBigNumbersWithSuffix(9999)).toBe('9999');
    });
  });

  describe('formatNumber', () => {
    it('should format a positive number', () => {
      expect(formatNumber(12345)).toBe('12,345');
    });

    it('should format a negative number', () => {
      expect(formatNumber(-54321)).toBe('-54,321');
    });

    it('should format zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should return undefined for undefined input', () => {
      expect(formatNumber(undefined)).toBeUndefined();
    });

    it('should return undefined for null input', () => {
      expect(formatNumber(null as unknown as number)).toBeUndefined();
    });

    // You can add more test cases with different input values
  });
});
