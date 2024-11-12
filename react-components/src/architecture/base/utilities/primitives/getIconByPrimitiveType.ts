/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../IconName';
import { PrimitiveType } from './PrimitiveType';

export function getIconByPrimitiveType(primitiveType: PrimitiveType): IconName {
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
      return 'PerspectiveAlt';
    case PrimitiveType.VerticalArea:
      return 'Perspective';
    case PrimitiveType.Box:
      return 'Cube';
    case PrimitiveType.Cylinder:
      return 'CylinderArbitrary';
    case PrimitiveType.VerticalCylinder:
      return 'CylinderVertical';
    case PrimitiveType.HorizontalCylinder:
      return 'CylinderHorizontal';
    case PrimitiveType.None:
      return 'Cursor';
    default:
      throw new Error('Unrecognized PrimitiveType');
  }
}
