/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { vec3 } from 'gl-matrix';
import { toThreeJsBox3, toThreeVector3, Box3 } from '../../../utilities';

describe('toThreeVector3', () => {
  test('modifies provided out parameter', () => {
    const out = new THREE.Vector3();
    const result = toThreeVector3(out, vec3.fromValues(1.0, 2.0, 3.0));
    expect(result).toStrictEqual(out);
    expect(out).toStrictEqual(new THREE.Vector3(1.0, 2.0, 3.0));
  });
});

describe('toThreeJsBox3', () => {
  test('modifies out parameter', () => {
    // Arrange
    const out = new THREE.Box3();
    const inputBox = new Box3([vec3.fromValues(-1.0, -1.0, -1.0), vec3.fromValues(1.0, 1.0, 1.0)]);

    // Act
    const result = toThreeJsBox3(out, inputBox);

    // Assert
    expect(result).toStrictEqual(out);
    expect(out).toStrictEqual(new THREE.Box3(new THREE.Vector3(-1.0, -1.0, -1.0), new THREE.Vector3(1.0, 1.0, 1.0)));
  });
});
