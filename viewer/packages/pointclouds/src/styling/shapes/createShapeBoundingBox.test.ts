/*!
 * Copyright 2022 Cognite AS
 */

import { createShapeBoundingBox } from './createShapeBoundingBox';
import { ShapeType } from './IShape';

import * as THREE from 'three';
import { Box } from './Box';
import { Cylinder } from './Cylinder';

const EPSILON = 1e-4;

describe('createShapeBoundingBox', () => {
  test('bounding box for unit box is unit box', () => {
    const box = createShapeBoundingBox({
      shapeType: ShapeType.Box,
      invMatrix: { data: new THREE.Matrix4().identity().toArray() }
    } as Box);

    expect(box.min.distanceTo(new THREE.Vector3(-0.5, -0.5, -0.5))).toBeLessThan(EPSILON);
    expect(box.max.distanceTo(new THREE.Vector3(0.5, 0.5, 0.5))).toBeLessThan(EPSILON);
  });

  test('bounding box for unit cylinder is unit box', () => {
    const box = createShapeBoundingBox({
      shapeType: ShapeType.Cylinder,
      centerA: [0.0, -0.5, 0.0],
      centerB: [0.0, 0.5, 0.0],
      radius: 0.5
    } as Cylinder);

    expect(box.min.distanceTo(new THREE.Vector3(-0.5, -0.5, -0.5))).toBeLessThan(EPSILON);
    expect(box.max.distanceTo(new THREE.Vector3(0.5, 0.5, 0.5))).toBeLessThan(EPSILON);
  });
});
