/*!
 * Copyright 2024 Cognite AS
 */

import { PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';
import TWEEN from '@tweenjs/tween.js';

import { FlexibleCameraManager } from './FlexibleCameraManager';
import clamp from 'lodash/clamp';
import { FlexibleWheelZoomType } from './FlexibleWheelZoomType';

//================================================
// INSTANCE METHODS: Move camera
//================================================

export function moveCameraPositionAndTargetTo(
  manager: FlexibleCameraManager,
  position: Vector3,
  target: Vector3,
  duration?: number
): void {
  if (manager.isDisposed) {
    return;
  }
  duration = duration ?? getDefaultDuration(target.distanceTo(manager.camera.position));
  const startTarget = getAnimationStartTarget(manager.camera, target);
  const cameraPosition = manager.camera.position;
  const from = {
    x: cameraPosition.x,
    y: cameraPosition.y,
    z: cameraPosition.z,
    targetX: startTarget.x,
    targetY: startTarget.y,
    targetZ: startTarget.z
  };
  const to = {
    x: position.x,
    y: position.y,
    z: position.z,
    targetX: target.x,
    targetY: target.y,
    targetZ: target.z
  };

  const tempTarget = new Vector3();
  const tempPosition = new Vector3();
  manager.controls.temporarlyDisableKeyboard = true;

  const { tween, stopTween } = createTweenAnimation(manager, from, to, duration);

  tween
    .onUpdate(() => {
      if (manager.isDisposed) {
        return;
      }
      tempPosition.set(from.x, from.y, from.z);
      tempTarget.set(from.targetX, from.targetY, from.targetZ);
      manager.setPositionAndTarget(tempPosition, tempTarget);
    })
    .onStop(() => {
      manager.controls.temporarlyDisableKeyboard = false;
      manager.setPositionAndTarget(tempPosition, tempTarget);
    })
    .onComplete(() => {
      manager.controls.temporarlyDisableKeyboard = false;
      if (manager.isDisposed) {
        return;
      }
      manager.domElement.removeEventListener('pointerdown', stopTween);
    })
    .start(TWEEN.now());
}

export function moveCameraPositionTo(manager: FlexibleCameraManager, position: Vector3, duration: number): void {
  if (manager.isDisposed) {
    return;
  }
  const cameraPosition = manager.camera.position;
  const from = {
    x: cameraPosition.x,
    y: cameraPosition.y,
    z: cameraPosition.z
  };
  const to = {
    x: position.x,
    y: position.y,
    z: position.z
  };

  const tempPosition = new Vector3();
  manager.controls.temporarlyDisableKeyboard = true;

  const { tween, stopTween } = createTweenAnimation(manager, from, to, duration, false);

  tween
    .onUpdate(() => {
      if (manager.isDisposed) {
        return;
      }
      tempPosition.set(from.x, from.y, from.z);
      manager.setPosition(tempPosition);
    })
    .onStop(() => {
      manager.controls.temporarlyDisableKeyboard = false;
      manager.setPosition(tempPosition);
    })
    .onComplete(() => {
      manager.setPosition(position);
      manager.controls.temporarlyDisableKeyboard = false;
      if (manager.isDisposed) {
        return;
      }
      manager.domElement.removeEventListener('pointerdown', stopTween);
    })
    .start(TWEEN.now());
}

export function moveCameraTargetTo(manager: FlexibleCameraManager, target: Vector3, duration?: number): void {
  if (manager.isDisposed) {
    return;
  }
  if (duration === 0) {
    manager.setPositionAndTarget(manager.camera.position, target);
    return;
  }
  duration = duration ?? getDefaultDuration(target.distanceTo(manager.camera.position));

  const startTarget = getAnimationStartTarget(manager.camera, target);
  const from = {
    targetX: startTarget.x,
    targetY: startTarget.y,
    targetZ: startTarget.z
  };
  const to = {
    targetX: target.x,
    targetY: target.y,
    targetZ: target.z
  };

  const tempTarget = new Vector3();
  manager.controls.temporarlyDisableKeyboard = true;

  const { tween, stopTween } = createTweenAnimation(manager, from, to, duration);

  tween
    .onStart(() => {
      manager.setPositionAndTarget(manager.camera.position, target);
    })
    .onUpdate(() => {
      if (manager.isDisposed) {
        return;
      }
      tempTarget.set(from.targetX, from.targetY, from.targetZ);
      if (!manager.camera) {
        return;
      }
      if (manager.options.realMouseWheelAction === FlexibleWheelZoomType.ToCursor) {
        manager.controls.setScrollCursor(tempTarget);
      } else {
        manager.controls.setScrollCursor(undefined);
      }
      manager.controls.setTempTarget(tempTarget);
    })
    .onStop(() => {
      manager.controls.setTempTarget(undefined);
      manager.controls.temporarlyDisableKeyboard = false;
      manager.setPositionAndTarget(manager.camera.position, tempTarget);
    })
    .onComplete(() => {
      manager.controls.setTempTarget(undefined);
      manager.controls.temporarlyDisableKeyboard = false;
      if (manager.isDisposed) {
        return;
      }
      manager.domElement.removeEventListener('pointerdown', stopTween);
    })
    .start(TWEEN.now());
}

export function tweenCameraToDefaultFov(manager: FlexibleCameraManager, duration: number): Promise<void> {
  const from = { fov: manager.controls.fov };
  const to = { fov: manager.controls.options.defaultFov };
  const delay = duration * 0.25;
  const tween = new TWEEN.Tween(from)
    .to(to, duration * 0.5)
    .onUpdate(() => {
      manager.controls.setFov(from.fov);
    })
    .delay(delay)
    .easing(num => TWEEN.Easing.Quintic.InOut(num))
    .start(TWEEN.now());

  return new Promise(resolve => {
    tween.onComplete(() => {
      tween.stop();
      resolve();
    });
  });
}

function createTweenAnimation<T>(
  manager: FlexibleCameraManager,
  from: T,
  to: T,
  duration: number,
  isCircular: boolean = true
): { tween: TWEEN.Tween; stopTween: (event: Event) => void } {
  const animation = new TWEEN.Tween(from);
  const stopTween = (event: Event) => {
    if (manager.isDisposed) {
      document.removeEventListener('keydown', stopTween);
      animation.stop();
      return;
    }

    if (event.type !== 'keydown' || !manager.controls.temporarlyDisableKeyboard) {
      animation.stop();
      manager.domElement.removeEventListener('pointerdown', stopTween);
      manager.domElement.removeEventListener('wheel', stopTween);
      document.removeEventListener('keydown', stopTween);
    }
  };

  manager.domElement.addEventListener('pointerdown', stopTween);
  manager.domElement.addEventListener('wheel', stopTween);
  document.addEventListener('keydown', stopTween);

  const tween = animation.to(to, duration);
  if (isCircular) {
    tween.easing((x: number) => TWEEN.Easing.Circular.Out(x));
  } else {
    tween.easing((x: number) => TWEEN.Easing.Quintic.InOut(x));
  }
  return { tween, stopTween };
}

const MIN_ANIMATION_DURATION = 300;
const MAX_ANIMATION_DURATION = 1250;

function getDefaultDuration(distanceToCamera: number): number {
  const duration = distanceToCamera * 125; // 125ms per unit distance
  return clamp(duration, MIN_ANIMATION_DURATION, MAX_ANIMATION_DURATION);
}

function getAnimationStartTarget(camera: PerspectiveCamera, newTarget: Vector3): Vector3 {
  const raycaster = new Raycaster();
  raycaster.setFromCamera(new Vector2(), camera);
  const distanceToTarget = newTarget.distanceTo(camera.position);
  const scaledDirection = raycaster.ray.direction.clone().multiplyScalar(distanceToTarget);
  return raycaster.ray.origin.clone().add(scaledDirection);
}
