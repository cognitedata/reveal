/*!
 * Copyright 2021 Cognite AS
 */

import { Vector2 } from 'three';

export function getPixelCoordinatesToNormalized(domElement: HTMLElement, pixelX: number, pixelY: number): Vector2 {
  const x = (pixelX / domElement.clientWidth) * 2 - 1;
  const y = (pixelY / domElement.clientHeight) * -2 + 1;
  return new Vector2(x, y);
}
