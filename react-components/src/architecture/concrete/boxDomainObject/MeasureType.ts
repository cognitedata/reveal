/*!
 * Copyright 2024 Cognite AS
 */

export enum MeasureType {
  Line,
  Polyline,
  Polygon,
  HorizontalArea,
  VerticalArea,
  Volume
}

export function getIconByMeasureType(measureType: MeasureType): string {
  switch (measureType) {
    case MeasureType.Line:
      return 'VectorLine';
    case MeasureType.Polyline:
      return 'VectorZigzag';
    case MeasureType.Polygon:
      return 'Polygon';
    case MeasureType.HorizontalArea:
      return 'FrameTool';
    case MeasureType.VerticalArea:
      return 'Perspective';
    case MeasureType.Volume:
      return 'Cube';
    default:
      throw new Error('Unknown MeasureType type');
  }
}

export function getNameByMeasureType(measureType: MeasureType): string {
  switch (measureType) {
    case MeasureType.Line:
      return 'Line';
    case MeasureType.Polyline:
      return 'Polyline';
    case MeasureType.Polygon:
      return 'Polygon';
    case MeasureType.HorizontalArea:
      return 'Horizontal area';
    case MeasureType.VerticalArea:
      return 'Vertical area';
    case MeasureType.Volume:
      return 'Volume';
    default:
      throw new Error('Unknown MeasureType type');
  }
}
