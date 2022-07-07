/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from '../../styling/StylableObject';

import * as THREE from 'three';

export function computeObjectIdBuffer(
  positionBuffer: Float32Array,
  objectList: StylableObject[],
  pointOffset: THREE.Vector3
): ArrayBuffer {
  const numPoints = positionBuffer.length / 3;
  const rawObjectIdBuffer = new ArrayBuffer(2 * numPoints);
  const objectIdBufferView = new Uint16Array(rawObjectIdBuffer);

  for (let i = 0; i < objectIdBufferView.length; i++) {
    const position = new THREE.Vector3().fromArray(positionBuffer.slice(3 * i, 3 * (i + 1))).add(pointOffset);


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
