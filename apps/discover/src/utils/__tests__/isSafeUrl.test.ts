import { isSafeUrl } from '../url';

const cases: [string, boolean][] = [
  ['http://safe.http.url/should.return.true', true],
  ['https://safe.https.url/should.return.true', true],
  ['unsafe.url/contains.http.in.middle/should.return.false', false],
  ['unsafe.url/contains.https.in.middle/should.return.false', false],
  ['unsafe.url/should.return.false', false],
  ['', false],
];

describe('Should check if a safe url correctly', () => {
  test.each(cases)(
    'given %p as argument, returns %p',
    (input, expectedResult) => {
      const result = isSafeUrl(input);
      expect(result).toEqual(expectedResult);
    }
  );
});
