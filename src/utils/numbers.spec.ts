import {
  modulo,
  formatValueForDisplay,
  roundToSignificantDigits,
} from './numbers';

describe('modulo', () => {
  it('handles positive numbers', () => {
    expect(modulo(0, 128)).toBe(0);
    expect(modulo(64, 128)).toBe(64);
    expect(modulo(128, 128)).toBe(0);
    expect(modulo(130, 128)).toBe(2);
  });

  it('handles negative numbers', () => {
    expect(modulo(-64, 128)).toBe(64);
    expect(modulo(-128, 128)).toBe(0);
    expect(modulo(-130, 128)).toBe(126);
  });
});

describe('cogniteFunctions', () => {
  it('handles roundToSignificantDigits', () => {
    expect(roundToSignificantDigits(1.02, 2)).toBe(1);
    expect(roundToSignificantDigits(1.02, 3)).toBe(1.02);
    expect(roundToSignificantDigits(0.02, 2)).toBe(0.02);
    expect(roundToSignificantDigits(0.0000123456, 3)).toBe(0.0000123);
    expect(roundToSignificantDigits(10.000456789, 3)).toBe(10.0);
    expect(roundToSignificantDigits(0.123456, 3)).toBe(0.123);
    expect(roundToSignificantDigits(0.123567, 3)).toBe(0.124);
    expect(roundToSignificantDigits(0.000005655, 3)).toBe(0.00000566);
    expect(roundToSignificantDigits(15, 3)).toBe(15);
  });
});

describe('formatValueForDisplay', () => {
  it('sets correct amount of decimals', () => {
    expect(formatValueForDisplay(0, 1)).toBe('0');
    expect(formatValueForDisplay(1, 1)).toBe('1');
    expect(formatValueForDisplay(0.02, 2)).toBe('0.02');
    expect(formatValueForDisplay(1.02, 3)).toBe('1.02');
    expect(formatValueForDisplay(0.000001, 1)).toBe('0.000001');
  });

  it('handles NaN and undefined gracefully', () => {
    expect(formatValueForDisplay(undefined, 1)).toBe('-');
    expect(formatValueForDisplay(NaN, 2)).toBe('-');
  });
});
