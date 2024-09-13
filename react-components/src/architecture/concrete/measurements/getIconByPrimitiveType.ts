/*!
 * Copyright 2024 Cognite AS
 */

import { PrimitiveType } from '../primitives/common/PrimitiveType';

export function getIconByPrimitiveType(primitiveType: PrimitiveType): string {
  switch (primitiveType) {
    case PrimitiveType.Line:
      return 'VectorLine';
    case PrimitiveType.Polyline:
      return 'VectorZigzag';
    case PrimitiveType.Polygon:
      return 'Polygon';
    case PrimitiveType.PlaneX:
      return 'CubeFrontLeft';
    case PrimitiveType.PlaneY:
      return 'CubeFrontRight';
    case PrimitiveType.PlaneZ:
      return 'CubeTop';
    case PrimitiveType.PlaneXY:
      return 'Perspective';
    case PrimitiveType.HorizontalArea:
      return 'FrameTool'; // TODO: Change to 'PerspectiveAlt' when new version of Cogs
    case PrimitiveType.VerticalArea:
      return 'Perspective';
    case PrimitiveType.Box:
      return 'Cube';
    case PrimitiveType.Cylinder:
      return 'DataSource';
    case PrimitiveType.None:
      return 'Edit';
    default:
      throw new Error('Unknown PrimitiveType');
  }
}
