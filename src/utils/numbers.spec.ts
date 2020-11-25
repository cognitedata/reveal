import { modulo } from './numbers';

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
