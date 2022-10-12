import { isObjectEmpty } from '../compare';

describe('compare', () => {
  describe('isObjectEmpty', () => {
    test.each([
      [{}, true],
      [{ test: undefined }, true],
      [{ test: 'test' }, false],
      [{ test: 'test', value: true }, false],
      [{ test: 'test', value: false }, false],
      [{ test: {}, value: false }, false],
      [{ test: [], value: false }, false],
      [{ test: 'test', test2: undefined }, false],
      [{ test: {}, value: undefined }, true],
      [{ test: undefined, test2: undefined }, true],
      [{ test: {}, test2: undefined }, true],
      [{ test: [] }, true],
    ])('isObjectEmpty(%s, %s)', (object, expected) => {
      const result = isObjectEmpty(object);
      expect(result).toBe(expected);
    });
  });
});
