/*!
 * Copyright 2026 Cognite AS
 */

import type { Camera } from 'three';
import { Vector3 } from 'three';

export const CAD_LIGHT_WORLD = new Vector3(0.55, 0.58, 0.4).normalize();
export const CAD_SHADOW_STRENGTH = 0.4;

export function cadLightDirectionView(camera: Camera, target: Vector3): Vector3 {
  return target.copy(CAD_LIGHT_WORLD).transformDirection(camera.matrixWorldInverse).normalize();
}

export function cadUpDirectionView(camera: Camera, target: Vector3): Vector3 {
  return target.set(0, 1, 0).transformDirection(camera.matrixWorldInverse).normalize();
}
