import { toFlatPropertyMap } from '../object';

describe('object', () => {
  describe('toFlatPropertyMap', () => {
    it('should flatten a simple nested object', () => {
      const nestedObject = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
          },
        },
      };

      const expectedFlatMap = {
        a: 1,
        'b.c': 2,
        'b.d.e': 3,
      };

      expect(toFlatPropertyMap(nestedObject)).toEqual(expectedFlatMap);
    });

    it('should use the specified key separator', () => {
      const nestedObject = {
        a: 1,
        b: {
          c: 2,
        },
      };

      const expectedFlatMap = {
        a: 1,
        'b-c': 2, // Using a hyphen as the key separator
      };

      expect(toFlatPropertyMap(nestedObject, '-')).toEqual(expectedFlatMap);
    });

    it('should handle arrays as well', () => {
      const nestedObject = {
        a: 1,
        b: [2, 3, 4],
      };

      const expectedFlatMap = {
        a: 1,
        'b.0': 2,
        'b.1': 3,
        'b.2': 4,
      };

      expect(toFlatPropertyMap(nestedObject)).toEqual(expectedFlatMap);
    });
  });
});
