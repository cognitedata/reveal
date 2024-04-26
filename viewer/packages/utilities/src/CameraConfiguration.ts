/*!
 * Copyright 2021 Cognite AS
 */

import type { Vector3 } from 'three';

/**
 * Represents a camera configuration, consisting of a camera position and target.
 */
export type CameraConfiguration = {
  readonly position: Vector3;
  readonly target: Vector3;
};
