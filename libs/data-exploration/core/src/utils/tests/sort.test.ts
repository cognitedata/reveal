import { sortAlphanumeric } from '../sort';

describe('sort', () => {
  describe('sortAlphanumeric', () => {
    it('Should sort numeric values correctly', () => {
      expect(sortAlphanumeric('10', '5')).toBe(5);
      expect(sortAlphanumeric('5', '10')).toBe(-5);
      expect(sortAlphanumeric('0', '0')).toBe(0);
    });

    it('Should place numbers before non-numeric values', () => {
      expect(sortAlphanumeric('5', 'String')).toBe(-1);
      expect(sortAlphanumeric('String', '5')).toBe(1);
    });

    it('Should sort non-numeric values alphabetically', () => {
      expect(sortAlphanumeric('Apple', 'Banana')).toBe(-1);
      expect(sortAlphanumeric('Banana', 'Apple')).toBe(1);
      expect(sortAlphanumeric('Banana', 'Banana')).toBe(0);
    });

    it('Should handle negative numeric values', () => {
      expect(sortAlphanumeric('-5', '5')).toBe(-10);
      expect(sortAlphanumeric('5', '-5')).toBe(10);
      expect(sortAlphanumeric('-5', 'String')).toBe(-1);
      expect(sortAlphanumeric('String', '-5')).toBe(1);
    });

    it('should sort correctly', () => {
      const unsortedArray = ['0', 'Float32', '-1', '5', 'ABC', '10', '5'];
      const sortedArray = ['-1', '0', '5', '5', '10', 'ABC', 'Float32'];
      expect(unsortedArray.sort(sortAlphanumeric)).toStrictEqual(sortedArray);
    });
  });
});
