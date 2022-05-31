/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './styling/shapes/IShape';
import { Cylinder } from './styling/shapes/Cylinder';

import * as THREE from 'three';
import { Box } from './styling/shapes/Box';

import { createInvertedRevealTransformationFromCdfTransformation } from './styling/shapes/linalg';

export class CylinderPrimitive {
  constructor(public centerA: THREE.Vector3, public centerB: THREE.Vector3, public radius: number) {}

  transformToShape(): IShape {
    return new Cylinder(
      [this.centerA.x, this.centerA.y, this.centerA.z],
      [this.centerB.x, this.centerB.y, this.centerB.z],
      this.radius
    );
  }
}

export class BoxPrimitive {
  constructor(public instanceMatrix: THREE.Matrix4) {}

  transformToShape(): IShape {
    const rawMatrix = { data: this.instanceMatrix.clone().transpose().toArray() };
    const invertedMatrix = createInvertedRevealTransformationFromCdfTransformation(rawMatrix);
    return new Box(invertedMatrix);
  }
}

export type Geometry = CylinderPrimitive | BoxPrimitive;

export type BoundingVolume = {
  annotationId: number;
  region: Geometry[];
};
