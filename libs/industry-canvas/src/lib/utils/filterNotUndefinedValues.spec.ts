// jest test
import filterNotUndefinedValues from './filterNotUndefinedValues';

describe('filterNotUndefinedValues', () => {
  it('should filter out undefined values', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: 3,
    };
    const result = filterNotUndefinedValues(obj);
    expect(Object.values(result)).toEqual([1, 3]);

    // For some reason this passes both with and without the `b` entry
    // expect(result).toEqual({
    //   a: 1,
    //   b: undefined,
    //   c: 3,
    // });
  });
});
