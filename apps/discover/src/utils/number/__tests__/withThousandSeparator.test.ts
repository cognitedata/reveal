import { withThousandSeparator } from '../withThousandSeparator';

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
