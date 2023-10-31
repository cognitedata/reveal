import { isObjectEmpty, toFlatPropertyMap } from '../object';

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

  describe('isObjectEmpty', () => {
    it('should return true for an empty object', () => {
      expect(isObjectEmpty({})).toBe(true);
    });

    it('should return true for an undefined object', () => {
      expect(isObjectEmpty(undefined)).toBe(true);
    });

    it('should return true for an object with all empty properties', () => {
      expect(isObjectEmpty({ prop1: undefined, prop2: null, prop3: {} })).toBe(
        true
      );
    });

    it('should return false for an object with non-empty properties', () => {
      expect(isObjectEmpty({ prop1: 42, prop2: 'Hello' })).toBe(false);
    });

    it('should return true for an empty object (type checking)', () => {
      const obj: Record<string, unknown> = {};
      expect(isObjectEmpty(obj)).toBe(true);
    });

    it('should return true for an undefined object (type checking)', () => {
      const obj: Record<string, unknown> | undefined = undefined;
      expect(isObjectEmpty(obj)).toBe(true);
    });
  });
});
