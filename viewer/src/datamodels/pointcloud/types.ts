/*!
 * Copyright 2020 Cognite AS
 */

import * as Potree from '@cognite/potree-core';

export enum PotreePointShape {
  Circle = Potree.PointShape.CIRCLE,
  Square = Potree.PointShape.SQUARE
}

export enum PotreePointColorType {
  /** Describes the observed real-world color of a point. */
  Rgb = Potree.PointColorType.RGB,

  /** Shows the distance from current camera with color gradient */
  Depth = Potree.PointColorType.DEPTH,

  /** Height, or elevation, mapped to a color with a gradient. */
  Height = Potree.PointColorType.HEIGHT,

  /** Specifies the order in which points were captured from a single beam. */
  PointIndex = Potree.PointColorType.POINT_INDEX,

  /**
   * Calculated during rendering.
   * It is equal to the level of the most detailed visible node in a region
   */
  LevelOfDetail = Potree.PointColorType.LOD,

  /**
   * Indicates whether a point is part of some class of objects.
   * Classes are mapped to colors.
   */
  Classification = Potree.PointColorType.CLASSIFICATION,

  /** Indicates the strength of the backscattered signal in a laser scan. */
  Intensity = Potree.PointColorType.INTENSITY
}

export enum PotreePointSizeType {
  Adaptive = Potree.PointSizeType.ADAPTIVE,
  Fixed = Potree.PointSizeType.FIXED
}
