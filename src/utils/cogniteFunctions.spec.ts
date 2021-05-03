import { roundToSignificantDigits } from './cogniteFunctions';

describe('cogniteFunctions', () => {
  it('handles roundToSignificantDigits', () => {
    expect(roundToSignificantDigits(0.0000123456, 3)).toBe(0.0000123);
    expect(roundToSignificantDigits(10.000456789, 3)).toBe(10.000457);
    expect(roundToSignificantDigits(0.123456, 3)).toBe(0.123);
    expect(roundToSignificantDigits(0.123567, 3)).toBe(0.124);
    expect(roundToSignificantDigits(0.000005655, 3)).toBe(0.00000566);
    expect(roundToSignificantDigits(15, 3)).toBe(15);
  });
});
