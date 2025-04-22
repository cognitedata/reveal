import { describe, expect, test } from 'vitest';
import { getColorMap, getOptions } from './colorMaps';
import { ColorMapType } from './ColorMapType';

const colorMapTypes = [
  ColorMapType.Terrain,
  ColorMapType.Rainbow,
  ColorMapType.RainbowReverse,
  ColorMapType.Seismic,
  ColorMapType.SeismicReverse,
  ColorMapType.GreyScale,
  ColorMapType.GreyScaleReverse
];

describe('colorMaps', () => {
  test('should have all color maps defined', () => {
    for (const colorMapType of colorMapTypes) {
      const colorMap = getColorMap(colorMapType);
      expect(colorMap).toBeDefined();
    }
  });
  test('should have all color maps as options', () => {
    const options = getOptions();
    expect(options).toStrictEqual(colorMapTypes);
  });
});
