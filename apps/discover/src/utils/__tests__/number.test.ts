import {
  withThousandSeparator,
  formatBigNumbersWithSuffix,
  getHumanReadableFileSize,
} from '../number';

describe('number', () => {
  describe('formatBigNumbersWithSuffix', () => {
    test('0', () => {
      expect(formatBigNumbersWithSuffix(0)).toEqual(0);
    });
    test('huge number', () => {
      expect(formatBigNumbersWithSuffix(1231231293870)).toEqual('1231231.3M+');
    });
    test('millions', () => {
      expect(formatBigNumbersWithSuffix(1357621)).toEqual('1.4M+');
    });
    test('thousands', () => {
      expect(formatBigNumbersWithSuffix(10332)).toEqual('10.3K+');
    });
    test('decimal case', () => {
      expect(formatBigNumbersWithSuffix(12300.345111)).toEqual('12.3K+');
    });
  });
  describe('withThousandSeparator', () => {
    test('0', () => {
      expect(withThousandSeparator(0)).toEqual('0');
    });
    test('simple case', () => {
      expect(withThousandSeparator(1000)).toEqual('1 000');
    });
    test('other separators', () => {
      expect(withThousandSeparator(1000, ',')).toEqual('1,000');
    });
    it('should work with biig numbers', () => {
      expect(withThousandSeparator(12345678998765432, ',')).toEqual(
        '12,345,678,998,765,432'
      );
    });
  });

  describe('getHumanReadableFileSize', () => {
    test.each`
      input           | expectedResult
      ${0}            | ${'Unknown'}
      ${1024}         | ${'1.00 KB'}
      ${34}           | ${'34 Bytes'}
      ${342543123}    | ${'326.67 MB'}
      ${2147483648}   | ${'2.00 GB'}
      ${'1024'}       | ${'1.00 KB'}
      ${'342543123'}  | ${'326.67 MB'}
      ${'2147483648'} | ${'2.00 GB'}
      ${'malformed'}  | ${'Unknown'}
      ${''}           | ${'Unknown'}
      ${null}         | ${'Unknown'}
      ${undefined}    | ${'Unknown'}
    `(
      'get HumanReadable FileSize for $input toBe $expectedResult',
      ({ input, expectedResult }) => {
        const size = getHumanReadableFileSize(input);
        expect(size).toEqual(expectedResult);
      }
    );
  });
});
