import { formatNumberWithSuffix } from './utils';

describe('formatNumberWithSuffix', () => {
  it('formats thousands', () => {
    expect(formatNumberWithSuffix(10100, 1)).toBe('10.1k');
    expect(formatNumberWithSuffix(9999, 2)).toBe('10k'); // Rounding scenario
    expect(formatNumberWithSuffix(-1000, 0)).toBe('-1k');
  });

  it('formats millions', () => {
    expect(formatNumberWithSuffix(1500000, 2)).toBe('1.5m');
    expect(formatNumberWithSuffix(2000000, 1)).toBe('2m');
    expect(formatNumberWithSuffix(-1234567, 3)).toBe('-1.235m'); // Rounding scenario
  });

  it('formats billions', () => {
    expect(formatNumberWithSuffix(1500000000, 2)).toBe('1.5b');
    expect(formatNumberWithSuffix(2000000000, 1)).toBe('2b');
    expect(formatNumberWithSuffix(-1234567890, 3)).toBe('-1.235b'); // Rounding scenario
  });

  it('formats numbers less than thousand', () => {
    expect(formatNumberWithSuffix(100, 0)).toBe('100');
    expect(formatNumberWithSuffix(999, 2)).toBe('999');
    expect(formatNumberWithSuffix(-12.345, 3)).toBe('-12.345');
  });

  test('formats small numbers', () => {
    expect(formatNumberWithSuffix(0.04, 2)).toBe('0.04');
    expect(formatNumberWithSuffix(0.0004, 4)).toBe('0.0004');
    expect(formatNumberWithSuffix(-0.04, 2)).toBe('-0.04');
    expect(formatNumberWithSuffix(-0.0004, 4)).toBe('-0.0004');
  });

  test('does not return trailing zeros', () => {
    expect(formatNumberWithSuffix(20000, 1)).toBe('20k');
  });
});
