/*!
 * Copyright 2022 Cognite AS
 */
import { RandomColors } from './RandomColors';

describe(RandomColors.name, () => {
  test('color() returns same color for same input', () => {
    const color1 = RandomColors.color(42);
    const color2 = RandomColors.color(42);
    expect(color1).toEqual(color2);
  });

  test('colorRGB() returns components in range [0, 255]', () => {
    for (let i = 0; i < 1000; i++) {
      const [r, g, b] = RandomColors.colorRGB(i);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(255);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    }
  });

  test('colorCSS() returns valid color', () => {
    function isValidColor(colorString: string) {
      // https://stackoverflow.com/a/48485007
      const s = new Option().style;
      s.color = colorString;
      return s.color === colorString;
    }
    for (let i = 0; i < 1000; i++) {
      const cssString = RandomColors.colorCSS(i);
      expect(cssString).toSatisfy(isValidColor);
    }
  });

  test('generateColor() returns new color every call', () => {
    const color1 = RandomColors.generateRandomColor();
    const color2 = RandomColors.generateRandomColor();
    expect(color1).not.toEqual(color2);
  });
});
