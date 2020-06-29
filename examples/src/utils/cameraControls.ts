/*!
 * Copyright 2020 Cognite AS
 */

import CameraControls from 'camera-controls';
import * as holdEvent from 'hold-event';
import * as THREE from 'three';

export function addWASDHandling(cameraControls: CameraControls) {
  const KEYCODE = {
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
  };

  const wKey = new holdEvent.KeyboardKeyHold(KEYCODE.W, 100);
  const aKey = new holdEvent.KeyboardKeyHold(KEYCODE.A, 100);
  const sKey = new holdEvent.KeyboardKeyHold(KEYCODE.S, 100);
  const dKey = new holdEvent.KeyboardKeyHold(KEYCODE.D, 100);
  aKey.addEventListener('holding', function (event: any) {
    cameraControls.truck(-0.05 * event.deltaTime, 0, true);
  });
  dKey.addEventListener('holding', function (event: any) {
    cameraControls.truck(0.05 * event.deltaTime, 0, true);
  });
  wKey.addEventListener('holding', function (event: any) {
    cameraControls.forward(0.05 * event.deltaTime, true);
  });
  sKey.addEventListener('holding', function (event: any) {
    cameraControls.forward(-0.05 * event.deltaTime, true);
  });

  const leftKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_LEFT, 100);
  const rightKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_RIGHT, 100);
  const upKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_UP, 100);
  const downKey = new holdEvent.KeyboardKeyHold(KEYCODE.ARROW_DOWN, 100);
  leftKey.addEventListener('holding', function (event: any) {
    cameraControls.rotate(
      -0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime,
      0,
      true
    );
  });
  rightKey.addEventListener('holding', function (event: any) {
    cameraControls.rotate(
      0.1 * THREE.MathUtils.DEG2RAD * event.deltaTime,
      0,
      true
    );
  });
  upKey.addEventListener('holding', function (event: any) {
    cameraControls.rotate(
      0,
      -0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime,
      true
    );
  });
  downKey.addEventListener('holding', function (event: any) {
    cameraControls.rotate(
      0,
      0.05 * THREE.MathUtils.DEG2RAD * event.deltaTime,
      true
    );
  });
}
