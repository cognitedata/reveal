/*!
 * Copyright 2022 Cognite AS
 */

import { IRawShape, ShapeType } from './IRawShape';

import { IShape } from './IShape';
import { RawCylinder, Cylinder } from './Cylinder';
import { RawCompositeShape, CompositeShape } from './CompositeShape';
import { Box, RawBox } from './Box';

import * as THREE from 'three';

export function fromRawShape(rawShape: IRawShape): IShape {
  switch (rawShape.type) {
    case ShapeType.Cylinder:
      const rawCylinder = rawShape as RawCylinder;
      return new Cylinder(
        new THREE.Vector3().fromArray(rawCylinder.centerA),
        new THREE.Vector3().fromArray(rawCylinder.centerB),
        rawCylinder.radius
      );
    case ShapeType.Box:
      const rawBox = rawShape as RawBox;
      return new Box(new THREE.Matrix4().fromArray(rawBox.invMatrix.data).transpose());
    case ShapeType.Composite:
      const rawComposite = rawShape as RawCompositeShape;
      return new CompositeShape(rawComposite.shapes.map(fromRawShape));
    default:
      throw Error(`Could not recognize raw shape type ${rawShape.type}`);
  }
}
