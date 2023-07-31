import { isNumberTuple } from '../isNumberTuple';

describe('isNumberTuple', () => {
  describe('bad', () => {
    test('empty', () => {
      // @ts-expect-error testing against bad types
      expect(isNumberTuple()).toEqual(false);
    });
    test('none', () => {
      expect(isNumberTuple([])).toEqual(false);
    });
    test('mixed', () => {
      expect(isNumberTuple(['test', 1, 'test2'])).toEqual(false);
    });
    test('single', () => {
      expect(isNumberTuple([0])).toEqual(false);
    });
  });
  describe('good', () => {
    test('only good case', () => {
      expect(isNumberTuple([1, 2])).toEqual(true);
    });
  });
});
