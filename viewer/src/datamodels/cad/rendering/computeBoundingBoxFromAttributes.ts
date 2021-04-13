/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';

const computeBoundingBoxFromCenterAndRadiusAttributesVars = {
  centerA: new THREE.Vector3(),
  centerB: new THREE.Vector3(),
  sphere: new THREE.Sphere(),
  box: new THREE.Box3()
};

export function computeBoundingBoxFromCenterAndRadiusAttributes(
  centerAattribute: ParsePrimitiveAttribute,
  centerBattribute: ParsePrimitiveAttribute,
  radiusAattribute: ParsePrimitiveAttribute,
  radiusBattribute: ParsePrimitiveAttribute,
  attributeFloatValues: Float32Array,
  elementSize: number,
  elementIndex: number,
  out: THREE.Box3
): THREE.Box3 {
  const { centerA, centerB, sphere, box } = computeBoundingBoxFromCenterAndRadiusAttributesVars;
  out.makeEmpty();

  function readAttribute(attribute: ParsePrimitiveAttribute, idx: number = 0): number {
    const offset = (elementIndex * elementSize + attribute.offset) / attributeFloatValues.BYTES_PER_ELEMENT;
    return attributeFloatValues[offset + idx];
  }

  centerA.set(
    readAttribute(centerAattribute, 0),
    readAttribute(centerAattribute, 1),
    readAttribute(centerAattribute, 2)
  );
  centerB.set(
    readAttribute(centerBattribute, 0),
    readAttribute(centerBattribute, 1),
    readAttribute(centerBattribute, 2)
  );
  const radiusA = readAttribute(radiusAattribute);
  const radiusB = readAttribute(radiusBattribute);

  // Note! Not the tighest fit we could make, works ok for now but could be improved by
  // using normal of each cap to determine exact end points of the top/bottom
  sphere.set(centerA, radiusA);
  sphere.getBoundingBox(out);
  sphere.set(centerB, radiusB);
  sphere.getBoundingBox(box);
  out.expandByPoint(box.min);
  out.expandByPoint(box.max);
  return out;
}

const computeBoundingBoxFromInstanceMatrixAttributesVars = {
  instanceMatrix: new THREE.Matrix4()
};

export function computeBoundingBoxFromInstanceMatrixAttributes(
  instanceMatrixAttribute: ParsePrimitiveAttribute,
  attributeFloatValues: Float32Array,
  elementSize: number,
  elementIndex: number,
  baseBoundingBox: THREE.Box3,
  out: THREE.Box3
): THREE.Box3 {
  const { instanceMatrix } = computeBoundingBoxFromInstanceMatrixAttributesVars;

  const offset = (elementIndex * elementSize + instanceMatrixAttribute.offset) / attributeFloatValues.BYTES_PER_ELEMENT;
  // Note! set() accepts row-major, stored column-major
  instanceMatrix.set(
    attributeFloatValues[offset + 0],
    attributeFloatValues[offset + 4],
    attributeFloatValues[offset + 8],
    attributeFloatValues[offset + 12],

    attributeFloatValues[offset + 1],
    attributeFloatValues[offset + 5],
    attributeFloatValues[offset + 9],
    attributeFloatValues[offset + 13],

    attributeFloatValues[offset + 2],
    attributeFloatValues[offset + 6],
    attributeFloatValues[offset + 10],
    attributeFloatValues[offset + 14],

    attributeFloatValues[offset + 3],
    attributeFloatValues[offset + 7],
    attributeFloatValues[offset + 11],
    attributeFloatValues[offset + 15]
  );
  out.copy(baseBoundingBox).applyMatrix4(instanceMatrix);
  return out;
}
