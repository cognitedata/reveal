/*!
 * Copyright 2022 Cognite AS
 */

import { Box } from './Box';

import * as THREE from 'three';

describe(Box.name, () => {
  test('constructing box does not throw error', () => {
    expect(() => {
      new Box(new THREE.Matrix4());
    }).not.toThrow();
  });

  test('origin is within identity box', () => {
    const box = new Box(new THREE.Matrix4());

    expect(box.containsPoint(new THREE.Vector3(0, 0, 0))).toBeTrue();
  });

  test('point [1, 1, 1] is not within identity box', () => {
    const box = new Box(new THREE.Matrix4());

    expect(box.containsPoint(new THREE.Vector3(1, 1, 1))).toBeFalse();
  });
});
