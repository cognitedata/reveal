import { modulo, formatNumberForDisplay } from './numbers';

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

describe('formatNumberForDisplay', () => {
  it('sets correct amount of decimals', () => {
    expect(formatNumberForDisplay(1, 0)).toBe('1');
    expect(formatNumberForDisplay(1.02, 2)).toBe('1.02');
    expect(formatNumberForDisplay(0.000001, 0)).toBe('0');
    expect(formatNumberForDisplay(0.000001, 6)).toBe('0.000001');
  });
});
