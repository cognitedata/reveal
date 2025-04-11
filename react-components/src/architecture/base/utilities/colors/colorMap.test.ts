import { describe, expect, test } from 'vitest';
import { getColorMap } from './colorMaps';
import { ColorMapType } from './ColorMapType';
import assert from 'assert';
import { getColorFromBytes } from './colorExtensions';
import { BYTE_PR_COLOR, ColorMap, TEXTURE_1D_WIDTH } from './ColorMap';
import { Range1 } from '../geometry/Range1';

describe(ColorMap.name, () => {
  test('should have all colors different', () => {
    const colorMap = getColorMap(ColorMapType.Terrain);
    expect(colorMap).toBeDefined();
    assert(colorMap !== undefined);

    let prevColor = colorMap.getColor(0);
    const inc = 0.1;
    for (let fraction = inc; fraction <= 1; fraction += inc) {
      const color = colorMap.getColor(fraction);
      expect(color).toBeDefined();
      expect(prevColor.equals(color)).toBe(false);
      prevColor = color;
    }
  });

  test('should check that createColors returns different colors', () => {
    const colorMap = getColorMap(ColorMapType.Terrain);
    expect(colorMap).toBeDefined();
    assert(colorMap !== undefined);

    const colorCount = 100;
    const colors = colorMap.createColors(colorCount);
    expect(colors.length).toBe(colorCount * TEXTURE_1D_WIDTH * BYTE_PR_COLOR);

    let i = 0;
    let prevColor = getColorFromBytes(colors[i++], colors[i++], colors[i++]);
    i++; // skip alpha
    for (let colorIndex = 1; colorIndex < colorCount; colorIndex++) {
      const color = getColorFromBytes(colors[i++], colors[i++], colors[i++]);
      expect(prevColor.equals(color)).toBe(false);
      prevColor = color;
      i++; // skip alpha
    }
  });

  test('should test createColorsWithContours returns different colors', () => {
    const colorMap = getColorMap(ColorMapType.Terrain);
    expect(colorMap).toBeDefined();
    assert(colorMap !== undefined);

    const colorCount = 100;
    const colors = colorMap.createColorsWithContours(
      new Range1(100, 200),
      25,
      0.5,
      undefined,
      colorCount
    );
    expect(colors.length).toBe(colorCount * TEXTURE_1D_WIDTH * BYTE_PR_COLOR);

    let i = 0;
    let prevColor = getColorFromBytes(colors[i++], colors[i++], colors[i++]);
    i++; // skip alpha
    for (let colorIndex = 1; colorIndex < colorCount; colorIndex++) {
      const color = getColorFromBytes(colors[i++], colors[i++], colors[i++]);
      expect(prevColor.equals(color)).toBe(false);
      prevColor = color;
      i++; // skip alpha
    }
  });
});
