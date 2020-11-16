import { upperCamelCase } from './primitivesUtils';

describe('Primitives Utils', () => {
  test('Converts "thisIsAField" to "This is a field', () => {
    const res = upperCamelCase('thisIsAField');
    expect(res).toEqual('This Is A Field');
  });
});
