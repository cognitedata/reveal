/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { fitCameraToBoundingBox, toThreeJsBox3, toThreeVector3 } from '../../../views/threejs/utilities';
import { Box3 } from '../../../utils/Box3';
import { vec3, mat4 } from 'gl-matrix';
import { SectorModelTransformation } from '../../../models/cad/types';

describe('fitCameraToBoundingBox', () => {
  test('unit boundingbox, camera is placed outside box', () => {
    // Arrange
    const unitBox = new Box3([vec3.fromValues(-1, -1, -1), vec3.fromValues(1, 1, 1)]);
    const camera = new THREE.Camera();
    const threeBox = toThreeJsBox3(new THREE.Box3(), unitBox);

    // Act
    fitCameraToBoundingBox(camera, unitBox);
    camera.updateMatrixWorld();

    // Assert
    expect(threeBox.distanceToPoint(camera.position)).toBeGreaterThan(1);
    const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const viewDirIntersectsBox = new THREE.Ray(camera.position, lookDir).intersectsBox(threeBox);
    expect(viewDirIntersectsBox).toBeTruthy();
  });
});

describe('toThreeVector3', () => {
  test('modifies provided out parameter', () => {
    const out = new THREE.Vector3();
    const result = toThreeVector3(out, vec3.fromValues(1.0, 2.0, 3.0));
    expect(result).toStrictEqual(out);
    expect(out).toStrictEqual(new THREE.Vector3(1.0, 2.0, 3.0));
  });

  test('applies model transformation matrix', () => {
    const transform: SectorModelTransformation = {
      inverseModelMatrix: mat4.identity(mat4.create()),
      modelMatrix: mat4.fromScaling(mat4.create(), [2.0, 3.0, 4.0])
    };
    const result = toThreeVector3(new THREE.Vector3(), vec3.fromValues(1.0, 1.0, 1.0), transform);

    expect(result).toStrictEqual(new THREE.Vector3(2.0, 3.0, 4.0));
  });
});
