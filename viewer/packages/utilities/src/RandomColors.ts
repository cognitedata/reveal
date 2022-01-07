/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

/**
 * Utility class for creating reasonable visible colors. Mainly meant for use
 * in debugging.
 */
export class RandomColors {
  private static readonly _colors: Map<number, THREE.Color> = new Map();

  /**
   * Returns a color as a THREE.Color.
   * @param colorIndex
   * @returns
   */
  static color(colorIndex: number): THREE.Color {
    const color = RandomColors._colors.get(colorIndex);
    if (color !== undefined) {
      return color;
    }

    const newColor = RandomColors.generateRandomColor();
    RandomColors._colors.set(colorIndex, newColor);
    return newColor;
  }

  /**
   * Returns color as RGB components between 0 and 255.
   * @param colorIndex Return
   * @returns
   */
  static colorRGB(colorIndex: number): [number, number, number] {
    const c = RandomColors.color(colorIndex);
    return [Math.floor(c.r * 255), Math.floor(c.g * 255), Math.floor(c.b * 255)];
  }

  /**
   * Returns a color string suitable for usage in CSS styles.
   * @param colorIndex
   * @returns
   */
  static colorCSS(colorIndex: number): string {
    const [r, g, b] = RandomColors.colorRGB(colorIndex);
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Returns a random color with reasonable lightness and saturation
   * to make the color easily distinguishable from other colors.
   */
  static generateRandomColor(): THREE.Color {
    const hue = Math.random();
    const saturation = 0.4 + Math.random() * 0.6;
    const lightness = 0.3 + 0.4 * Math.random();
    return new THREE.Color().setHSL(hue, saturation, lightness);
  }
}
