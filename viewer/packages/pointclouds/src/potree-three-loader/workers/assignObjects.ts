/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from '../../styling/StylableObject';
import { Vec3, v3Add } from '../../styling/shapes/linalg';

export function computeObjectIdBuffer(
  positionBuffer: Float32Array,
  objectList: StylableObject[],
  pointOffset: Vec3
): ArrayBuffer {
  const numPoints = positionBuffer.length / 3;
  const rawObjectIdBuffer = new ArrayBuffer(2 * numPoints);
  const objectIdBufferView = new Uint16Array(rawObjectIdBuffer);

  for (let i = 0; i < objectIdBufferView.length; i++) {
    const position: Vec3 = v3Add(
      [positionBuffer[3 * i + 0], positionBuffer[3 * i + 1], positionBuffer[3 * i + 2]],
      pointOffset
    );

    for (const obj of objectList) {
      if (obj.shape.containsPoint(position)) {
        // NB: We use the first object that is found to contain the point
        objectIdBufferView[i] = obj.objectId;
        break;
      }
    }
  }

  return rawObjectIdBuffer;
}
