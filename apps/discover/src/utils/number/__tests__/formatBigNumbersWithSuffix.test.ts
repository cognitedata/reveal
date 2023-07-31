import { formatBigNumbersWithSuffix } from '../formatBigNumbersWithSuffix';

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
