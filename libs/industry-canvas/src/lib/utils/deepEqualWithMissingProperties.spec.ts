// jest test
import { deepEqualWithMissingProperties } from './deepEqualWithMissingProperties';

describe('deepEqualWithMissingProperties', () => {
  it('should consider missing and undefined values as equal', () => {
    expect(
      deepEqualWithMissingProperties({ a: 1, b: undefined }, { a: 1 })
    ).toEqual(true);
  });
  it('should work with arrays of objects as well', () => {
    expect(
      deepEqualWithMissingProperties(
        [
          { a: 1, b: undefined },
          { foo: 'foo', bar: 'bar' },
        ],
        [
          { a: 1, b: undefined },
          { foo: 'foo', bar: 'bar', baz: undefined },
        ]
      )
    ).toEqual(true);
  });
  it('should not be equal when array of objects are different', () => {
    expect(
      deepEqualWithMissingProperties(
        [
          { a: 1, b: undefined },
          { foo: 'foo', bar: 'bar' },
        ],
        [
          { a: 1, b: undefined },
          { foo: 'foo', bar: 'bar', baz: 'baz' },
        ]
      )
    ).toEqual(false);
  });
  it('should not be equal when objects are different', () => {
    expect(
      deepEqualWithMissingProperties(
        { a: 1, b: undefined },
        { a: 1, b: 'cake' }
      )
    ).toEqual(false);
  });

  it('should work with nested objects as well', () => {
    expect(
      deepEqualWithMissingProperties(
        { a: 1, b: { c: [{ foo: 'foo', bar: undefined }], d: undefined } },
        { a: 1, b: { c: [{ foo: 'foo' }] } }
      )
    ).toEqual(true);
  });

  it('should work with primitive types as well', () => {
    expect(deepEqualWithMissingProperties('foo', 'foo')).toEqual(true);
  });
});
