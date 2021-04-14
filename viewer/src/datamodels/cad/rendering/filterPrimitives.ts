/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';
import assert from 'assert';
import {
  computeBoundingBoxFromCenterAndRadiusAttributes,
  computeBoundingBoxFromEllipseAttributes,
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
  const elementSize = Array.from(attributes.values()).reduce((a, b) => Math.max(a, b.offset + b.size), 0);
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
  return filteredByteValues.slice(0, filteredCount * elementSize);
}

export function filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
  attributesByteValues: Uint8Array,
  attributes: Map<string, ParsePrimitiveAttribute>,
  baseBox: THREE.Box3,
  geometryClipBox: THREE.Box3 | null
): Uint8Array {
  if (geometryClipBox === null) {
    return attributesByteValues;
  }
  const instanceMatrixAttribute = attributes.get('instanceMatrix');
  assert(instanceMatrixAttribute !== undefined);
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    attributes,
    geometryClipBox,
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
  geometryClipBox: THREE.Box3 | null,
  radiusAattributeName: string = 'radiusA',
  radiusBattributeName: string = 'radiusB'
): Uint8Array {
  if (geometryClipBox === null) {
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
    geometryClipBox,
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
  geometryClipBox: THREE.Box3 | null
): Uint8Array {
  if (geometryClipBox === null) {
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
    geometryClipBox,
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

export function filterPrimitivesOutsideClipBoxByEllipse(
  attributesByteValues: Uint8Array,
  attributes: Map<string, ParsePrimitiveAttribute>,
  geometryClipBox: THREE.Box3 | null,
  radius1AttributeName: string = 'horizontalRadius',
  radius2AttributeName: string = 'verticalRadius'
): Uint8Array {
  if (geometryClipBox === null) {
    return attributesByteValues;
  }
  const centerAttribute = attributes.get('center');
  const horizontalRadiusAttribute = attributes.get(radius1AttributeName);
  const verticalRadiusAttribute = attributes.get(radius2AttributeName);
  const heightAttribute = attributes.get('height');
  assert(
    centerAttribute !== undefined &&
      horizontalRadiusAttribute !== undefined &&
      verticalRadiusAttribute !== undefined &&
      heightAttribute !== undefined
  );
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    attributes,
    geometryClipBox,
    (index, elementSize, attributeFloatValues, outBox) => {
      computeBoundingBoxFromEllipseAttributes(
        centerAttribute,
        horizontalRadiusAttribute,
        verticalRadiusAttribute,
        heightAttribute,
        attributeFloatValues,
        elementSize,
        index,
        outBox
      );
    }
  );
}
