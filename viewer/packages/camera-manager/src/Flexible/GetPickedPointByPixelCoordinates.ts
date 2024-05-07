/*!
 * Copyright 2024 Cognite AS
 */

import { Vector2, Vector3 } from 'three';

export type GetPickedPointByPixelCoordinates = (position: Vector2) => Promise<Vector3>;
