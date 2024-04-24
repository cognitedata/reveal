/*!
 * Copyright 2024 Cognite AS
 */

import { DataTexture, RGBAFormat, type Color } from 'three';
import { BYTE_PR_COLOR, TEXTURE_1D_WIDTH, type ColorMap } from './ColorMap';
import { type Range1 } from '../geometry/Range1';

export function create1DTexture(colorMap: ColorMap): DataTexture {
  const rgbaArray = colorMap.create1DColors();
  return create1D(rgbaArray);
}

export function create1DContours(
  colorMap: ColorMap,
  range: Range1,
  increment: number,
  volume: number,
  solidColor?: Color
): DataTexture {
  const rgbaArray = colorMap.create1DContourColors(range, increment, volume, solidColor);
  return create1D(rgbaArray);
}

function create1D(rgbaArray: Uint8Array): DataTexture {
  return new DataTexture(
    rgbaArray,
    rgbaArray.length / (TEXTURE_1D_WIDTH * BYTE_PR_COLOR),
    TEXTURE_1D_WIDTH,
    RGBAFormat
  );
}
