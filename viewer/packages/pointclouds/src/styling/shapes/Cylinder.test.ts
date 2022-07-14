/*!
 * Copyright 2022 Cognite AS
 */

import { Cylinder } from './Cylinder';

import * as THREE from 'three';

describe(Cylinder.name, () => {
  test('constructing cylinder does not throw', () => {
    expect(() => {
      new Cylinder(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 1);
    }).not.toThrow();
  });

  test('origin is within cylinder at origin', () => {
    const cylinder = new Cylinder(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0), 1);

    expect(cylinder.containsPoint(new THREE.Vector3(0, 0, 0))).toBeTrue();
  });

  test('origin is outside cylinder away from origin', () => {
    const cylinder = new Cylinder(new THREE.Vector3(0, -1, 2), new THREE.Vector3(0, 1, 2), 1);

    expect(cylinder.containsPoint(new THREE.Vector3(0, 0, 0))).toBeFalse();
  });
});
