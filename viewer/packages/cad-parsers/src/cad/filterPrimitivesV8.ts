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
} from '../utilities/computeBoundingBoxFromAttributes';

import { filterPrimitivesOutsideClipBox } from './filterPrimitivesCommon';

function elementSizeFromAttributes(attributes: Map<string, ParsePrimitiveAttribute>): number {
  return Array.from(attributes.values()).reduce((a, b) => Math.max(a, b.offset + b.size), 0);
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
  const elementSize = elementSizeFromAttributes(attributes);
  const byteOffset = instanceMatrixAttribute.offset;
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    elementSize,
    geometryClipBox,
    (index, elementSize, attributeFloatValues, outBox) => {
      computeBoundingBoxFromInstanceMatrixAttributes(
        attributeFloatValues,
        byteOffset,
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
  const elementSize = elementSizeFromAttributes(attributes);
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    elementSize,
    geometryClipBox,
    (index, elementSize, attributeFloatValues, outBox) => {
      computeBoundingBoxFromCenterAndRadiusAttributes(
        attributeFloatValues,
        centerAattribute.offset,
        centerBattribute.offset,
        radiusAattribute.offset,
        radiusBattribute.offset,
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
  const elementSize = elementSizeFromAttributes(attributes);
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    elementSize,
    geometryClipBox,
    (index, elementSize, attributeFloatValues, outBox) => {
      computeBoundingBoxFromVertexAttributes(
        vertex1attribute.offset,
        vertex2attribute.offset,
        vertex3attribute.offset,
        vertex4attribute.offset,
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
  const elementSize = elementSizeFromAttributes(attributes);
  return filterPrimitivesOutsideClipBox(
    attributesByteValues,
    elementSize,
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
