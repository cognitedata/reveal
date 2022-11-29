import {
  withThousandSeparator,
  formatBigNumbersWithSuffix,
  withThousandSeparatorStringExtended,
  formatBigNumbersWithSuffixStringExtended,
} from '../numbers';
import { UNIT_SEPARATOR } from '../constants';

describe('withThousandSeparator', () => {
  test('0', () => {
    expect(withThousandSeparator(0)).toEqual('0');
  });
  test('simple case', () => {
    expect(withThousandSeparator(1000)).toEqual(`1${UNIT_SEPARATOR}000`);
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

describe('withThousandSeparatorStringExtended', () => {
  it('should return value as is if it is a preformatted string', () => {
    expect(withThousandSeparatorStringExtended('1000+')).toEqual('1000+');
  });
});

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
  test('clears 0 after dot', () => {
    expect(formatBigNumbersWithSuffix(123001)).toEqual('123K+');
  });
});

describe('formatBigNumbersWithSuffixStringExtended', () => {
  it('should return value as is if it is a preformatted string', () => {
    expect(formatBigNumbersWithSuffixStringExtended('1K+')).toEqual('1K+');
  });
});
