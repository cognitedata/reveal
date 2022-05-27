/*!
 * Copyright 2022 Cognite AS
 */

import { IShape } from './styling/shapes/IShape';
import { Cylinder } from './styling/shapes/Cylinder';

import * as THREE from 'three';
import { Box } from './styling/shapes/Box';

import { createInvertedRevealTransformationFromCdfTransformation } from './styling/shapes/linalg';

export class CylinderPrimitive {

  constructor(public center_a: THREE.Vector3, public center_b: THREE.Vector3, public radius: number) { }

  transformToShape(): IShape {
    return new Cylinder(
      [this.center_a.x, this.center_a.y, this.center_a.z],
      [this.center_b.x, this.center_b.y, this.center_b.z],
      this.radius);
  }
};

export class BoxPrimitive {
  constructor(public instanceMatrix: THREE.Matrix4) { }

  transformToShape(): IShape {
    const rawMatrix = { data: this.instanceMatrix.clone().transpose().toArray() };
    const invertedMatrix = createInvertedRevealTransformationFromCdfTransformation(rawMatrix);
    return new Box(invertedMatrix);
  }
};

export type Geometry = CylinderPrimitive | BoxPrimitive;

export type BoundingVolume = {
  annotationId: number;
  region: Geometry[];
};
