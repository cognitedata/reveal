/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { fitCameraToBoundingBox, toThreeJsBox3 } from '../../../views/threejs/utilities';
import { Box3 } from '../../../utils/Box3';
import { vec3 } from 'gl-matrix';

describe('fitCameraToBoundingBox', () => {
  test('unit boundingbox, camera is placed outside box', () => {
    // Arrange
    const unitBox = new Box3([vec3.fromValues(-1, -1, -1), vec3.fromValues(1, 1, 1)]);
    const camera = new THREE.Camera();
    const threeBox = toThreeJsBox3(unitBox);

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
