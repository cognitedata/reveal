/*!
 * Adapted from pnext/three-loader (https://github.com/pnext/three-loader)
 */
export enum PointSizeType {
  Fixed = 0,
  Attenuated = 1,
  Adaptive = 2
}

export enum PointShape {
  Square = 0,
  Circle = 1,
  Paraboloid = 2
}

export enum PointColorType {
  Rgb = 0,
  Depth = 2,
  Height = 3,
  Elevation = 3,
  Intensity = 4,
  Lod = 6,
  LevelOfDetail = 6,
  PointIndex = 7,
  Classification = 8
}
