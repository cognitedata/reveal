/*!
 * Copyright 2022 Cognite AS
 */

import { Cylinder } from './Cylinder';
import { Vector3 } from 'three';

const EPSILON = 1e-4;

describe(Cylinder.name, () => {
  test('bounding box for unit cylinder is unit box', () => {
    const cylinder = new Cylinder(new Vector3(0.0, -0.5, 0.0),
      new Vector3(0.0, 0.5, 0.0),
      0.5);
    const box = cylinder.createBoundingBox();


    expect(box.min.distanceTo(new Vector3(-0.5, -0.5, -0.5))).toBeLessThan(EPSILON);
    expect(box.max.distanceTo(new Vector3(0.5, 0.5, 0.5))).toBeLessThan(EPSILON);
  });
});
