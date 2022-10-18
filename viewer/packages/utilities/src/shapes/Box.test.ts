/*!
 * Copyright 2022 Cognite AS
 */

import { Box } from './Box';

import { Matrix4, Vector3 } from 'three';

const EPSILON = 1e-4;

describe(Box.name, () => {
  test('bounding box for unit box is unit box', () => {
    const box = new Box(new Matrix4().identity());
    const boundingBox = box.createBoundingBox();

    expect(boundingBox.min.distanceTo(new Vector3(-0.5, -0.5, -0.5))).toBeLessThan(EPSILON);
    expect(boundingBox.max.distanceTo(new Vector3(0.5, 0.5, 0.5))).toBeLessThan(EPSILON);
  });
});
