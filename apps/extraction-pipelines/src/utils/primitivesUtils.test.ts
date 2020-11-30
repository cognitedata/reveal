import { capitalizeWords, uppercaseFirstWord } from './primitivesUtils';

describe('Primitives Utils', () => {
  test('Converts "thisIsAField" to "This Is A Field"', () => {
    const res = capitalizeWords('thisIsAField');
    expect(res).toEqual('This Is A Field');
  });

  test('Converts "thisIsAField" to "This is a field', () => {
    const res = uppercaseFirstWord('thisIsAField');
    expect(res).toEqual('This is a field');
  });
});
