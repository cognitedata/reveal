/*!
 * Copyright 2024 Cognite AS
 */

import { Spherical, Vector3 } from 'three';

/**
 * Class for moving the camera from one position to another.
 * Used by animations
 * @beta
 */
export type FlexibleCameraMoveProps = {
  startDirection: Spherical;
  startPosition: Vector3;
  endDirection: Spherical;
  endPosition: Vector3;
  factor: number; // 0 for start, 1 for end
};
