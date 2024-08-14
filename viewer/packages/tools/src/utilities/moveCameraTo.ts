/*!
 * Copyright 2021 Cognite AS
 */

import TWEEN from '@tweenjs/tween.js';

import { CameraManager } from '@reveal/camera-manager';
import { Matrix4, Quaternion, Vector3 } from 'three';

export function moveCameraTo(
  cameraManager: CameraManager,
  targetAxis: Vector3,
  targetUpAxis: Vector3,
  duration: number
): void {
  const { position: currentCameraPosition, target: target, rotation } = cameraManager.getCameraState();
  const offsetInCameraSpace = currentCameraPosition.clone().sub(target).applyQuaternion(rotation.clone().conjugate());

  const from = { t: 0 };
  const to = { t: 1 };

  const forward = targetAxis.clone();
  const right = targetUpAxis.clone().cross(forward);
  const toRotation = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(right, targetUpAxis, forward));
  const fromRotation = rotation.clone();

  const epsilon = 1e-6;
  if (fromRotation.angleTo(toRotation) < epsilon) {
    return;
  }
  const tmpPosition = new Vector3();
  const tmpRotation = new Quaternion();
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
      if (targetAxis.y !== 0) {
        // Camera will be looking straight up or down. By making sure the position and target is exactly on top of each other,
        // the camera.lookAt() function used in ComboControls will pick another axis as the up-direction. This happens to coincide
        // with targetUpAxis, but the latter really has no effect on the resulting "up" direction.
        tmpPosition.x = target.x;
        tmpPosition.z = target.z;
      }
      cameraManager.setCameraState({ position: tmpPosition, target: target });
    })
    .start(TWEEN.now());
  TWEEN.add(tween);
  tween.update(TWEEN.now());
}
