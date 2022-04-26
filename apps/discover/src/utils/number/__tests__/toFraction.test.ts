import { toFraction } from '../toFraction';

describe('toFraction', () => {
  it('should convert number with decimals to fraction', () => {
    expect(toFraction(0)).toEqual('0');
    expect(toFraction(1)).toEqual('1');
    expect(toFraction(1.0)).toEqual('1');
    expect(toFraction(0.5)).toEqual('1/2');
    expect(toFraction(1.5)).toEqual('1 1/2');
    expect(toFraction(3.625)).toEqual('3 5/8');
    expect(toFraction('1.5')).toEqual('1 1/2');
    expect(toFraction('3.625')).toEqual('3 5/8');
  });
});
