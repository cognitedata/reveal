/*!
 * Copyright 2022 Cognite AS
 */

// import { toThreeBox3, toThreeVector3, assertNever } from '@reveal/utilities';
// import * as THREE from 'three';

import { IRawShape } from './IRawShape';

import { IShape } from './IShape';
import { RawCylinder, Cylinder } from './Cylinder';
import { RawAxisAlignedBox, AxisAlignedBox } from './AxisAlignedBox';
import { RawCompositeShape, CompositeShape } from './CompositeShape';
import { Box, RawBox } from './Box';

export function fromRawShape(rawShape: IRawShape): IShape {
  switch (rawShape.type) {
    case 'cylinder':
      const rawCylinder = rawShape as RawCylinder;
      return new Cylinder(rawCylinder.centerA, rawCylinder.centerB, rawCylinder.radius);
    case 'aabb':
      const rawAabb = rawShape as RawAxisAlignedBox;
      return new AxisAlignedBox(rawAabb.box);
    case 'box':
      const rawBox = rawShape as RawBox;
      return new Box(rawBox.invMatrix.data, true);
    case 'composite':
      const rawComposite = rawShape as RawCompositeShape;
      return new CompositeShape(rawComposite.shapes.map(fromRawShape));
    default:
      // assertNever(rawShape.type);
      console.error('Unsupported RawShape type');
  }
}
