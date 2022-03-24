/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { CameraManagerHelper } from '../src/CameraManagerHelper';

describe(CameraManagerHelper.name, () => {
  const camera = new THREE.PerspectiveCamera();

  beforeEach(() => {
    // Reset camera position and rotation for each test
    camera.position.set(0, 0, 0);
    camera.quaternion.identity();
  });

  test('calculateNewTargetFromRotation rotates the target 180 degrees by corresponding rotation', () => {
    // default camera target when camera has "identity" rotation
    const target = new THREE.Vector3(0, 0, -1);
    // creates rotation around Y axis of 180 degrees.
    const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

    const newTarget = CameraManagerHelper.calculateNewTargetFromRotation(camera, rotation, target);

    expect(newTarget.x).toBeCloseTo(target.x);
    expect(newTarget.y).toBeCloseTo(target.y);
    expect(newTarget.z).toBeCloseTo(-target.z);
  });
});
