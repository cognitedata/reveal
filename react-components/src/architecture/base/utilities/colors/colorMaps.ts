import { ColorInterpolation } from './ColorInterpolation';
import { ColorMap } from './ColorMap';
import { Color } from 'three';
import { ColorMapType } from './ColorMapType';
import { getColorFromBytes as getFromBytes } from './colorExtensions';

let colorMaps: Map<ColorMapType, ColorMap> | undefined; // Act as a singleton

// ==================================================
// PUBLIC FUNCTIONS:
// ==================================================

export function getColorMap(colorMapType: ColorMapType): ColorMap | undefined {
  const colorMaps = getColorMaps();
  return colorMaps.get(colorMapType);
}

export function getOptions(): ColorMapType[] {
  const colorMaps = getColorMaps();
  return Array.from(colorMaps.keys());
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function getColorMaps(): Map<ColorMapType, ColorMap> {
  if (colorMaps === undefined) {
    colorMaps = createColorMaps();
  }
  return colorMaps;
}

function createColorMaps(): Map<ColorMapType, ColorMap> {
  const map = new Map<ColorMapType, ColorMap>();
  add(map, createTerrain());
  add(map, createRainbow(false));
  add(map, createRainbow(true));
  add(map, createSeismic(false));
  add(map, createSeismic(true));
  add(map, createGreyScale(false));
  add(map, createGreyScale(true));
  return map;

  function add(map: Map<ColorMapType, ColorMap>, colorMap: ColorMap): void {
    map.set(colorMap.colorMapType, colorMap);
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Create various color maps
// ==================================================

function createSeismic(reverse: boolean): ColorMap {
  const colorMap = new ColorMap();
  const a = 0.2;
  const b = 0.25;

  const interpolation = ColorInterpolation.Rgb;

  colorMap.add(getFromBytes(161, 255, 255), 0, interpolation);
  colorMap.add(getFromBytes(0, 0, 191), a, interpolation);
  colorMap.add(getFromBytes(77, 77, 77), b, interpolation);
  colorMap.add(getFromBytes(204, 204, 204), 0.5, interpolation);
  colorMap.add(getFromBytes(97, 69, 0), 1 - b, interpolation);
  colorMap.add(getFromBytes(191, 0, 0), 1 - a, interpolation);
  colorMap.add(new Color(Color.NAMES.yellow), 1, interpolation);
  colorMap.colorMapType = reverse ? ColorMapType.SeismicReverse : ColorMapType.Seismic;
  if (reverse) {
    colorMap.reverse();
  }
  return colorMap;
}

function createRainbow(reverse: boolean): ColorMap {
  const colorMap = new ColorMap();
  const interpolation = ColorInterpolation.HslLong;
  colorMap.add(new Color(Color.NAMES.magenta), 0, interpolation);
  colorMap.add(new Color(Color.NAMES.red), 1, interpolation);
  colorMap.colorMapType = reverse ? ColorMapType.RainbowReverse : ColorMapType.Rainbow;
  if (reverse) {
    colorMap.reverse();
  }
  return colorMap;
}

function createGreyScale(reverse: boolean): ColorMap {
  const colorMap = new ColorMap();
  const interpolation = ColorInterpolation.HslLong;
  colorMap.add(new Color(Color.NAMES.white), 0, interpolation);
  colorMap.add(new Color(Color.NAMES.black), 1, interpolation);
  colorMap.colorMapType = reverse ? ColorMapType.GreyScaleReverse : ColorMapType.GreyScale;
  if (reverse) {
    colorMap.reverse();
  }
  return colorMap;
}

function createTerrain(): ColorMap {
  const colorMap = new ColorMap();
  const interpolation = ColorInterpolation.Rgb;
  colorMap.add(new Color(Color.NAMES.white), 0, interpolation);
  colorMap.add(getFromBytes(168, 144, 140), 0.2, interpolation); // brown
  colorMap.add(getFromBytes(255, 255, 150), 0.4, interpolation); // Yellow
  colorMap.add(getFromBytes(87, 221, 119), 0.6, interpolation); // green
  colorMap.add(getFromBytes(0, 147, 255), 0.8, interpolation); // blue
  colorMap.add(getFromBytes(50, 50, 156), 1, interpolation); // Dark blue
  colorMap.colorMapType = ColorMapType.Terrain;
  colorMap.reverse();
  return colorMap;
}
