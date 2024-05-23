/*!
 * Copyright 2024 Cognite AS
 */

import { type Tooltip } from '../../base/commands/BaseCommand';

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

export function getTooltipByMeasureType(measureType: MeasureType): Tooltip {
  switch (measureType) {
    case MeasureType.Line:
      return {
        key: 'MEASUREMENTS_ADD_LINE',
        fallback: 'Measure distance between two points. Click at the start point and the end point.'
      };
    case MeasureType.Polyline:
      return {
        key: 'MEASUREMENTS_ADD_POLYLINE',
        fallback:
          'Measure the length of a continuous polyline. Click at any number of points and end with Esc.'
      };
    case MeasureType.Polygon:
      return {
        key: 'MEASUREMENTS_ADD_POLYGON',
        fallback: 'Measure an area of a polygon. Click at least 3 points and end with Esc.'
      };
    case MeasureType.VerticalArea:
      return {
        key: 'MEASUREMENTS_ADD_VERTICAL_AREA',
        fallback: 'Measure rectangular vertical Area. Click at two points in a vertical plan.'
      };
    case MeasureType.HorizontalArea:
      return {
        key: 'MEASUREMENTS_ADD_HORIZONTAL_AREA',
        fallback: 'Measure rectangular horizontal Area. Click at three points in a horizontal plan.'
      };
    case MeasureType.Volume:
      return {
        key: 'MEASUREMENTS_ADD_VOLUME',
        fallback:
          'Measure volume of a box. Click at three points in a horizontal plan and the fourth to give it height.'
      };
    default:
      throw new Error('Unknown MeasureType type');
  }
}
