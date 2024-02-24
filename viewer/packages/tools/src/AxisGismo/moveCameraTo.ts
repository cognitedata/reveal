/*
 * Copyright 2024 Cognite AS
 */

import { Matrix4, Quaternion, Vector3 } from 'three';
import TWEEN from '@tweenjs/tween.js';
import { CameraManager } from '@reveal/camera-manager';

export function moveCameraTo(
  cameraManager: CameraManager,
  position: Vector3,
  direction: Vector3,
  upAxis: Vector3,
  duration: number
): void {
  const { position: currentCameraPosition, target, rotation } = cameraManager.getCameraState();

  const offsetInCameraSpace = currentCameraPosition.clone().sub(target).applyQuaternion(rotation.clone().conjugate());

  // Create a new rotation from the direction and up axis
  const forward = direction.clone();
  const up = upAxis.clone();
  const right = up.clone().cross(forward);

  const toRotation = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right, up, forward));
  const fromRotation = rotation.clone();

  const epsilon = 1e-6;
  if (fromRotation.angleTo(toRotation) < epsilon) {
    return;
  }

  const tmpPosition = new Vector3();
  const tmpRotation = new Quaternion();

  const from = { t: 0 };
  const to = { t: 1 };
  const animation = new TWEEN.Tween(from);
  const tween = animation
    .to(to, duration)
    .onUpdate(() => {
      tmpRotation.slerpQuaternions(fromRotation, toRotation, from.t);
      tmpPosition.copy(offsetInCameraSpace);
      tmpPosition.applyQuaternion(tmpRotation);
      tmpPosition.add(target);
      cameraManager.setCameraState({ position: tmpPosition, rotation: tmpRotation });
    })
    .onComplete(() => {
      cameraManager.setCameraState({ position: tmpPosition, rotation: toRotation });
      cameraManager.setCameraState({ position, target });
    })
    .start(TWEEN.now());
  tween.update(TWEEN.now());
}
