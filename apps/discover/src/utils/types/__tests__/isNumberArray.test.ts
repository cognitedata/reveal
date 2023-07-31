import { isNumberArray } from '../isNumberArray';

describe('isNumberArray', () => {
  describe('bad', () => {
    test('empty', () => {
      // @ts-expect-error testing against bad types
      expect(isNumberArray()).toEqual(false);
    });
    test('none', () => {
      expect(isNumberArray([])).toEqual(false);
    });
    test('mixed', () => {
      expect(isNumberArray(['test', 1, 'test2'])).toEqual(false);
    });
  });
  describe('good', () => {
    test('zero', () => {
      expect(isNumberArray([0])).toEqual(true);
    });
    test('one', () => {
      expect(isNumberArray([1])).toEqual(true);
    });
    test('many', () => {
      expect(isNumberArray([1, 2])).toEqual(true);
    });
  });
});
