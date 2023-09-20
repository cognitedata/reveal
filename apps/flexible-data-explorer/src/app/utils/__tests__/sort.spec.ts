import { sortObjectByNumberValue } from '../sort';

describe('sort', () => {
  describe('sortObjectByNumberValue', () => {
    it('should sort keys by numeric values in descending order', () => {
      const inputObject = {
        apple: 5,
        banana: 3,
        cherry: 8,
        date: 2,
      };

      const sortedKeys = sortObjectByNumberValue(inputObject);

      // The expected order is cherry (8), apple (5), banana (3), date (2)
      expect(sortedKeys).toEqual(['cherry', 'apple', 'banana', 'date']);
    });

    it('should handle negative numbers correctly', () => {
      const inputObject = {
        a: -5,
        b: 3,
        c: -2,
        d: 0,
      };

      const sortedKeys = sortObjectByNumberValue(inputObject);

      // The expected order is b (3), d (0), c (-2), a (-5)
      expect(sortedKeys).toEqual(['b', 'd', 'c', 'a']);
    });

    it('should handle objects with the same values', () => {
      const inputObject = {
        x: 1,
        y: 1,
        z: 1,
      };

      const sortedKeys = sortObjectByNumberValue(inputObject);

      // The order doesn't matter as they have the same value
      expect(sortedKeys).toContain('x');
      expect(sortedKeys).toContain('y');
      expect(sortedKeys).toContain('z');
    });
  });
});
