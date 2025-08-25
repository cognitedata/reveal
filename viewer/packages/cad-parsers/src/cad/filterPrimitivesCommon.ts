/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export function filterPrimitivesOutsideClipBox(
  attributesByteValues: Uint8Array,
  elementSize: number,
  clipBox: THREE.Box3,
  getBoundsOfElementsCallback: (
    index: number,
    elementSize: number,
    attributeFloatValues: Float32Array,
    outBox: THREE.Box3
  ) => void
): Uint8Array<ArrayBuffer> {
  const elementCount = attributesByteValues.length / elementSize;
  const attributeFloatValues = new Float32Array(
    attributesByteValues.buffer,
    attributesByteValues.byteOffset,
    attributesByteValues.byteLength / Float32Array.BYTES_PER_ELEMENT
  );

  const instanceBbox = new THREE.Box3();

  const filteredByteValues = new Uint8Array(attributesByteValues.length);
  let filteredCount = 0;
  for (let i = 0; i < elementCount; ++i) {
    getBoundsOfElementsCallback(i, elementSize, attributeFloatValues, instanceBbox);

    if (clipBox.intersectsBox(instanceBbox)) {
      const elementValues = attributesByteValues.subarray(i * elementSize, (i + 1) * elementSize);
      filteredByteValues.set(elementValues, filteredCount * elementSize);
      filteredCount++;
    }
  }

  return filteredByteValues.slice(0, filteredCount * elementSize);
}
