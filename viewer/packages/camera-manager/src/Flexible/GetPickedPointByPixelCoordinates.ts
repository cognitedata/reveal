/*!
 * Copyright 2024 Cognite AS
 */

import type { Vector2, Vector3 } from 'three';

export type GetPickedPointByPixelCoordinates = (position: Vector2) => Promise<Vector3>;
