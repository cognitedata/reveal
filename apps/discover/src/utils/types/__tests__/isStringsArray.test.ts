import { isStringsArray } from '../isStringsArray';

describe('isStringsArray', () => {
  describe('bad', () => {
    test('empty', () => {
      // @ts-expect-error testing against bad types
      expect(isStringsArray()).toEqual(false);
    });
    test('none', () => {
      expect(isStringsArray([])).toEqual(false);
    });
    test('mixed', () => {
      expect(isStringsArray(['test', 1, 'test2'])).toEqual(false);
    });
  });
  describe('good', () => {
    test('one', () => {
      expect(isStringsArray(['test'])).toEqual(true);
    });
    test('many', () => {
      expect(isStringsArray(['test', 'test2'])).toEqual(true);
    });
  });
});
