import { getLineNumberAndUnitFromText } from '..';

const validLineNumbers = ['L132', 'IP132', 'UT001', 'UL456'];

const notLineNumbers = [
  'L1',
  'L25',
  'A123',
  'N620',
  'MF_26',
  'ACCUM. 95-NH09 BOOT OUTLET',
];

describe('Line numbers are correctly identified', () => {
  test('Finds standalone line numbers', () => {
    const matchedLineNumbers = validLineNumbers.map(
      (lineNumber) => getLineNumberAndUnitFromText(lineNumber).lineNumber
    );

    expect(matchedLineNumbers).toEqual(validLineNumbers);
  });

  test('Finds line numbers in strings that also contain other info', () => {
    const stringWithLineNumbers = [
      'G001-L132',
      'L132-15CSTL-HC1-2',
      'G0207-L055-15CSTL-HC1-3',
    ];

    const expectedMatches = ['L132', 'L132', 'L055'];

    const matchedLineNumbers = stringWithLineNumbers.map(
      (text) => getLineNumberAndUnitFromText(text).lineNumber
    );

    expect(matchedLineNumbers).toEqual(expectedMatches);
  });

  test('Does not match any invalid line numbers', () => {
    const matchedLineNumbers = notLineNumbers.filter(
      (lineNumber) => getLineNumberAndUnitFromText(lineNumber).lineNumber
    );

    expect(matchedLineNumbers).toEqual([]);
  });
});
