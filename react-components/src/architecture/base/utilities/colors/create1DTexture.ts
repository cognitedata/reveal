/*!
 * Copyright 2024 Cognite AS
 */

import { DataTexture, type Color } from 'three';
import { BYTE_PR_COLOR, TEXTURE_1D_WIDTH, type ColorMap } from './ColorMap';
import { type Range1 } from '../geometry/Range1';

export function create1DTexture(colorMap: ColorMap): DataTexture {
  const rgbaArray = colorMap.createColors();
  return createDataTexture(rgbaArray);
}

export function create1DTextureWithContours(
  colorMap: ColorMap,
  range: Range1,
  increment: number,
  volume: number,
  solidColor?: Color
): DataTexture {
  const rgbaArray = colorMap.createColorsWithContours(range, increment, volume, solidColor);
  return createDataTexture(rgbaArray);
}

function createDataTexture(rgbaArray: Uint8Array): DataTexture {
  const width = rgbaArray.length / (TEXTURE_1D_WIDTH * BYTE_PR_COLOR);
  const texture = new DataTexture(rgbaArray, width, TEXTURE_1D_WIDTH);
  texture.needsUpdate = true;
  return texture;
}
