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

export enum TreeType {
  Octree = 0,
  KdTree = 1
}

export enum PointOpacityType {
  Fixed = 0,
  Attenuated = 1
}

export enum PointColorType {
  Rgb = 0,
  Color = 1,
  Depth = 2,
  Height = 3,
  Elevation = 3,
  Intensity = 4,
  IntensityGradient = 5,
  Lod = 6,
  LevelOfDetail = 6,
  PointIndex = 7,
  Classification = 8,
  ReturnNumber = 9,
  Source = 10,
  Normal = 11,
  Phong = 12,
  RgbHeight = 13,
  Composite = 50
}

export enum NormalFilteringMode {
  ABSOLUTE_NORMAL_FILTERING_MODE = 1,
  LESS_EQUAL_NORMAL_FILTERING_MODE = 2,
  GREATER_NORMAL_FILTERING_MODE = 3,
}

export enum PointCloudMixingMode {
  CHECKBOARD = 1,
  STRIPES = 2,
}
