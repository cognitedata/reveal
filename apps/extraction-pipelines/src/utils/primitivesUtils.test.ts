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
    {
      text:
        'https://adf.azure.com/en-us/authoring/pipeline/Common_Comos_To_Cdf_StandardTable_Pipeline?factory=%2Fsubscriptions%5k4h5kjh54-71a6-4555-990c-k5l45jl45jl45jl54%2FresourceGroups%2Frg-CDFIH-dev%2Fproviders%2FMicrosoft.DataFactory%2Ffactories%2Fdf-cdfih-dev',
      expected: true,
    },
    {
      text:
        'https://docs.cognite.com/cdf/integration/guides/extraction/changelog/pi_extractor_changelog.html',
      expected: true,
    },
  ];
  cases.forEach(({ text, expected }) => {
    test(`"${text}" is url: ${expected}`, () => {
      expect(isUrl(text)).toEqual(expected);
    });
  });
});
