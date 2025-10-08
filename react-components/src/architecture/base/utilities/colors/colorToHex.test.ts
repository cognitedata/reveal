import { describe, expect, test } from 'vitest';
import { colorToHex } from './colorToHex';
import { Color } from 'three';

describe(colorToHex.name, () => {
  test('should convert solid yellow to hex', () => {
    const yellow = new Color(1, 1, 0);
    const hexCode = colorToHex(yellow);
    expect(hexCode).toBe('#FFFF00FF');
  });

  test('should convert semi transparent yellow to hex', () => {
    const yellow = new Color(1, 1, 0);
    const hexCode = colorToHex(yellow, 0.25);
    expect(hexCode).toBe('#FFFF0040');
  });

  test('should convert transparent yellow to hex', () => {
    const yellow = new Color(1, 1, 0);
    const hexCode = colorToHex(yellow, 0.0);
    expect(hexCode).toBe('#FFFF0000');
  });
});
