/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';
import assert from 'assert';
import {
  computeBoundingBoxFromCenterAndRadiusAttributes,
  computeBoundingBoxFromInstanceMatrixAttributes,
  computeBoundingBoxFromVertexAttributes
} from './computeBoundingBoxFromAttributes';

function filterPrimitivesOutsideClipBox(
  attributesByteValues: Uint8Array,
  attributes: Map<string, ParsePrimitiveAttribute>,
  clipBox: THREE.Box3,
  getBoundsOfElementsCallback: (
    index: number,
    elementSize: number,
    attributeFloatValues: Float32Array,
    outBox: THREE.Box3
  ) => void
): Uint8Array {
  const elementSize = Array.from(attributes.values()).reduce((a, b) => a + b.size, 0);
  const elementCount = attributesByteValues.length / elementSize;
  const attributeFloatValues = new Float32Array(attributesByteValues.buffer);

  const instanceBbox = new THREE.Box3();

  const filteredByteValues = new Uint8Array(attributesByteValues.length);
  let filteredCount = 0;
  for (let i = 0; i < elementCount; ++i) {
    getBoundsOfElementsCallback(i, elementSize, attributeFloatValues, instanceBbox);

    if (clipBox.intersectsBox(instanceBbox)) {
      const elementValues = attributesByteValues.slice(i * elementSize, (i + 1) * elementSize);
      filteredByteValues.set(elementValues, filteredCount * elementSize);
      filteredCount++;
    }
  }

  console.log('filtered', elementCount, 'to', filteredCount, 'primitives');
  return filteredByteValues.slice(0, filteredCount * elementSize);
}

export function filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
  attributesByteValues: Uint8Array,
  attributes: Map<string, ParsePrimitiveAttribute>,
  baseBox: THREE.Box3,
  clipBox: THREE.Box3 | undefined
): Uint8Array {
  if (clipBox === undefined) {
    return attributesByteValues;
  }
  const instanceMatrixAttribute = attributes.get('instanceMatrix');
  assert(instanceMatrixAttribute !== undefined);
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    attributes,
    clipBox,
    (index, elementSize, attributeFloatValues, outBox) => {
      computeBoundingBoxFromInstanceMatrixAttributes(
        instanceMatrixAttribute,
        attributeFloatValues,
        elementSize,
        index,
        baseBox,
        outBox
      );
    }
  );
}

export function filterPrimitivesOutsideClipBoxByCenterAndRadius(
  attributesByteValues: Uint8Array,
  attributes: Map<string, ParsePrimitiveAttribute>,
  clipBox: THREE.Box3 | undefined,
  radiusAattributeName: string = 'radiusA',
  radiusBattributeName: string = 'radiusB'
): Uint8Array {
  if (clipBox === undefined) {
    return attributesByteValues;
  }

  const centerAattribute = attributes.get('centerA');
  const centerBattribute = attributes.get('centerB');
  const radiusAattribute = attributes.get(radiusAattributeName);
  const radiusBattribute = attributes.get(radiusBattributeName);
  assert(
    centerAattribute !== undefined &&
      centerBattribute !== undefined &&
      radiusAattribute !== undefined &&
      radiusBattribute !== undefined
  );
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    attributes,
    clipBox,
    (index, elementSize, attributeFloatValues, outBox) => {
      computeBoundingBoxFromCenterAndRadiusAttributes(
        centerAattribute,
        centerBattribute,
        radiusAattribute,
        radiusBattribute,
        attributeFloatValues,
        elementSize,
        index,
        outBox
      );
    }
  );
}

export function filterPrimitivesOutsideClipBoxByVertices(
  attributesByteValues: Uint8Array,
  attributes: Map<string, ParsePrimitiveAttribute>,
  clipBox: THREE.Box3 | undefined
): Uint8Array {
  if (clipBox === undefined) {
    return attributesByteValues;
  }

  const vertex1attribute = attributes.get('vertex1');
  const vertex2attribute = attributes.get('vertex2');
  const vertex3attribute = attributes.get('vertex3');
  const vertex4attribute = attributes.get('vertex4');
  assert(
    vertex1attribute !== undefined &&
      vertex2attribute !== undefined &&
      vertex3attribute !== undefined &&
      vertex4attribute !== undefined
  );
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    attributes,
    clipBox,
    (index, elementSize, attributeFloatValues, outBox) => {
      computeBoundingBoxFromVertexAttributes(
        vertex1attribute,
        vertex2attribute,
        vertex3attribute,
        vertex4attribute,
        attributeFloatValues,
        elementSize,
        index,
        outBox
      );
    }
  );
}
