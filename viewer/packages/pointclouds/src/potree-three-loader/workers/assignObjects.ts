/*!
 * Copyright 2022 Cognite AS
 */

import { StyledObject } from '../../styling/StyledObject';
import { Vec3, v3Add } from '../../styling/shapes/linalg';

export function computeObjectIdBuffer(
  positionBuffer: Float32Array,
  objectList: StyledObject[],
  pointOffset: Vec3
): ArrayBuffer {
  const numPoints = positionBuffer.length / 3;
  const rawObjectIdBuffer = new ArrayBuffer(2 * numPoints);
  const objectIdBuffer = new Uint16Array(rawObjectIdBuffer);

  for (let i = 0; i < objectIdBuffer.length; i++) {
    // 0 is default / unassigned value
    objectIdBuffer[i] = 0;

    const position: Vec3 = v3Add(
      [positionBuffer[3 * i + 0], positionBuffer[3 * i + 1], positionBuffer[3 * i + 2]],
      pointOffset
    );

    for (const obj of objectList) {
      if (obj.shape.containsPoint(position)) {
        objectIdBuffer[i] = obj.objectId;
        break;
      }
    }
  }

  return rawObjectIdBuffer;
}
