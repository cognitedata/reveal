/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3 } from 'three';

export type GetPickedPointByPixelCoordinates = (pixelX: number, pixelY: number) => Promise<Vector3>;
