import { mergeUniqueArray } from 'utils/merge';

describe('merge', () => {
  describe('mergeUnique', () => {
    it('merges two objects correctly', () => {
      const result = mergeUniqueArray(
        { a: ['a', 'b'] },
        { a: ['c'], b: 'test' }
      );

      expect(result).toMatchObject({
        a: ['a', 'b', 'c'],
        b: 'test',
      });
    });

    it('merges two object and keeps items unique', () => {
      const result = mergeUniqueArray(
        { a: ['a', 'b'], b: 5 },
        { a: ['a', 'c'], b: 6 }
      );

      expect(result).toMatchObject({ a: ['a', 'b', 'c'], b: 6 });
    });

    it('merges two objects', () => {
      const result = mergeUniqueArray({ a: [1, 2] }, { a: [2, 3] });

      expect(result).toMatchObject({ a: [1, 2, 3] });
    });

    it('keeps source value if target is undefined', () => {
      const result = mergeUniqueArray({ a: 1 }, undefined);

      expect(result).toMatchObject({ a: 1 });
    });
  });
});
