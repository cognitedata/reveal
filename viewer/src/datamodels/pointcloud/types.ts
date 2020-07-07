/*!
 * Copyright 2020 Cognite AS
 */

import * as Potree from '@cognite/potree-core';

export enum PotreePointShape {
  Circle = Potree.PointShape.CIRCLE,
  Square = Potree.PointShape.SQUARE
}

export enum PotreePointColorType {
  Rgb = Potree.PointColorType.RGB,
  Depth = Potree.PointColorType.DEPTH,
  Height = Potree.PointColorType.HEIGHT,
  PointIndex = Potree.PointColorType.POINT_INDEX,
  LevelOfDetail = Potree.PointColorType.LOD,
  Classification = Potree.PointColorType.CLASSIFICATION,
  Intensity = Potree.PointColorType.INTENSITY
}

export enum PotreePointSizeType {
  Adaptive = Potree.PointSizeType.ADAPTIVE,
  Fixed = Potree.PointSizeType.FIXED
}
