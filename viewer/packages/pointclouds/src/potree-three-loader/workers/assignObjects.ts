/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from '../../styling/StylableObject';

import * as THREE from 'three';

import { BvhElement } from '../../bvh/BvhElement';
import { BoundingVolumeHierarchy } from '../../bvh/BoundingVolumeHierarchy';

class StylableObjectBvhElement implements BvhElement {
  _cachedBox: THREE.Box3 | undefined;

  constructor(public stylableObject: StylableObject) {}

  getBox(): THREE.Box3 {
    if (!this._cachedBox) {
      this._cachedBox = this.stylableObject.shape.createBoundingBox();
    }

    return this._cachedBox!;
  }
}

export function computeObjectIdBuffer(
  positionBuffer: Float32Array,
  objectList: StylableObject[],
  pointOffset: THREE.Vector3
): ArrayBuffer {
  const bvhElements = objectList.map(obj => new StylableObjectBvhElement(obj));
  const bvh = new BoundingVolumeHierarchy(bvhElements);

  const numPoints = positionBuffer.length / 3;
  const rawObjectIdBuffer = new ArrayBuffer(2 * numPoints);
  const objectIdBufferView = new Uint16Array(rawObjectIdBuffer);

  for (let i = 0; i < objectIdBufferView.length; i++) {
    const position = new THREE.Vector3().fromArray(positionBuffer.slice(3 * i, 3 * (i + 1))).add(pointOffset);

    const elements = bvh.findContainingElements(position);

    for (const element of elements) {
      if (element.stylableObject.shape.containsPoint(position)) {
        // NB: We use the first object that is found to contain the point
        objectIdBufferView[i] = element.stylableObject.objectId;
        break;
      }
    }
  }

  return rawObjectIdBuffer;
}
