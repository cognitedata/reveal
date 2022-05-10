import { getConvertibleUnit } from '../getConvertibleUnit';

describe('getConvertibleUnit', () => {
  it('should be ok', () => {
    expect(getConvertibleUnit('m', 'ft')).toEqual('ft');
  });
  it('should handle fail ok', () => {
    expect(getConvertibleUnit('day', 'ft')).toEqual('day');
  });
});
