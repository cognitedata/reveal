import {
  capitalizeWords,
  toCamelCase,
  splitWordsLowerCase,
  uppercaseFirstWord,
  isUrl,
} from './primitivesUtils';

describe('Primitives Utils', () => {
  test('Converts "thisIsAField" to "This Is A Field"', () => {
    const res = capitalizeWords('thisIsAField');
    expect(res).toEqual('This Is A Field');
  });

  test('Converts "thisIsAField" to "This is a field', () => {
    const res = uppercaseFirstWord('thisIsAField');
    expect(res).toEqual('This is a field');
  });

  test('Converts "thisIsAField" to "this is a field', () => {
    const res = splitWordsLowerCase('thisIsAField');
    expect(res).toEqual('this is a field');
  });
});

describe('toCamelCase', () => {
  test('Converts to camelcase', () => {
    const res = toCamelCase('source system');
    expect(res).toEqual('sourceSystem');
  });
});
describe('isUrl', () => {
  const cases = [
    {
      text: 'this is not a url',
      expected: false,
    },
    {
      text: 'www.test.no',
      expected: false,
    },
    {
      text: 'http://test.test.no',
      expected: true,
    },
    {
      text: 'https://fuction.cognite.com',
      expected: true,
    },
    {
      text: 'https://docs.cognite.com',
      expected: true,
    },
  ];
  cases.forEach(({ text, expected }) => {
    test(`"${text}" is url: ${expected}`, () => {
      expect(isUrl(text)).toEqual(expected);
    });
  });
});
